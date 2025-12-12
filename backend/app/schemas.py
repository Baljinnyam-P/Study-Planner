# -------------------------------------------------------------
# Why: Schemas define how data is validated, serialized, and deserialized
# between the API and the database models.
#
# Why this design?
#   - Marshmallow is used for robust validation and clear error reporting.
#   - Schemas enforce data integrity and prevent invalid data from reaching the DB.
#   - separates API layer from DB models, making the API safer and easier to change.
# -------------------------------------------------------------
from .extensions import ma
from marshmallow import fields, validate



class GroupPlanTaskSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    plan_id = fields.Int()
    task = fields.Str(required=True)
    duration = fields.Int()
    notes = fields.Str()
    due = fields.Date(allow_none=True)
    priority = fields.Int()
    created_at = fields.DateTime(dump_only=True)

group_plan_task_schema = GroupPlanTaskSchema()
group_plan_tasks_schema = GroupPlanTaskSchema(many=True)

"""Minimal Marshmallow schemas for the MVP API.

Keeps only the fields used by routes and adds concise,
consistent serialization. Designed to be easy to read
and extend without unnecessary complexity.
"""



# --- In-App Group Invites and Group Plan Sharing Schemas ---
# Why: These schemas enable serialization/validation for group invites and group plans, supporting in-app collaboration.

class GroupInviteSchema(ma.Schema):
    """Invite between users for joining a study group."""
    id = fields.Int(dump_only=True)
    inviter_id = fields.Int()
    invitee_id = fields.Int()
    group_id = fields.Int()
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)

group_invite_schema = GroupInviteSchema()
group_invites_schema = GroupInviteSchema(many=True)

class GroupPlanSchema(ma.Schema):
    """Shared plan attached to a study group."""
    id = fields.Int(dump_only=True)
    group_id = fields.Int()
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    tasks = fields.Nested(GroupPlanTaskSchema, many=True)
    created_by = fields.Int()
    due = fields.Date(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

group_plan_schema = GroupPlanSchema()
group_plans_schema = GroupPlanSchema(many=True)

# --- Collaborative Study Groups Schemas ---
# Why: These schemas enable serialization/validation for group and membership APIs, supporting collaboration features.

class StudyGroupSchema(ma.Schema):
    """Basic info for a study group."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    created_by = fields.Int()
    created_at = fields.DateTime(dump_only=True)

study_group_schema = StudyGroupSchema()
study_groups_schema = StudyGroupSchema(many=True)

class GroupMembershipSchema(ma.Schema):
    """Membership record linking a user to a group."""
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    group_id = fields.Int(required=True)
    role = fields.Str()
    joined_at = fields.DateTime(dump_only=True)

group_membership_schema = GroupMembershipSchema()
group_memberships_schema = GroupMembershipSchema(many=True)

class UserSchema(ma.Schema):
    """Public user profile for auth responses."""
    id = fields.Int(dump_only=True)
    fullname = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    created_at = fields.DateTime(dump_only=True)

user_schema = UserSchema()

class RegisterSchema(ma.Schema):
    """Validation schema for registration payload."""
    fullname = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

register_schema = RegisterSchema()

class LoginSchema(ma.Schema):
    """Validation schema for login payload."""
    email = fields.Email(required=True)
    password = fields.Str(required=True)

login_schema = LoginSchema()

class TaskSchema(ma.Schema):
    """Personal task with optional metadata and status."""
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1))
    description = fields.Str()
    estimate_minutes = fields.Int()
    due_date = fields.DateTime(allow_none=True)
    priority = fields.Int(validate=validate.Range(min=1, max=5))
    completed = fields.Bool()
    created_at = fields.DateTime(dump_only=True)

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

class StudyPlanSchema(ma.Schema):
    """Saved personal study plan content."""
    id = fields.Int(dump_only=True)
    title = fields.Str()
    content = fields.Dict(required=True)
    generated_at = fields.DateTime(dump_only=True)

plan_schema = StudyPlanSchema()
plans_schema = StudyPlanSchema(many=True)



# --- In-App Notifications Schema ---
# Why: This schema enables serialization/validation for notification APIs, supporting in-app notification features.

class NotificationSchema(ma.Schema):
    """Notification message for a user."""
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    message = fields.Str()
    type = fields.Str()
    read = fields.Bool()
    invite_id = fields.Int(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)
