from flask import jsonify, request, current_app
from functools import wraps
import jwt

# Helper function to verify JWT and extract user
def verify_token():
    """Verify JWT token from Authorization header. Returns user dict or None."""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        # Expected format: "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        token = parts[1]
        secret = current_app.config.get('ATTENDANCE_SECRET_SEED')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, IndexError):
        return None
    

# Decorator to require authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = verify_token()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        request.user = user
        return f(*args, **kwargs)
    return decorated

# Helper to extract student_id from current request's JWT
def get_student_id():
    """Get student_id from the current request's authenticated user. Returns None if not authenticated."""
    if hasattr(request, 'user'):
        return request.user.get('student_id')
    return None