"""
Controllers for handling attendance verification business logic.
"""
from flask import jsonify, current_app
from datetime import datetime, timezone, date, time, timedelta
from .models import Lecture, LectureAttendance, Users
from .utils import generate_lecture_code, verify_lecture_code
from . import db


def get_previous_attendance(user_id: str, current_lecture: Lecture) -> LectureAttendance | None:
    """
    Find the student's most recent enrolled lecture before the current one.

    Uses the index on lectures(start_time DESC, id) for efficient lookup.
    With LIMIT 1 and ORDER BY DESC, PostgreSQL stops at the first match.

    Args:
        user_id: The student's ID
        current_lecture: The lecture being attended now

    Returns:
        The LectureAttendance record for the previous lecture, or None if this is the first.
    """
    return (
        LectureAttendance.query
        .join(Lecture)
        .filter(LectureAttendance.user_id == user_id)
        .filter(Lecture.start_time < current_lecture.start_time)
        .order_by(Lecture.start_time.desc())
        .first()
    )


def update_streak(user: Users, previous_attendance: LectureAttendance | None) -> None:
    """
    Update the user's streak based on their previous lecture attendance.

    Logic:
    - If no previous lecture (first ever) or previous was attended → increment streak
    - If previous was not attended → streak broken → reset to 1
    - Always update longest_streak if current exceeds it

    Args:
        user: The Users model instance to update
        previous_attendance: The previous LectureAttendance record, or None
    """
    if previous_attendance is None or previous_attendance.is_attended:
        # First lecture ever, or previous was attended → continue streak
        user.current_streak += 1
    else:
        # Previous lecture was missed → streak broken
        user.current_streak = 1

    # Update longest streak if we've exceeded it
    if user.current_streak > user.longest_streak:
        user.longest_streak = user.current_streak


def get_lecturer_active_lectures(lecturer_id):
    """
    Get all currently active lectures for a specific lecturer.
    
    Returns lecture details including time-based verification codes.
    This is a stateless operation—codes are generated on-demand from the
    lecture_id and current time, so any pod can generate the same code.
    
    Args:
        lecturer_id: The ID of the lecturer
        
    Returns:
        JSON response with list of active lectures and their codes
    """
    # Get current UTC time
    now = datetime.now(timezone.utc)

    # Query all lectures assigned to this lecturer that are currently active
    current_lectures = Lecture.query.filter(
        Lecture.lecturer_id == lecturer_id,
        Lecture.start_time <= now,
        Lecture.end_time >= now
    ).all()

    if not current_lectures:
        return jsonify({
            'success': False,
            'message': 'No current lectures found for this lecturer'
        }), 404

    # Get the secret seed from config
    seed = current_app.config['ATTENDANCE_SECRET_SEED']

    # Build response with all current lectures
    lectures_data = []
    for lecture in current_lectures:
        # Generate time-based code for this lecture
        code = generate_lecture_code(lecture.id, seed)

        lectures_data.append({
            'lecture_id': lecture.id,
            'module_id': lecture.module_id,
            'module_name': lecture.module.name if lecture.module else None,
            'start_time': lecture.start_time.isoformat(),
            'end_time': lecture.end_time.isoformat(),
            'code': code
        })

    return jsonify({
        'success': True,
        'lectures': lectures_data
    }), 200


def verify_student_attendance(data):
    """
    Verify a student's attendance code and mark them as attended.
    
    Stateless verification: queries active lectures and verifies the code
    against each one using TOTP, allowing this to work across multiple pods
    without shared state or caching.
    
    Expected data: {student_id, code}
    """
    if not data:
        return jsonify({
            'success': False,
            'message': 'No data provided'
        }), 400

    student_id = data.get('student_id')
    code = data.get('code')

    # Validate required fields
    if not all([student_id, code]):
        return jsonify({
            'success': False,
            'message': 'Missing required fields: student_id and code are required'
        }), 400

    # Validate code format (must be 4 digits)
    if not code.isdigit() or len(code) != 4:
        return jsonify({
            'success': False,
            'message': 'Invalid code format. Code must be 4 digits.'
        }), 400

    # Get current time and find all active lectures
    now = datetime.now(timezone.utc)
    active_lectures = Lecture.query.filter(
        Lecture.start_time <= now,
        Lecture.end_time >= now
    ).all()

    if not active_lectures:
        return jsonify({
            'success': False,
            'message': 'No active lectures at this time'
        }), 400

    # Try to verify code against each active lecture (stateless)
    seed = current_app.config.get('ATTENDANCE_SECRET_SEED')
    lecture = None

    for candidate_lecture in active_lectures:
        if verify_lecture_code(candidate_lecture.id, code, seed):
            lecture = candidate_lecture
            break

    if not lecture:
        return jsonify({
            'success': False,
            'message': 'Invalid or expired code'
        }), 400

    # Find the attendance record for this student and lecture
    attendance = LectureAttendance.query.filter_by(
        user_id=student_id,
        lecture_id=lecture.id
    ).first()

    if not attendance:
        return jsonify({
            'success': False,
            'message': 'Student is not enrolled in this lecture'
        }), 404

    # Check if already attended
    if attendance.is_attended:
        return jsonify({
            'success': True,
            'message': 'Attendance already marked',
            'lecture_id': lecture.id,
            'module_name': lecture.module.name if lecture.module else None,
            'already_attended': True
        }), 200

    # Mark attendance as true
    attendance.is_attended = True

    # Update streak: check if previous lecture was attended
    user = Users.query.filter_by(student_id=student_id).first()
    if user:
        previous_attendance = get_previous_attendance(student_id, lecture)
        update_streak(user, previous_attendance)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Attendance marked successfully',
        'lecture_id': lecture.id,
        'module_name': lecture.module.name if lecture.module else None,
        'already_attended': False,
        'current_streak': user.current_streak if user else 0,
        'longest_streak': user.longest_streak if user else 0
    }), 200

