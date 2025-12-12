# -------------------------------------------------------------
# Why: This file contains all authentication and authorization endpoints
# (register, login, token refresh ...).
#
# Why this design?
#   - JWT (JSON Web Tokens) are used for stateless, secure authentication.
#   - Endpoints are separated for clarity and extensibility (e.g., future OAuth).
#   - Passwords are hashed for security; no sensitive data is exposed.
#   - Modular design allows for easy addition of new auth features.
# -------------------------------------------------------------
"""auth routes: 
/register
/login
/refresh
/me.
"""

from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, decode_token
from ..schemas import register_schema, login_schema, user_schema

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json() or {}
    errors = register_schema.validate(data)
    if errors: 
        return jsonify({'errors': errors}), 400
    email = data['email'].lower()

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already registered'}), 400
    user = User(fullname=data['fullname'], email=email, password_hash=generate_password_hash(data['password']))
    db.session.add(user); db.session.commit()
    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify({'access_token': access, 'refresh_token': refresh, 'user': user_schema.dump(user)}), 201

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json() or {}
    errors = login_schema.validate(data)
    if errors: 
        return jsonify({'errors': errors}), 400
    email = data['email'].lower()

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'msg': 'Bad credentials'}), 401
    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify({'access_token': access, 'refresh_token': refresh, 'user': user_schema.dump(user)}), 200

@auth_bp.route('/refresh', methods=['POST', 'OPTIONS'])
def refresh():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json() or {}
    rtoken = data.get('refresh_token')
    if not rtoken:
        return jsonify({'msg': 'Missing refresh token'}), 401
    try:

        decoded = decode_token(rtoken)
        user_id = decoded['sub']
    except Exception as e:
        return jsonify({'msg': 'Invalid refresh token'}), 401
    access = create_access_token(identity=str(user_id))
    refresh = create_refresh_token(identity=str(user_id))
    return jsonify({'access_token': access, 'refresh_token': refresh}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'msg': 'Logged out'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({'user': user_schema.dump(user)}), 200
