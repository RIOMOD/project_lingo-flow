-- Migration: V29 Create missing grammar module tables
-- This creates the schema for GrammarExercises, Questions, Options, Attempts and Answers, which are referenced by the Grammar module and the Leaderboard XP calculator.

CREATE TABLE grammar_exercises (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT  NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_grammar_exercises_topic FOREIGN KEY (topic_id) REFERENCES grammar_topics(id)
);

CREATE TABLE grammar_questions (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT  NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'BEGINNER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_grammar_questions_exercise FOREIGN KEY (exercise_id) REFERENCES grammar_exercises(id)
);

CREATE TABLE grammar_question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT  NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_gqo_question FOREIGN KEY (question_id) REFERENCES grammar_questions(id) ON DELETE CASCADE
);

CREATE TABLE grammar_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT  NOT NULL,
    exercise_id BIGINT  NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grammar_attempts_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_grammar_attempts_exercise FOREIGN KEY (exercise_id) REFERENCES grammar_exercises(id)
);

CREATE TABLE grammar_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT  NOT NULL,
    question_id BIGINT  NOT NULL,
    selected_option_id BIGINT  NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_gaa_attempt FOREIGN KEY (attempt_id) REFERENCES grammar_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_gaa_question FOREIGN KEY (question_id) REFERENCES grammar_questions(id),
    CONSTRAINT fk_gaa_option FOREIGN KEY (selected_option_id) REFERENCES grammar_question_options(id)
);

CREATE INDEX idx_grammar_exercises_topic ON grammar_exercises(topic_id);
CREATE INDEX idx_grammar_questions_exercise ON grammar_questions(exercise_id);
CREATE INDEX idx_gqo_question ON grammar_question_options(question_id);
CREATE INDEX idx_grammar_attempts_user ON grammar_attempts(user_id);
CREATE INDEX idx_grammar_attempts_exercise ON grammar_attempts(exercise_id);
CREATE INDEX idx_gaa_attempt ON grammar_attempt_answers(attempt_id);
