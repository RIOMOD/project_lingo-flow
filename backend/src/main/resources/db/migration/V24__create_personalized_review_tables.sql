-- Migration: V24 Create Personalized Review Tables
CREATE TABLE personalized_review_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source_attempt_id BIGINT,
    total_questions INT NOT NULL DEFAULT 0,
    pre_accuracy DECIMAL(5, 2) DEFAULT 0.00,
    post_accuracy DECIMAL(5, 2) DEFAULT 0.00,
    improvement_percent DECIMAL(5, 2) DEFAULT 0.00,
    feedback_tag VARCHAR(50) DEFAULT 'NEED_MORE_PRACTICE',
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_prs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_prs_attempt FOREIGN KEY (source_attempt_id) REFERENCES test_attempts(id) ON DELETE SET NULL
);

CREATE TABLE personalized_review_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    topic VARCHAR(100),
    skill_type VARCHAR(50),
    weight_order INT DEFAULT 1,
    CONSTRAINT fk_prq_session FOREIGN KEY (session_id) REFERENCES personalized_review_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_prq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_prs_user_created ON personalized_review_sessions(user_id, created_at DESC);
CREATE INDEX idx_prq_session ON personalized_review_questions(session_id);
