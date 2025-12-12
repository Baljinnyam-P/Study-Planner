"""Group routes for collaborative study groups 
routes:
(create/join/leave/members).

"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import StudyGroup, GroupMembership, User
from ..schemas import study_group_schema, study_groups_schema

study_groups_bp = Blueprint('study_groups_bp', __name__, url_prefix='/api/groups')

@study_groups_bp.route('', methods=['POST'])
@jwt_required()
def create_group():
    """Create a new study group. Only authenticated users can create groups."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    if not data.get('name'):
        return jsonify({'msg': 'Group name required'}), 400
    group = StudyGroup(name=data['name'], description=data.get('description',''), created_by=user_id)
    db.session.add(group)
    db.session.commit()
    # Add creator as owner
    membership = GroupMembership(user_id=user_id, group_id=group.id, role='owner')
    db.session.add(membership)
    db.session.commit()
    return jsonify(study_group_schema.dump(group)), 201

@study_groups_bp.route('', methods=['GET'])
@jwt_required()
def list_user_groups():
    """List all groups the current user is a member of."""
    user_id = get_jwt_identity()
    memberships = GroupMembership.query.filter_by(user_id=user_id).all()
    groups = [m.group for m in memberships]
    return jsonify(study_groups_schema.dump(groups)), 200

@study_groups_bp.route('/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    """Join a study group by ID. Only if not already a member."""
    user_id = get_jwt_identity()
    existing = GroupMembership.query.filter_by(user_id=user_id, group_id=group_id).first()
    if existing:
        return jsonify({'msg': 'Already a member'}), 400
    # Require group to exist
    if not StudyGroup.query.get(group_id):
        return jsonify({'msg': 'Group not found'}), 404
    membership = GroupMembership(user_id=user_id, group_id=group_id, role='member')
    db.session.add(membership)
    db.session.commit()
    return jsonify({'msg': 'Joined group'}), 200

@study_groups_bp.route('/<int:group_id>/leave', methods=['POST'])
@jwt_required()
def leave_group(group_id):
    """Leave a study group. Owners cannot leave their own group."""
    user_id = get_jwt_identity()
    membership = GroupMembership.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership:
        return jsonify({'msg': 'Not a member'}), 404
    if membership.role == 'owner':
        return jsonify({'msg': 'Owner cannot leave their own group'}), 400
    db.session.delete(membership)
    db.session.commit()
    return jsonify({'msg': 'Left group'}), 200

@study_groups_bp.route('/<int:group_id>/members', methods=['GET'])
@jwt_required()
def list_group_members(group_id):
    """List all members of a group. Only members can view."""
    user_id = get_jwt_identity()
    membership = GroupMembership.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership:
        return jsonify({'msg': 'Not a member'}), 403
    # Ensure group exists (optional safety)
    if not StudyGroup.query.get(group_id):
        return jsonify({'msg': 'Group not found'}), 404
    members = GroupMembership.query.filter_by(group_id=group_id).all()
    # Attach user info for display
    result = []
    for m in members:
        user = User.query.get(m.user_id)
        result.append({
            'id': m.id,
            'user_id': m.user_id,
            'role': m.role,
            'joined_at': m.joined_at.isoformat() if m.joined_at else None,
            'fullname': user.fullname if user else f'User #{m.user_id}',
            'email': user.email if user else '',
        })
    return jsonify(result), 200

@study_groups_bp.route('/<int:group_id>/members/<int:user_id>/remove', methods=['POST'])
@jwt_required()
def remove_member(group_id, user_id):
    """Remove a member from a group (owner-only). Owners cannot remove themselves."""
    requester_id = get_jwt_identity()
    requester = GroupMembership.query.filter_by(user_id=requester_id, group_id=group_id).first()
    if not requester:
        return jsonify({'msg': 'Not a member'}), 403
    if requester.role != 'owner':
        return jsonify({'msg': 'Not authorized'}), 403
    target = GroupMembership.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not target:
        return jsonify({'msg': 'Member not found'}), 404
    if target.role == 'owner':
        return jsonify({'msg': 'Cannot remove owner'}), 400
    db.session.delete(target)
    db.session.commit()
    return jsonify({'msg': 'Member removed'}), 200
