import random
import os
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from faker import Faker

# Set database URL before importing app
os.environ.setdefault('DATABASE_URL', 'postgresql://myuser:mypassword@localhost:5432/postgres')

from app import create_app, db
from app.models import Users, Course, Module, Lecture, LectureAttendance

app = create_app()
fake = Faker('en_GB')  # British English for Leeds University context
Faker.seed(42)         # Reproducible names across runs

# Leeds University courses (top-level programmes) and their modules
COURSES = [
  ("COMP", "Computer Science"),
  ("MATH", "Mathematics"),
  ("ELEC", "Electronic Engineering"),
]

MODULES_BY_COURSE = {
  "COMP": [
    "Procedural Programming",
    "Operating Systems",
    "Software Engineering",
    "Machine Learning",
    "Final Year Project",
  ],
  "MATH": [
    "Linear Algebra",
    "Calculus",
    "Probability & Statistics",
    "Number Theory",
  ],
  "ELEC": [
    "Circuit Analysis",
    "Digital Electronics",
    "Embedded Systems",
    "Signal Processing",
  ],
}

# Weekly timetable slots: (weekday 0=Mon, hour 9-17)
# Each course gets its own non-overlapping timetable.
# 2 slots per module, up to 5 modules = 10 slots needed.
# 5 weekdays × 9 hours = 45 available slots, plenty of room.
def build_course_timetable(module_names: list[str]) -> dict[str, list[tuple[int, int]]]:
    """Return {module_name: [(weekday, hour), (weekday, hour)]} with no overlaps."""
    all_slots = [(d, h) for d in range(5) for h in range(9, 18)]  # Mon-Fri, 9-17
    random.shuffle(all_slots)
    timetable: dict[str, list[tuple[int, int]]] = {}
    idx = 0
    for name in module_names:
        timetable[name] = [all_slots[idx], all_slots[idx + 1]]
        idx += 2
    return timetable

# Generate students
students = []
for i in range(1, 51):
  student_id = f"sc{str(i).zfill(4)}abc"
  first = fake.first_name()
  last = fake.last_name()
  students.append({
    'student_id': student_id,
    'username': f"student{i}",
    'password': generate_password_hash("password123"),
    'is_staff': False,
    'first_name': first,
    'last_name': last,
  })

# Generate students with IDs 100-150 for Dr. Johnson's lectures
dr_johnson_students = []
for i in range(100, 151):
  student_id = str(i)
  first = fake.first_name()
  last = fake.last_name()
  dr_johnson_students.append({
    'student_id': student_id,
    'username': f"student{i}",
    'password': generate_password_hash("password123"),
    'is_staff': False,
    'first_name': first,
    'last_name': last,
  })

# Add staff members (lecturers)
staff = [
  {'student_id': '69', 'username': 'dr_johnson', 'password': generate_password_hash("staff123"), 'is_staff': True, 'first_name': 'David', 'last_name': 'Johnson'},
  {'student_id': 'staff001', 'username': 'dr_smith', 'password': generate_password_hash("staff123"), 'is_staff': True, 'first_name': 'Eleanor', 'last_name': 'Smith'},
  {'student_id': 'staff002', 'username': 'prof_jones', 'password': generate_password_hash("staff123"), 'is_staff': True, 'first_name': 'Richard', 'last_name': 'Jones'},
  {'student_id': 'staff003', 'username': 'prof_williams', 'password': generate_password_hash("staff123"), 'is_staff': True, 'first_name': 'Margaret', 'last_name': 'Williams'},
]

