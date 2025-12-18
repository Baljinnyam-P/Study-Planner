# -------------------------------------------------------------
# Why: Public read-only access for shared plans using a stable public_id.
# -------------------------------------------------------------
from flask import Blueprint, jsonify, request
from ..models import StudyPlan
from ..extensions import db
from ..schemas import plan_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid

public_bp = Blueprint('public_bp', __name__, url_prefix='/api/public')

@public_bp.route('/plans/<public_id>', methods=['GET'])
def get_public_plan(public_id):
    plan = StudyPlan.query.filter_by(public_id=public_id, is_public=True).first()
    if not plan:
        return jsonify({'msg': 'Not found'}), 404
    # Return a minimal safe representation
    data = plan_schema.dump(plan)
    return jsonify(data), 200

# Authenticated endpoint to toggle sharing for own plan
@public_bp.route('/share/<int:plan_id>', methods=['POST'])
@jwt_required()
def share_plan(plan_id):
    user_id = get_jwt_identity()
    plan = StudyPlan.query.filter_by(id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({'msg': 'Not found'}), 404
    payload = request.get_json() or {}
    make_public = bool(payload.get('is_public', True))
    plan.is_public = make_public
    if make_public and not plan.public_id:
        plan.public_id = str(uuid.uuid4())
    if not make_public:
        plan.public_id = None
    db.session.commit()
    return jsonify({'id': plan.id, 'is_public': plan.is_public, 'public_id': plan.public_id}), 200
