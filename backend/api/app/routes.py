from flask import Blueprint, jsonify
from .models import User

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return jsonify(message="Hello, Flask + SQLAlchemy!")

@main.route('/users')
def users():
    all_users = User.query.all()
    return jsonify(users=[user.username for user in all_users])
