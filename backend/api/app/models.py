from . import db

class Users(db.Model):
    """Main users table with student information"""
    __tablename__ = 'users'

    student_id = db.Column(db.Text, primary_key=True)
    username = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    is_staff = db.Column('isStaff', db.Boolean, default=False, nullable=False)
    current_streak = db.Column(db.Integer, default=0, nullable=False)
    longest_streak = db.Column(db.Integer, default=0, nullable=False)
    streak_last_date = db.Column(db.Date, nullable=True)

    # Relationship to lecture attendance
    attendances = db.relationship('LectureAttendance', back_populates='user')

    def __repr__(self):
        return f'<Users {self.username}>'


class Course(db.Model):
    __tablename__ = 'courses'

    code = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)

    # Relationship to modules
    modules = db.relationship('Module', back_populates='course')

    def __repr__(self):
        return f'<Course {self.code}>'


class Module(db.Model):
    __tablename__ = 'modules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    course_code = db.Column(db.Text, db.ForeignKey('courses.code'))

    # Relationships
    course = db.relationship('Course', back_populates='modules')
    lectures = db.relationship('Lecture', back_populates='module')

    def __repr__(self):
        return f'<Module {self.name}>'


class Lecture(db.Model):
    __tablename__ = 'lectures'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    lecturer_id = db.Column(db.Text, db.ForeignKey('users.student_id'))
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)

    # Relationships
    module = db.relationship('Module', back_populates='lectures')
    attendances = db.relationship('LectureAttendance', back_populates='lecture')
    lecturer = db.relationship('Users', foreign_keys=[lecturer_id])

    def __repr__(self):
        return f'<Lecture {self.id}>'


class LectureAttendance(db.Model):
    __tablename__ = 'lecture_attendance'

    user_id = db.Column(db.Text, db.ForeignKey('users.student_id'), primary_key=True)
    lecture_id = db.Column(db.Integer, db.ForeignKey('lectures.id'), primary_key=True)
    is_attended = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    user = db.relationship('Users', back_populates='attendances')
    lecture = db.relationship('Lecture', back_populates='attendances')

    def __repr__(self):
        return f'<LectureAttendance user={self.user_id} lecture={self.lecture_id}>'

