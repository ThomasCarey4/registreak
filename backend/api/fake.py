import random
import os
from datetime import datetime, timedelta, timezone
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

# Generate students with IDs 100-150 for Dr. Johnson's lectures
dr_johnson_students = []
for i in range(100, 151):
  student_id = str(i)
  dr_johnson_students.append({
    'student_id': student_id,
    'username': f"student{i}",
    'password': generate_password_hash("password123"),
    'is_staff': False
  })

# Add staff members (lecturers)
staff = [
  {'student_id': '69', 'username': 'dr_johnson', 'password': generate_password_hash("staff123"), 'is_staff': True},
  {'student_id': 'staff001', 'username': 'dr_smith', 'password': generate_password_hash("staff123"), 'is_staff': True},
  {'student_id': 'staff002', 'username': 'prof_jones', 'password': generate_password_hash("staff123"), 'is_staff': True},
  {'student_id': 'staff003', 'username': 'prof_williams', 'password': generate_password_hash("staff123"), 'is_staff': True},
]

with app.app_context():
  # Delete all existing data first
  print("Deleting existing data...")
  LectureAttendance.query.delete()
  Lecture.query.delete()
  Module.query.delete()
  Course.query.delete()
  Users.query.delete()
  db.session.commit()
  print("Existing data deleted.")

  # Insert users
  print("Adding users...")
  for user_data in students + dr_johnson_students + staff:
    user = Users(**user_data)
    db.session.add(user)

  # Insert courses
  print("Adding courses...")
  for code, name in COURSES:
    course = Course(code=code, name=name)
    db.session.add(course)

  db.session.commit()

  # Insert modules and lectures
  print("Adding modules and lectures...")
  start_date = datetime.now(timezone.utc) - timedelta(days=60)
  
  # Track lectures for lecturer id 69
  lecturer_69_lectures = []
  dr_johnson_module_count = 0
  
  module_count = 0
  for course_code, module_names in MODULES_BY_COURSE.items():
    for module_name in module_names:
      module = Module(name=module_name, course_code=course_code)
      db.session.add(module)
      db.session.flush()
      
      # Assign lecturer id 69 to first 2 modules, others to remaining staff
      if dr_johnson_module_count < 2:
        assigned_lecturer = '69'
        dr_johnson_module_count += 1
      else:
        assigned_lecturer = staff[module_count % len(staff)]['student_id']
      
      module_count += 1

      # Create 12 lectures per module (one semester)
      for week in range(12):
        lecture_start = start_date + timedelta(weeks=week, hours=9)
        lecture_end = lecture_start + timedelta(hours=1)

        lecture = Lecture(
          module_id=module.id,
          lecturer_id=assigned_lecturer,
          start_time=lecture_start,
          end_time=lecture_end
        )
        db.session.add(lecture)
        db.session.flush()
        
        if assigned_lecturer == '69':
          lecturer_69_lectures.append(lecture.id)

  # Add back-to-back lectures for lecturer 69 for next month
  print("Adding back-to-back lectures for lecturer 69...")
  base_start = datetime.now(timezone.utc)
  first_module_id = Module.query.first().id
  
  # Create 30+ consecutive days of lectures every hour, 24/7 (back-to-back schedule)
  for day in range(35):  # 35 days to ensure at least a month
    # Lectures every hour, 24 hours a day (0-23)
    for hour in range(24):
      lecture_start = base_start + timedelta(days=day, hours=hour)
      lecture_end = lecture_start + timedelta(hours=1)
      
      lecture = Lecture(
        module_id=first_module_id,
        lecturer_id='69',
        start_time=lecture_start,
        end_time=lecture_end
      )
      db.session.add(lecture)
      db.session.flush()
      lecturer_69_lectures.append(lecture.id)

  db.session.commit()

  # Create student-lecture attendance records
  print("Adding lecture attendance records...")
  all_lectures = Lecture.query.all()
  
  # First, assign students 100-150 to ALL of Dr. Johnson's lectures
  print("Assigning students 100-150 to all Dr. Johnson lectures...")
  for lecture_id in lecturer_69_lectures:
    for student in dr_johnson_students:
      attendance = LectureAttendance(
        user_id=student['student_id'],
        lecture_id=lecture_id,
        is_attended=False
      )
      db.session.add(attendance)
  
  # Then, randomly assign original students to other lectures
  for lecture in all_lectures:
    # Skip Dr. Johnson's lectures as they're already assigned
    if lecture.id in lecturer_69_lectures:
      continue
      
    # Randomly assign 20-40 students to each lecture
    num_students_assigned = random.randint(20, 40)
    assigned_students = random.sample(students, num_students_assigned)
    
    for student in assigned_students:
      # Initially all set to attended=False (not attended yet)
      attendance = LectureAttendance(
        user_id=student['student_id'],
        lecture_id=lecture.id,
        is_attended=False
      )
      db.session.add(attendance)
  
  db.session.commit()
  
  # Update some records to attended=True (for past lectures as examples)
  print("Updating some attendance records to attended=True...")
  past_lectures = Lecture.query.filter(Lecture.start_time < datetime.now(timezone.utc)).all()
  
  for lecture in past_lectures:
    # Get all attendance records for this lecture
    attendances = LectureAttendance.query.filter_by(lecture_id=lecture.id).all()
    
    # Randomly mark 70-90% as actually attended
    for attendance in attendances:
      if random.random() < 0.8:  # 80% actually attend
        attendance.is_attended = True
  
  db.session.commit()
  
  print("Database populated with dummy data")
  print(f"- {len(students)} regular students created")
  print(f"- {len(dr_johnson_students)} Dr. Johnson students (100-150) created")
  print(f"- {len(staff)} staff members created")
  print(f"- {len(COURSES)} courses created")
  print(f"- {Module.query.count()} modules created")
  print(f"- {Lecture.query.count()} lectures created")
  print(f"- {LectureAttendance.query.count()} attendance records created")
  print(f"- Lecturer 69 has {len(lecturer_69_lectures)} lectures scheduled")
  print(f"- Students 100-150 assigned to all {len(lecturer_69_lectures)} Dr. Johnson lectures")
