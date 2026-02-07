from flask import Blueprint, jsonify, request
from .models import Users, Course, Module, Lecture, LectureAttendance
from .controllers import get_lecturer_current_lectures, verify_student_attendance
main = Blueprint('main', __name__)

@main.route('/')
def home():
    return jsonify(message="Hello, Flask + SQLAlchemy!")

@main.route('/code/<lecturer_id>', methods=['GET'])
def get_code(lecturer_id):
    """
    Send code to front end via websockets every 30 seconds
    Returns a verification code for attendance checking
    """
    return get_lecturer_current_lectures(lecturer_id)

    
@main.route('/verify', methods=['POST'])
def verify_code():
    """
    Verify code given in body and save attendance to database
    Expected JSON: { "code": str, "student_id": str }
    """
    return verify_student_attendance(request.get_json())


@main.route('/user/<student_id>', methods=['GET'])
def get_user_info(student_id):
    """
    Return student information by student_id
    """
    try:
        user = Users.query.filter_by(student_id=student_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "student_id": user.student_id,
            "username": user.username,
            "is_staff": user.is_staff
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Account-related endpoints
@main.route('/account/register', methods=['POST'])
def register():
    """
    Register a new user account
    Expected JSON: { "username": str, "password": str, "student_id": str }
    """
    try:
        data = request.get_json(force=True)
        # TODO: Validate input, hash password, save to database
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    return jsonify({"message": "User registered successfully"}), 201


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
        
        # TODO: Verify credentials against database
        # TODO: Hash and compare password
        # TODO: Generate JWT or session token
        user = Users.query.filter_by(username=data.get('username')).first()
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Login successful"}), 200


@main.route('/account/logout', methods=['POST'])
def logout():
    """
    Logout the current user and invalidate session/token
    """
    try:
        # TODO: Get current user from session/token
        # TODO: Invalidate token in database or blacklist
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Logout successful"}), 200



@main.route('/account/delete', methods=['DELETE'])
def delete_account():
    """
    Delete the current user's account (requires password confirmation)
    Expected JSON: { "password": str }
    Requires authentication
    """
    try:
        data = request.get_json(force=True)
        if not data.get('password'):
            return jsonify({"error": "Missing password confirmation"}), 400
        
        # TODO: Extract user from authentication token/session
        # TODO: Verify password matches
        # TODO: Delete user and related data from database
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Account deleted successfully"}), 200

