-- Initial database setup

-- Users table
CREATE TABLE IF NOT EXISTS users (
    student_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    "isStaff" BOOLEAN DEFAULT FALSE NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    course_code TEXT REFERENCES courses(code)
);

-- Lectures table
CREATE TABLE IF NOT EXISTS lectures (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id),
    lecturer_id TEXT REFERENCES users(student_id),
    start_time TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP(0) WITH TIME ZONE NOT NULL
);

-- Lecture attendance table
CREATE TABLE IF NOT EXISTS lecture_attendance (
    user_id TEXT NOT NULL REFERENCES users(student_id),
    lecture_id INTEGER NOT NULL REFERENCES lectures(id),
    is_attended BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY (user_id, lecture_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS fki_fk_course ON modules(course_code);
CREATE INDEX IF NOT EXISTS fki_fk_lecture ON lecture_attendance(lecture_id);
CREATE INDEX IF NOT EXISTS fki_fk_user ON lecture_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_lectures ON lectures(lecturer_id);

-- Index for efficient "find previous lecture by time" queries (streak calculation)
CREATE INDEX IF NOT EXISTS idx_lecture_start_desc ON lectures(start_time DESC, id);

-- Index for efficient module → lectures joins (leaderboard, attendance queries)
CREATE INDEX IF NOT EXISTS idx_lectures_module_id ON lectures(module_id);

