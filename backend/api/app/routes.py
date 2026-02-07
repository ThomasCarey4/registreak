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