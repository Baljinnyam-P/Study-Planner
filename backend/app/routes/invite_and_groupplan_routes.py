# -------------------------------------------------------------
# Why: This file contains endpoints for group collaboration features:
# inviting users, managing group plans, and handling group membership.
#
# Why this design?
#   - Enables collaborative study planning and group accountability.
#   - Invitation logic is separated for clarity and security.
#   - Group plan endpoints are distinct from personal plans for flexibility.
# -------------------------------------------------------------


""" endpoints for in-app group invites and shared group plans."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User, StudyGroup, GroupMembership, GroupInvite, GroupPlan, GroupPlanParticipant, Notification, GroupPlanTask
from ..schemas import group_invite_schema, group_invites_schema, group_plan_schema, group_plans_schema, group_plan_task_schema, group_plan_tasks_schema
from datetime import datetime

# Helper to check if a user is a member of a group
def _is_member(user_id, group_id):
    return GroupMembership.query.filter_by(user_id=user_id, group_id=group_id).first() is not None

invites_bp = Blueprint('invites_bp', __name__, url_prefix='/api/invites')

@invites_bp.route('/send', methods=['POST'])
@jwt_required()
def send_invite():
    """Invite a user to a group by username or email (in-app only)."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    group_id = data.get('group_id')
    identifier = data.get('identifier')  # fullname or email (MVP)
    if not group_id or not identifier:
        return jsonify({'msg': 'group_id and identifier required'}), 400
    group = StudyGroup.query.get(group_id)
    if not group:
        return jsonify({'msg': 'Group not found'}), 404
    # Only group members can invite
    if not _is_member(user_id, group_id):
        return jsonify({'msg': 'Not a group member'}), 403
    # Find user by fullname or email (MVP: no username field)
    invitee = User.query.filter((User.email == identifier) | (User.fullname == identifier)).first()
    if not invitee:
        return jsonify({'msg': 'User not found'}), 404
    # Prevent duplicate invites
    if GroupInvite.query.filter_by(invitee_id=invitee.id, group_id=group_id, status='pending').first():
        return jsonify({'msg': 'Invite already sent'}), 400
    invite = GroupInvite(inviter_id=user_id, invitee_id=invitee.id, group_id=group_id)
    db.session.add(invite)
    db.session.flush()  # ensure invite.id is available
    # Create notification for invitee
    inviter = User.query.get(user_id)
    group_name = group.name if hasattr(group, 'name') else f"Group #{group_id}"
    notif_msg = f"You were invited to join '{group_name}' by {inviter.fullname if inviter else 'a user'}"
    notif = Notification(user_id=invitee.id, message=notif_msg, type="invite", invite_id=invite.id)
    db.session.add(notif)
    db.session.commit()
    return jsonify(group_invite_schema.dump(invite)), 201

@invites_bp.route('/pending', methods=['GET'])
@jwt_required()
def list_pending_invites():
    """List all pending invites for the current user."""
    user_id = get_jwt_identity()
    invites = GroupInvite.query.filter_by(invitee_id=user_id, status='pending').all()
    return jsonify(group_invites_schema.dump(invites)), 200

