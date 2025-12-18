# -------------------------------------------------------------
# Why: Models define the database structure and relationships for users,
# tasks, study groups, group plans, and notifications.
#
# Why this design?
#   - Enables both personal and collaborative study planning.
#   - Relationships (e.g., User <-> Task, Group <-> Membership) allow for
#     efficient queries and extensibility (e.g., group invites, plan sharing).
#   - SQLAlchemy ORM is used to avoid raw SQL and enable migrations.
#   - Each model is normalized to reduce data duplication and support future features.
# -------------------------------------------------------------


from .extensions import db
from datetime import datetime


class GroupPlanTask(db.Model):
    __tablename__ = "group_plan_tasks"
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("group_plans.id", ondelete="CASCADE"), nullable=False)
    task = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.Integer, default=30)
    notes = db.Column(db.Text, default="")
    due = db.Column(db.Date, nullable=True)
    priority = db.Column(db.Integer, default=3)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    plan = db.relationship("GroupPlan", backref=db.backref("tasks", cascade="all, delete-orphan"))



class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tasks = db.relationship("Task", back_populates="user", cascade="all, delete-orphan")
    plans = db.relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    memberships = db.relationship("GroupMembership", back_populates="user", cascade="all, delete-orphan")

# --- Collaborative Study Groups ---
# Why: These models enable users to form groups, collaborate, and share study plans, making the app more engaging and useful.

class StudyGroup(db.Model):
    __tablename__ = "study_groups"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default="")
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    memberships = db.relationship("GroupMembership", back_populates="group", cascade="all, delete-orphan")

class GroupMembership(db.Model):
    __tablename__ = "group_memberships"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey("study_groups.id"), nullable=False)
    role = db.Column(db.String(20), default="member")  # 'member', 'admin', 'owner'
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="memberships")
    group = db.relationship("StudyGroup", back_populates="memberships")

class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    estimate_minutes = db.Column(db.Integer, default=30)
    due_date = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.Integer, default=3)
    completed = db.Column(db.Boolean, default=False)
    # Optional advanced fields
    depends_on_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=True)
    recurrence = db.Column(db.String(20), nullable=True)  # e.g., 'daily','weekly','monthly'
    reminder_minutes_before = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="tasks")
    depends_on = db.relationship('Task', remote_side=[id], uselist=False)

class StudyPlan(db.Model):
    __tablename__ = "study_plans"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), default="Auto-generated Plan")
    content = db.Column(db.JSON, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Public sharing
    is_public = db.Column(db.Boolean, default=False)
    public_id = db.Column(db.String(36), unique=True, nullable=True)

    user = db.relationship("User", back_populates="plans")

# --- In-App Group Invites and Group Plan Sharing ---
# Why: These models enable users to invite others to groups (in-app, not email) and to collaborate on shared group study plans.

class GroupInvite(db.Model):
    __tablename__ = "group_invites"
    id = db.Column(db.Integer, primary_key=True)
    inviter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    invitee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey("study_groups.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # 'pending', 'accepted', 'declined'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    inviter = db.relationship("User", foreign_keys=[inviter_id], backref="sent_invites")
    invitee = db.relationship("User", foreign_keys=[invitee_id], backref="received_invites")
    group = db.relationship("StudyGroup", backref="invites")

class GroupPlan(db.Model):
    __tablename__ = "group_plans"
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("study_groups.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.JSON, nullable=False)
    description = db.Column(db.Text, default="")
    due = db.Column(db.Date, nullable=True)  # Top-level due date for the plan
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    group = db.relationship("StudyGroup", backref="plans")
    creator = db.relationship("User", backref="created_group_plans")

class GroupPlanParticipant(db.Model):
    __tablename__ = "group_plan_participants"
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("group_plans.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    plan = db.relationship("GroupPlan", backref=db.backref("participants", cascade="all, delete-orphan"))
    user = db.relationship("User")


# --- In-App Notifications ---
# Why: This model enables the backend to store and deliver notifications to users for important events (invites, plan updates, etc.), increasing engagement and usability.

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), default="info")  # e.g., 'invite', 'plan', 'info'
    read = db.Column(db.Boolean, default=False)
    invite_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="notifications")