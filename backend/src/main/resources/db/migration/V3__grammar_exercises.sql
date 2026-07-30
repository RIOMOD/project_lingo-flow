CREATE TABLE grammar_exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    CONSTRAINT fk_ge_topic FOREIGN KEY (topic_id) REFERENCES grammar_topics(id) ON DELETE CASCADE
);

CREATE TABLE grammar_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    level VARCHAR(50) NOT NULL DEFAULT 'BEGINNER',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME,
    CONSTRAINT fk_gq_exercise FOREIGN KEY (exercise_id) REFERENCES grammar_exercises(id) ON DELETE CASCADE
);

CREATE TABLE grammar_question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_gqo_question FOREIGN KEY (question_id) REFERENCES grammar_questions(id) ON DELETE CASCADE
);

CREATE TABLE grammar_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_ga_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ga_exercise FOREIGN KEY (exercise_id) REFERENCES grammar_exercises(id) ON DELETE CASCADE
);

CREATE TABLE grammar_attempt_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_gaa_attempt FOREIGN KEY (attempt_id) REFERENCES grammar_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_gaa_question FOREIGN KEY (question_id) REFERENCES grammar_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_gaa_option FOREIGN KEY (selected_option_id) REFERENCES grammar_question_options(id) ON DELETE SET NULL
);