@invites_bp.route('/<int:invite_id>/respond', methods=['POST'])
@jwt_required()
def respond_invite(invite_id):
    """Accept or decline a group invite."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    action = data.get('action')  # 'accept' or 'decline'
    invite = GroupInvite.query.get(invite_id)
    print(f"[DEBUG PATCHED] /invites/{invite_id}/respond: user_id={user_id} (type={type(user_id)}), invitee_id={invite.invitee_id if invite else None} (type={type(invite.invitee_id) if invite else None})")
    if not invite:
        return jsonify({'msg': 'Invite not found'}), 404
    if int(invite.invitee_id) != int(user_id):
        return jsonify({'msg': f'Not the invitee (user_id={user_id}, invitee_id={invite.invitee_id})'}), 403
    if invite.status != 'pending':
        return jsonify({'msg': f"Invite already {invite.status}"}), 400
    if action == 'accept':
        # Add to group
        if not _is_member(user_id, invite.group_id):
            db.session.add(GroupMembership(user_id=user_id, group_id=invite.group_id, role='member'))
        invite.status = 'accepted'
    elif action == 'decline':
        invite.status = 'declined'
    else:
        return jsonify({'msg': 'Invalid action'}), 400
    db.session.commit()
    return jsonify({'msg': f'Invite {invite.status}'}), 200

# --- Group Plan Sharing ---
group_plans_bp = Blueprint('group_plans_bp', __name__, url_prefix='/api/group-plans')

@group_plans_bp.route('/<int:group_id>', methods=['POST'])
@jwt_required()
def create_group_plan(group_id):
    """Create a shared plan for a group."""
    user_id = get_jwt_identity()
    group = StudyGroup.query.get(group_id)
    if not group:
        return jsonify({'msg': 'Group not found'}), 404
    # Only members can create plans
    if not _is_member(user_id, group_id):
        return jsonify({'msg': 'Not a group member'}), 403
    data = request.get_json() or {}
    if not data.get('title'):
        return jsonify({'msg': 'Title required'}), 400
    # Extract content, tasks, and due from payload
    content = data.get('content', {})
    tasks = content.get('tasks', [])
    due = data.get('due') or content.get('due')
    plan = GroupPlan(
        group_id=group_id,
        title=data['title'],
        description=data.get('description', ''),
        content=content,
        due=due,
        created_by=user_id
    )
    db.session.add(plan)
    db.session.commit()
    # Create normalized tasks
    for t in tasks:
        if t.get('task'):
                db.session.add(GroupPlanTask(
                    plan_id=plan.id,
                    task=t['task'],
                    duration=t.get('duration', 30),
                    notes=t.get('notes', ''),
                    due=t.get('due'),
                    priority=t.get('priority', 3)
                ))
    db.session.commit()
    # Reload tasks for response
    plan_tasks = GroupPlanTask.query.filter_by(plan_id=plan.id).order_by(GroupPlanTask.created_at).all()
    plan_data = group_plan_schema.dump(plan)
    plan_data['tasks'] = [group_plan_task_schema.dump(tsk) for tsk in plan_tasks]
    return jsonify(plan_data), 201

@group_plans_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def list_group_plans(group_id):
    """List shared plans for a group, with optional pagination."""
    user_id = get_jwt_identity()
    if not _is_member(user_id, group_id):
        return jsonify({'msg': 'Not a group member'}), 403
    # Pagination params: limit (default 50), offset (default 0)
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
    except ValueError:
        return jsonify({'msg': 'Invalid pagination params'}), 400
    q = GroupPlan.query.filter_by(group_id=group_id).order_by(GroupPlan.created_at.desc())
    plans = q.offset(offset).limit(limit).all()
    return jsonify(group_plans_schema.dump(plans)), 200

@group_plans_bp.route('/view/<int:plan_id>', methods=['GET'])
@jwt_required()
def view_group_plan(plan_id):
    """View a specific group plan (members only)."""
    user_id = get_jwt_identity()
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found', 'id': plan_id}), 404
    if not _is_member(user_id, plan.group_id):
        return jsonify({'msg': 'Not a group member', 'id': plan_id}), 403
    # Robust serialization: always use Marshmallow schema
    result = group_plan_schema.dump(plan)
    # Defensive: ensure 'id' is present
    if 'id' not in result:
        result['id'] = plan.id
    return jsonify(result), 200

@group_plans_bp.route('/<int:plan_id>/join', methods=['POST'])
@jwt_required()
def join_group_plan(plan_id):
    """MVP: Join a group plan (acknowledge participation). No persistence beyond notification."""
    user_id = get_jwt_identity()
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    # Must be a member of the group
    if not _is_member(user_id, plan.group_id):
        return jsonify({'msg': 'Not a group member'}), 403
    # Persist participant (avoid duplicates)
    if not GroupPlanParticipant.query.filter_by(plan_id=plan.id, user_id=user_id).first():
        db.session.add(GroupPlanParticipant(plan_id=plan.id, user_id=user_id))
    # Notify creator
    notif = Notification(
        user_id=plan.created_by,
        message=f"User #{user_id} joined your plan '{plan.title}'",
        type='plan'
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify({'msg': 'Joined plan'}), 200

@group_plans_bp.route('/<int:plan_id>/participants', methods=['GET'])
@jwt_required()
def list_group_plan_participants(plan_id):
    """List participants for a group plan (members only)."""
    user_id = get_jwt_identity()
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    if not _is_member(user_id, plan.group_id):
        return jsonify({'msg': 'Not a group member'}), 403
    parts = GroupPlanParticipant.query.filter_by(plan_id=plan_id).all()
    result = [{
        'id': p.id,
        'user_id': p.user_id,
        'fullname': p.user.fullname if p.user else None,
        'email': p.user.email if p.user else None,
        'joined_at': p.joined_at.isoformat() if p.joined_at else None
    } for p in parts]
    return jsonify(result), 200


@invites_bp.route('/remove-member', methods=['POST'])
@jwt_required()
def remove_group_member():
    """Remove a member from a group. Only owner or admin can remove."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    group_id = data.get('group_id')
    member_id = data.get('member_id')
    if not group_id or not member_id:
        return jsonify({'msg': 'group_id and member_id required'}), 400
    group = StudyGroup.query.get(group_id)
    if not group:
        return jsonify({'msg': 'Group not found'}), 404
    # Only owner or admin can remove
    membership = GroupMembership.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership or membership.role not in ('owner', 'admin'):
        return jsonify({'msg': 'Not authorized'}), 403
    # Cannot remove self
    if int(user_id) == int(member_id):
        return jsonify({'msg': 'Cannot remove yourself'}), 400
    member = GroupMembership.query.filter_by(user_id=member_id, group_id=group_id).first()
    if not member:
        return jsonify({'msg': 'Member not found'}), 404
    db.session.delete(member)
    # Remove from group plan participants
    GroupPlanParticipant.query.filter_by(user_id=member_id).delete()
    db.session.commit()
    return jsonify({'msg': 'Member removed'}), 200

