"""endpoints for in-app notifications (list, mark-as-read)."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Notification
from ..schemas import notifications_schema

notifications_bp = Blueprint('notifications_bp', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    """List notifications for the current user (most recent first), with optional pagination."""
    user_id = get_jwt_identity()
    # Pagination limit (default 50), offset (default 0)
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
    except ValueError:
        return jsonify({'msg': 'Invalid pagination params'}), 400
    q = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc())
    notes = q.offset(offset).limit(limit).all()
    return jsonify(notifications_schema.dump(notes)), 200

@notifications_bp.route('/<int:note_id>/read', methods=['POST'])
@jwt_required()
def mark_read(note_id):
    """Mark a notification as read."""
    user_id = get_jwt_identity()
    note = Notification.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'msg': 'Not found'}), 404
    note.read = True
    db.session.commit()
    return jsonify({'msg': 'Marked as read'}), 200

@notifications_bp.route('/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(note_id):
    """Delete a notification belonging to current user."""
    user_id = get_jwt_identity()
    note = Notification.query.filter_by(id=note_id, user_id=user_id).first()
    if not note:
        return jsonify({'msg': 'Not found'}), 404
    db.session.delete(note)
    db.session.commit()
    return jsonify({'msg': 'Deleted'}), 200
