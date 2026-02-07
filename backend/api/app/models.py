from . import db

class Users(db.Model):
    """Main users table with student information"""
    __tablename__ = 'users'

    student_id = db.Column(db.String(255), primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_staff = db.Column('isStaff', db.Boolean, default=False, nullable=False)

    # Relationship to lecture attendance
    attendances = db.relationship('LectureAttendance', back_populates='user')

    def __repr__(self):
        return f'<Users {self.username}>'


class Course(db.Model):
    __tablename__ = 'courses'

    code = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    # Relationship to modules
    modules = db.relationship('Module', back_populates='course')

    def __repr__(self):
        return f'<Course {self.code}>'


class Module(db.Model):
    __tablename__ = 'modules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    course_code = db.Column(db.String(255), db.ForeignKey('courses.code'))

    # Relationships
    course = db.relationship('Course', back_populates='modules')
    lectures = db.relationship('Lecture', back_populates='module')

    def __repr__(self):
        return f'<Module {self.name}>'


class Lecture(db.Model):
    __tablename__ = 'lectures'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)

    # Relationships
    module = db.relationship('Module', back_populates='lectures')
    attendances = db.relationship('LectureAttendance', back_populates='lecture')

    def __repr__(self):
        return f'<Lecture {self.id}>'


class LectureAttendance(db.Model):
    __tablename__ = 'lecture_attendance'

    user_id = db.Column(db.String(255), db.ForeignKey('users.student_id'), primary_key=True)
    lecture_id = db.Column(db.Integer, db.ForeignKey('lectures.id'), primary_key=True)
    is_attended = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    user = db.relationship('Users', back_populates='attendances')
    lecture = db.relationship('Lecture', back_populates='attendances')

    def __repr__(self):
        return f'<LectureAttendance user={self.user_id} lecture={self.lecture_id}>'

