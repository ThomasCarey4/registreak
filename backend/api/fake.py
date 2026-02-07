import random
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# Set database URL before importing app
os.environ.setdefault('DATABASE_URL', 'postgresql://myuser:mypassword@localhost:5432/postgres')

from app import create_app, db
from app.models import Users, Course, Module, Lecture, LectureAttendance

app = create_app()

# Leeds University course codes and modules
COURSES = [
  ("COMP1711", "Procedural Programming"),
  ("COMP2211", "Operating Systems"),
  ("COMP2311", "Software Engineering"),
  ("COMP3711", "Machine Learning"),
  ("COMP3911", "Final Year Project"),
]

MODULES_BY_COURSE = {
  "COMP1711": ["Introduction to Python", "C Programming Fundamentals", "Algorithm Design"],
  "COMP2211": ["Process Management", "Memory Systems", "File Systems"],
  "COMP2311": ["Requirements Engineering", "Design Patterns", "Testing Methodologies"],
  "COMP3711": ["Supervised Learning", "Neural Networks", "Deep Learning"],
  "COMP3911": ["Project Planning", "Research Methods", "Implementation"],
}

# Generate students
students = []
for i in range(1, 51):
  student_id = f"sc{str(i).zfill(4)}abc"  # Leeds format: sc followed by numbers and letters
  students.append({
    'student_id': student_id,
    'username': f"student{i}",
    'password': generate_password_hash("password123"),
    'is_staff': False
  })

# Add staff members
staff = [
  {'student_id': 'staff001', 'username': 'dr_smith', 'password': generate_password_hash("staff123"), 'is_staff': True},
  {'student_id': 'staff002', 'username': 'prof_jones', 'password': generate_password_hash("staff123"), 'is_staff': True},
]

# Insert users
with app.app_context():
  for user_data in students + staff:
    user = Users(**user_data)
    db.session.add(user)

  # Insert courses
  for code, name in COURSES:
    course = Course(code=code, name=name)
    db.session.add(course)

  db.session.commit()

  # Insert modules and lectures
  start_date = datetime.now() - timedelta(days=60)

  for course_code, module_names in MODULES_BY_COURSE.items():
    for module_name in module_names:
      module = Module(name=module_name, course_code=course_code)
      db.session.add(module)
      db.session.flush()

      # Create 12 lectures per module (one semester)
      for week in range(12):
        lecture_start = start_date + timedelta(weeks=week, hours=9)
        lecture_end = lecture_start + timedelta(hours=1)

        lecture = Lecture(
          module_id=module.id,
          start_time=lecture_start,
          end_time=lecture_end
        )
        db.session.add(lecture)
        db.session.flush()

        # Random attendance for students
        for student in students[:40]:  # 40 students attend lectures
          if random.random() > 0.2:  # 80% attendance rate
            attendance = LectureAttendance(
              user_id=student['student_id'],
              lecture_id=lecture.id,
              is_attended=True
            )
            db.session.add(attendance)

  db.session.commit()
  print("Database populated with dummy data")
