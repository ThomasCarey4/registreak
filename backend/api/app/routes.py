from flask import Blueprint, jsonify, request
from .models import Users, Course, Module, Lecture, LectureAttendance
from flask_socketio import SocketIO, emit

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return jsonify(message="Hello, Flask + SQLAlchemy!")

@main.route('/code', methods=['GET'])
def code():
    """"
    Send code to front end via websockets every 30 seconds
    """
    try:
        pass
    except:
        return jsonify({}), 500
    
@main.route('/verify', methods=['POST'])
def code():
    """"
    Verify code given in body and save attenance to db
    """
    try:
        json = request.get_json(force=True)
        pass
    except:
        return jsonify({}), 500
    
    return jsonify({"message": "OK"}), 200

@main.route('/user/<student_number>', methods=['GET'])
def code(student_number):
    """"
    return student info
    """
    try:
        pass
    except:
        return jsonify({}), 500
    
    return jsonify({"message": "OK"}), 200



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
    """
    try:
        data = request.get_json(force=True)
        # TODO: Verify credentials, create session/token
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    return jsonify({"message": "Login successful"}), 200


@main.route('/account/logout', methods=['POST'])
def logout():
    """
    Logout the current user
    """
    try:
        # TODO: Invalidate session/token
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    return jsonify({"message": "Logout successful"}), 200


@main.route('/account/profile', methods=['GET'])
def get_profile():
    """
    Get the current user's profile information
    """
    try:
        # TODO: Get current user from session/token, return profile data
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    return jsonify({"message": "OK"}), 200


@main.route('/account/delete', methods=['DELETE'])
def delete_account():
    """
    Delete the current user's account
    Expected JSON: { "password": str }
    """
    try:
        data = request.get_json(force=True)
        # TODO: Verify password, delete user account
        pass
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    return jsonify({"message": "Account deleted successfully"}), 200