with app.app_context():
  # Delete all existing data first
  print("Deleting existing data...")
  db.session.execute(db.text('TRUNCATE lecture_attendance, lectures, modules, courses, users CASCADE'))
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

  # Insert modules, build timetables, and create recurring lectures
  print("Adding modules and lectures...")
  NUM_WEEKS = 12
  # Semester starts 60 days ago, aligned to a Monday
  raw_start = datetime.now(timezone.utc) - timedelta(days=60)
  # Roll back to the previous Monday
  semester_start = raw_start - timedelta(days=raw_start.weekday())
  semester_start = semester_start.replace(hour=0, minute=0, second=0, microsecond=0)

  # Track lectures for lecturer id 69
  lecturer_69_lectures = []
  dr_johnson_module_count = 0

  # Maps: course_code → list of (module_id, [(weekday,hour), ...])
  course_timetables: dict[str, list[tuple[int, list[tuple[int, int]]]]] = {}
  # All lecture IDs that belong to the regular timetable (not Dr. Johnson's extras)
  regular_lecture_ids: dict[int, list[int]] = {}  # module_id → [lecture_id, ...]

  non_dr_j_staff = [s for s in staff if s['student_id'] != '69']
  staff_idx = 0

  for course_code, module_names in MODULES_BY_COURSE.items():
    timetable = build_course_timetable(module_names)
    course_timetables[course_code] = []

    for module_name in module_names:
      module = Module(name=module_name, course_code=course_code)
      db.session.add(module)
      db.session.flush()

      slots = timetable[module_name]
      course_timetables[course_code].append((module.id, slots))
      regular_lecture_ids[module.id] = []

      # Assign lecturer: first 2 modules to dr_johnson, rest round-robin other staff
      if dr_johnson_module_count < 2:
        assigned_lecturer = '69'
        dr_johnson_module_count += 1
      else:
        assigned_lecturer = non_dr_j_staff[staff_idx % len(non_dr_j_staff)]['student_id']
        staff_idx += 1

      # Create recurring lectures: same day/hour each week for NUM_WEEKS
      for week in range(NUM_WEEKS):
        for weekday, hour in slots:
          lecture_start = semester_start + timedelta(weeks=week, days=weekday, hours=hour)
          lecture_end = lecture_start + timedelta(hours=1)

          lecture = Lecture(
            module_id=module.id,
            lecturer_id=assigned_lecturer,
            start_time=lecture_start,
            end_time=lecture_end
          )
          db.session.add(lecture)
          db.session.flush()

          regular_lecture_ids[module.id].append(lecture.id)
          if assigned_lecturer == '69':
            lecturer_69_lectures.append(lecture.id)

  # Add back-to-back lectures for lecturer 69 (past 14 days + next 7 days)
  print("Adding back-to-back lectures for lecturer 69...")
  base_start = datetime.now(timezone.utc) - timedelta(days=14)
  first_module_id = Module.query.first().id

  # Create 21 days of hourly lectures: 14 days in the past + 7 days into the future
  for day in range(21):
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

  # ── Enrol students 1-50: each in exactly one course ────────────────────
  print("Enrolling students 1-50 into courses...")
  course_codes = list(course_timetables.keys())

  for i, student_data in enumerate(students):
    sid = student_data['student_id']
    # Distribute students roughly evenly across courses
    course_code = course_codes[i % len(course_codes)]

    # Enrol in every lecture of every module in that course
    for module_id, _slots in course_timetables[course_code]:
      for lecture_id in regular_lecture_ids[module_id]:
        db.session.add(LectureAttendance(
          user_id=sid,
          lecture_id=lecture_id,
          is_attended=False
        ))

  # Assign students 100-150 to ALL Dr. Johnson lectures
  print("Assigning students 100-150 to all Dr. Johnson lectures...")
  for lecture_id in lecturer_69_lectures:
    for student in dr_johnson_students:
      db.session.add(LectureAttendance(
        user_id=student['student_id'],
        lecture_id=lecture_id,
        is_attended=False
      ))
  
  db.session.commit()
  
  # ── Build realistic streaks for every student ──────────────────────────
  print("Building realistic streaks for all students...")
  now = datetime.now(timezone.utc)

  def generate_capped_random(length, max_run):
    """Return a list of bools with no True-run longer than max_run."""
    result = []
    run = 0
    for _ in range(length):
      if run >= max_run:
        result.append(False)
        run = 0
      else:
        val = random.random() < 0.7
        result.append(val)
        run = run + 1 if val else 0
    return result

  def build_attendance_pattern(n, target_current, target_longest):
    """
    Return a list of n bools whose trailing True-run == target_current
    and whose maximum True-run == target_longest.
    """
    if n == 0:
      return []

    # Clamp to available lectures
    target_current = min(target_current, n)
    target_longest = min(target_longest, n)
    target_longest = max(target_longest, target_current)

    # Index of the mandatory False that breaks the current streak
    break_idx = n - target_current - 1  # may be < 0

    if break_idx < 0:
      # Not enough lectures for a break – everything is the current streak
      return [True] * n

    if target_longest == target_current:
      # Only need: [random (capped)] + [False] + [True * current]
      pre = generate_capped_random(break_idx, target_longest - 1)
      return pre + [False] + [True] * target_current

    # target_longest > target_current → place the best-run just before the break
    run_start = break_idx - target_longest
    if run_start < 0:
      # Shrink longest to fit
      run_start = 0
      target_longest = break_idx  # everything from 0..break_idx-1

    if run_start > 0:
      pre = generate_capped_random(run_start - 1, target_longest - 1)
      pre.append(False)  # break before the longest run
    else:
      pre = []

    longest_block = [True] * target_longest
    return pre + longest_block + [False] + [True] * target_current

  all_students = students + dr_johnson_students
  for student_data in all_students:
    sid = student_data['student_id']

    # Enrolled fully-finished lectures for this student, ordered by start_time
    # (excludes currently-active lectures so nobody is pre-marked as attended)
    past_attendances = (
      LectureAttendance.query
      .join(Lecture)
      .filter(LectureAttendance.user_id == sid)
      .filter(Lecture.end_time < now)
      .order_by(Lecture.start_time.asc())
      .all()
    )

    n = len(past_attendances)
    if n == 0:
      continue

    target_longest = random.randint(10, 20)
    target_current = random.randint(5, min(20, target_longest))

    pattern = build_attendance_pattern(n, target_current, target_longest)

    for att, attended in zip(past_attendances, pattern):
      att.is_attended = attended

    # Compute the actual streaks from the pattern we just wrote
    # (handles edge-cases where targets were clamped)
    actual_current = 0
    for v in reversed(pattern):
      if v:
        actual_current += 1
      else:
        break
    actual_longest = 0
    run = 0
    for v in pattern:
      if v:
        run += 1
        actual_longest = max(actual_longest, run)
      else:
        run = 0

    user_obj = Users.query.get(sid)
    user_obj.current_streak = actual_current
    user_obj.longest_streak = actual_longest

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
  print(f"- All {len(all_students)} students have realistic streaks (current 5-20, best 10-20)")