@group_plans_bp.route('/<int:plan_id>/leave', methods=['POST'])
@jwt_required()
def leave_group_plan(plan_id):
    """Leave a group plan (remove participant record)."""
    user_id = get_jwt_identity()
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    if not GroupMembership.query.filter_by(user_id=user_id, group_id=plan.group_id).first():
        return jsonify({'msg': 'Not a group member'}), 403
    part = GroupPlanParticipant.query.filter_by(plan_id=plan_id, user_id=user_id).first()
    if not part:
        return jsonify({'msg': 'Not a participant'}), 400
    db.session.delete(part)
    db.session.commit()
    return jsonify({'msg': 'Left plan'}), 200

@group_plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_group_plan(plan_id):
    """Delete a specific group plan. Only the creator or group owner can delete."""
    user_id = get_jwt_identity()
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    # Check membership
    membership = GroupMembership.query.filter_by(user_id=user_id, group_id=plan.group_id).first()
    if not membership:
        return jsonify({'msg': 'Not a group member'}), 403
    # Allow delete if creator or owner
    is_creator = plan.created_by == user_id
    is_owner = getattr(membership, 'role', 'member') == 'owner'
    if not (is_creator or is_owner):
        return jsonify({'msg': 'Not authorized to delete'}), 403
    db.session.delete(plan)
    db.session.commit()
    return jsonify({'msg': 'Plan deleted'}), 200

@group_plans_bp.route('/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_group_plan(plan_id):
    """Update a group plan's title or content. Only creator or group owner."""
    user_id = get_jwt_identity()
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    membership = GroupMembership.query.filter_by(user_id=user_id, group_id=plan.group_id).first()
    if not membership:
        return jsonify({'msg': 'Not a group member'}), 403
    is_creator = plan.created_by == user_id
    is_owner = getattr(membership, 'role', 'member') == 'owner'
    if not (is_creator or is_owner):
        return jsonify({'msg': 'Not authorized to update'}), 403
    data = request.get_json() or {}
    if 'title' in data:
        plan.title = data['title']
    if 'content' in data:
        plan.content = data['content']
    if 'description' in data:
        plan.description = data['description']
    if 'due' in data:
        due_val = data['due']
        if due_val:
            
            try:
                plan.due = datetime.strptime(due_val, "%Y-%m-%d").date()
            except Exception:
                plan.due = None
        else:
            plan.due = None
    db.session.commit()
    return jsonify(group_plan_schema.dump(plan)), 200



# --- Group Plan Task Endpoints ---
@group_plans_bp.route('/<int:plan_id>/tasks', methods=['GET'])
@jwt_required()
def list_group_plan_tasks(plan_id):
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    tasks = GroupPlanTask.query.filter_by(plan_id=plan_id).order_by(GroupPlanTask.created_at).all()
    return jsonify(group_plan_tasks_schema.dump(tasks)), 200

@group_plans_bp.route('/<int:plan_id>/tasks', methods=['POST'])
@jwt_required()
def create_group_plan_task(plan_id):
    plan = GroupPlan.query.get(plan_id)
    if not plan:
        return jsonify({'msg': 'Plan not found'}), 404
    data = request.get_json() or {}
    if not data.get('task'):
        return jsonify({'msg': 'Task name required'}), 400
    task = GroupPlanTask(
        plan_id=plan_id,
        task=data['task'],
        duration=data.get('duration', 30),
        notes=data.get('notes', ''),
        due=data.get('due'),
        priority=data.get('priority', 3)
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(group_plan_task_schema.dump(task)), 201

@group_plans_bp.route('/<int:plan_id>/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_group_plan_task(plan_id, task_id):
    task = GroupPlanTask.query.filter_by(plan_id=plan_id, id=task_id).first()
    if not task:
        return jsonify({'msg': 'Task not found'}), 404
    data = request.get_json() or {}
    if 'task' in data:
        task.task = data['task']
    if 'duration' in data:
        task.duration = data['duration']
    if 'notes' in data:
        task.notes = data['notes']
    if 'due' in data:
        task.due = data['due']
    if 'priority' in data:
        task.priority = data['priority']
    db.session.commit()
    return jsonify(group_plan_task_schema.dump(task)), 200

@group_plans_bp.route('/<int:plan_id>/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_group_plan_task(plan_id, task_id):
    task = GroupPlanTask.query.filter_by(plan_id=plan_id, id=task_id).first()
    if not task:
        return jsonify({'msg': 'Task not found'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'msg': 'Task deleted'}), 200
