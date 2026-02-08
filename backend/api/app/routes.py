from flask import Blueprint, jsonify, request, current_app
from .models import Users, Course, Module, Lecture, LectureAttendance
from .controllers import get_lecturer_current_lectures, verify_student_attendance
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from .auth import token_required, get_student_id

main = Blueprint('main', __name__)


@main.route('/code', methods=['GET'])
@token_required
def get_code():
    """
    Send code to front end via websockets every 30 seconds
    Returns a verification code for attendance checking
    Requires authentication as a lecturer (is_staff=True).
    """
    try:
        lecturer_id = get_student_id()
        user = request.user
        
        # Verify user is a lecturer
        if not user.get('is_staff', False):
            return jsonify({"error": "Only lecturers can access this endpoint"}), 403
        
        return get_lecturer_current_lectures(lecturer_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/verify', methods=['POST'])
@token_required
def verify_attendance():
    """
    Verify code given in body and save attendance to database
    Expected JSON: { "code": str }
    Requires authentication.
    """
    try:
        user = request.user
        student_id = user.get('student_id')
        data = request.get_json()
        
        # Add student_id from auth context to request data
        if data:
            data['student_id'] = student_id
        
        response, status_code = verify_student_attendance(data)
        return response, status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@main.route('/user/<student_id>', methods=['GET'])
@token_required
def get_user_details(student_id):
    """
    Return student information by student_id including streak data
    Requires authentication.
    """
    try:
        user = Users.query.filter_by(student_id=student_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "student_id": user.student_id,
            "username": user.username,
            "is_staff": user.is_staff,
            "current_streak": user.current_streak,
            "longest_streak": user.longest_streak
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route('/account/register', methods=['POST'])
def register():
    """
    Register a new user account
    Expected JSON: { "username": str, "password": str, "student_id": str }
    """
    try:
        data = request.get_json(force=True)
        username = data.get('username')
        password = data.get('password')
        student_id = data.get('student_id') or data.get('username')
        is_staff = bool(data.get('is_staff', False))

        if not username or not password or not student_id:
            return jsonify({"error": "Missing username, password or student_id"}), 400

        # check if user exists
        existing = Users.query.filter((Users.student_id == student_id) | (Users.username == username)).first()
        if existing:
            return jsonify({"error": "User already exists"}), 409

        pw_hash = generate_password_hash(password)
        user = Users(student_id=student_id, username=username, password=pw_hash, is_staff=is_staff)
        from . import db
        db.session.add(user)
        db.session.commit()

        # optionally return token
        secret = current_app.config.get('ATTENDANCE_SECRET_SEED')
        payload = {
            'student_id': user.student_id,
            'username': user.username,
            'is_staff': user.is_staff,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, secret, algorithm='HS256')

        return jsonify({"message": "User registered successfully", "token": token}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@main.route('/account/login', methods=['POST'])
def login():
    """
    Login with username and password
    Expected JSON: { "username": str, "password": str }
    Returns: { "token": str, "user": { ... } }
    """
    try:
        data = request.get_json(force=True)
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({"error": "Missing username or password"}), 400

        username = data.get('username')
        password = data.get('password')

        # Allow login via username or student_id
        user = Users.query.filter((Users.username == username) | (Users.student_id == username)).first()
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401

        secret = current_app.config.get('ATTENDANCE_SECRET_SEED')
        payload = {
            'student_id': user.student_id,
            'username': user.username,
            'is_staff': user.is_staff,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, secret, algorithm='HS256')

        return jsonify({"message": "Login successful", "token": token, "user": {
            "student_id": user.student_id,
            "username": user.username,
            "is_staff": user.is_staff
        }}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route('/account/logout', methods=['POST'])
@token_required
def logout():
    """
    Logout the current user.
    Since we use stateless JWTs, logout is mainly client-side (discard token).
    Server accepts the request and confirms successful logout.
    """
    try:
        user = request.user
        return jsonify({"message": f"Logout successful for {user.get('username')}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@main.route('/account/delete', methods=['DELETE'])
@token_required
def delete_account():
    """
    Delete the current user's account (requires password confirmation)
    Expected JSON: { "password": str }
    Requires authentication
    """
    try:
        user = request.user
        student_id = user.get('student_id')
        
        data = request.get_json(force=True)
        if not data.get('password'):
            return jsonify({"error": "Missing password confirmation"}), 400
        
        # Verify password matches
        db_user = Users.query.filter_by(student_id=student_id).first()
        if not db_user or not check_password_hash(db_user.password, data.get('password')):
            return jsonify({"error": "Invalid password"}), 401
        
        from . import db
        db.session.delete(db_user)
        db.session.commit()
        
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

