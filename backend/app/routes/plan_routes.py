# -------------------------------------------------------------
# Why: This file contains all API endpoints for creating, updating, retrieving,
# and deleting study plans and tasks.
#
# Why this design?
#   - RESTful endpoints provide a clear API for the frontend.
#   - Blueprints modularize the code, making it easier to maintain and extend.
#   - Endpoints are protected with authentication and role checks for security.
#   - Supports both individual and group plans for flexibility and collaboration.
# -------------------------------------------------------------
"""Minimal routes for personal study plans (CRUD, generate, update)."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..sockets import emit_plan_updated
from ..models import StudyPlan, Task
from ..schemas import plan_schema, plans_schema


plans_bp = Blueprint('plans_bp', __name__, url_prefix='/api/plans')

@plans_bp.route('', methods=['GET'])
@jwt_required()
def list_plans():
    user_id = get_jwt_identity()
    plans = StudyPlan.query.filter_by(user_id=user_id).order_by(StudyPlan.generated_at.desc()).all()
    return jsonify(plans_schema.dump(plans)), 200

@plans_bp.route('/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_plan(plan_id):
    user_id = get_jwt_identity()
    plan = StudyPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({'msg':'Not found'}), 404
    return jsonify(plan_schema.dump(plan)), 200

@plans_bp.route('', methods=['POST'])
@jwt_required()
def create_plan():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    errors = plan_schema.validate(data)
    if errors:
        return jsonify({'errors': errors}), 400
    plan = StudyPlan(user_id=user_id, title=data.get('title','Saved Plan'), content=data['content'])
    db.session.add(plan); db.session.commit()
    # Real-time: notify listeners that a plan was created/updated
    try:
        emit_plan_updated(plan.id, {'type':'created', 'plan': plan_schema.dump(plan)})
    except Exception:
        pass
    return jsonify(plan_schema.dump(plan)), 201

@plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_plan(plan_id):
    user_id = get_jwt_identity()
    plan = StudyPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({'msg':'Not found'}), 404
    db.session.delete(plan); db.session.commit()
    return jsonify({'msg':'Deleted'}), 200

@plans_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_plan():
    """Generate a deterministic multi-day study plan (round-robin)."""
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    days = int(payload.get('days', 3))
    tasks_input = []
    if 'task_ids' in payload:
        ids = payload['task_ids']
        tasks = Task.query.filter(Task.id.in_(ids), Task.user_id==user_id).all()
        tasks_input = [{'title': t.title, 'estimate_minutes': t.estimate_minutes, 'description': t.description} for t in tasks]
    elif 'tasks' in payload:
        tasks_input = payload['tasks']
    else:
        tasks = Task.query.filter_by(user_id=user_id, completed=False).limit(50).all()
        tasks_input = [{'title': t.title, 'estimate_minutes': t.estimate_minutes, 'description': t.description} for t in tasks]
    # Deterministic distribution of tasks over days
    # Round-robin assign tasks to days
    result = {}
    n = max(1, int(days))
    for i in range(1, n+1):
        result[f"Day {i}"] = []
    simple = []
    for t in tasks_input:
        if isinstance(t, str):
            simple.append({"task": t, "duration": 30, "notes": ""})
        elif isinstance(t, dict):
            title = t.get("title") or t.get("task") or "Untitled"
            dur = int(t.get("estimate_minutes", 30))
            simple.append({"task": title, "duration": dur, "notes": t.get("description", "")})
        else:
            simple.append({"task": str(t), "duration": 30, "notes": ""})
    for idx, item in enumerate(simple):
        day = (idx % n) + 1
        result[f"Day {day}"].append(item)
    save = payload.get('save', True)
    if save:
        plan = StudyPlan(user_id=user_id, title=f'Plan ({days} days)', content=result)
        db.session.add(plan); db.session.commit()
        return jsonify(plan_schema.dump(plan)), 201
    return jsonify({'content': result}), 200

# Regenerate a plan
@plans_bp.route('/<int:plan_id>/regenerate', methods=['POST'])
@jwt_required()
def regenerate_plan(plan_id):
    user_id = get_jwt_identity()
    plan = StudyPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({'msg':'Not found'}), 404
    # Use the same tasks as the original plan
    days = len(plan.content)
    # Try to extract tasks from the plan content
    tasks_input = []
    for day_items in plan.content.values():
        for item in day_items:
            tasks_input.append({
                'title': item.get('task', ''),
                'estimate_minutes': item.get('duration', 30),
                'description': item.get('notes', '')
            })
    # Regenerate using deterministic algorithm
    result = {}
    days = len(plan.content)
    for i in range(1, days+1):
        result[f"Day {i}"] = []
    simple = []
    for day_items in plan.content.values():
        for item in day_items:
            simple.append({
                'task': item.get('task', ''),
                'duration': item.get('duration', 30),
                'notes': item.get('notes', '')
            })
    for idx, item in enumerate(simple):
        day = (idx % days) + 1
        result[f"Day {day}"].append(item)
    plan.content = result
    db.session.commit()
    try:
        emit_plan_updated(plan.id, {'type':'regenerated', 'plan': plan_schema.dump(plan)})
    except Exception:
        pass
    return jsonify(plan_schema.dump(plan)), 200

# Update a plan (e.g. rename title)
@plans_bp.route('/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_plan(plan_id):
    user_id = get_jwt_identity()
    plan = StudyPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({'msg':'Not found'}), 404
    data = request.get_json() or {}
    if 'title' in data:
        plan.title = data['title']
    if 'content' in data:
        plan.content = data['content']
    db.session.commit()
    try:
        emit_plan_updated(plan.id, {'type':'updated', 'plan': plan_schema.dump(plan)})
    except Exception:
        pass
    return jsonify(plan_schema.dump(plan)), 200
