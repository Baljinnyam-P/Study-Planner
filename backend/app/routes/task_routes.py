# -------------------------------------------------------------
# Why: This file contains endpoints for CRUD operations on individual tasks.
#
# Why this design?
#   - RESTful design makes the API predictable and easy to use from the frontend.
#   - Endpoints are protected by authentication to ensure user data privacy.
#   - Modular route structure allows for future expansion (e.g., task comments).
#   - Task logic is separated from plan logic for clarity 
# -------------------------------------------------------------
"""Minimal routes for personal tasks (CRUD, filters, complete)."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Task
from ..schemas import task_schema, tasks_schema
from datetime import datetime, timedelta

tasks_bp = Blueprint('tasks_bp', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def list_tasks():
    user_id = get_jwt_identity()
    query = Task.query.filter_by(user_id=user_id)
    # Filtering
    completed = request.args.get('completed')
    if completed is not None:
        query = query.filter(Task.completed == (completed.lower() == 'true'))
    priority = request.args.get('priority')
    if priority is not None:
        try:
            query = query.filter(Task.priority == int(priority))
        except ValueError:
            pass
    due_today = request.args.get('due_today')
    if due_today == 'true':
        
        now = datetime.utcnow()
        start = datetime(now.year, now.month, now.day)
        end = start + timedelta(days=1)
        query = query.filter(Task.due_date >= start, Task.due_date < end)
    # Add more filters as needed
    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify(tasks_schema.dump(tasks)), 200

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    errors = task_schema.validate(payload)
    if errors:
        return jsonify({'errors': errors}), 400
    task = Task(
        user_id=user_id,
        title=payload['title'],
        description=payload.get('description',''),
        estimate_minutes=payload.get('estimate_minutes', 30),
        due_date=payload.get('due_date'),
        priority=payload.get('priority', 3),
        completed=payload.get('completed', False)
    )
    db.session.add(task); db.session.commit()
    return jsonify(task_schema.dump(task)), 201

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({'msg':'Not found'}), 404
    return jsonify(task_schema.dump(task)), 200

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({'msg':'Not found'}), 404
    data = request.get_json() or {}
    errors = task_schema.validate(data, partial=True)
    if errors:
        return jsonify({'errors': errors}), 400
    for key in ('title','description','estimate_minutes','priority','completed','due_date'):
        if key in data:
            setattr(task, key, data[key])
    db.session.commit()
    return jsonify(task_schema.dump(task)), 200

# Mark Complete endpoint
@tasks_bp.route('/<int:task_id>/complete', methods=['POST'])
@jwt_required()
def mark_complete(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({'msg':'Not found'}), 404
    task.completed = True
    db.session.commit()
    return jsonify(task_schema.dump(task)), 200

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({'msg':'Not found'}), 404
    db.session.delete(task); db.session.commit()
    return jsonify({'msg':'Deleted'}), 200
