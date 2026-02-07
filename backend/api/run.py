import os
from dotenv import load_dotenv
from app import create_app, db

load_dotenv()

app = create_app()

with app.app_context():
    db.create_all()  # create tables

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
