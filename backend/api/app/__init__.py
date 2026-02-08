from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['ATTENDANCE_SECRET_SEED'] = os.getenv('ATTENDANCE_SECRET_SEED', 'default-secret-seed-change-in-production')

    # Enable CORS for all routes
    CORS(app)

    db.init_app(app)

    from .routes import main
    app.register_blueprint(main)

    return app
