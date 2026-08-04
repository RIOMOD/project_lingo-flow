ALTER TABLE test_attempts
  ADD COLUMN test_snapshot JSON NULL AFTER score;

ALTER TABLE questions
  ADD COLUMN owner_user_id BIGINT  NULL AFTER id;

ALTER TABLE questions
  ADD CONSTRAINT fk_questions_owner FOREIGN KEY (owner_user_id) REFERENCES users(id);

UPDATE questions
SET owner_user_id = (
    SELECT c.teacher_id
    FROM exercises e
    JOIN courses c ON c.id = e.course_id
    WHERE e.id = questions.exercise_id
)
WHERE owner_user_id IS NULL AND exercise_id IS NOT NULL;

UPDATE questions
SET owner_user_id = (
    SELECT c.teacher_id
    FROM test_questions tq
    JOIN tests t ON t.id = tq.test_id
    JOIN courses c ON c.id = t.course_id
    WHERE tq.question_id = questions.id
    LIMIT 1
)
WHERE owner_user_id IS NULL;

CREATE INDEX idx_questions_owner_user_id ON questions(owner_user_id);

ALTER TABLE payment_transactions
  ADD CONSTRAINT uk_payment_transactions_gateway_code UNIQUE (gateway_transaction_code);
