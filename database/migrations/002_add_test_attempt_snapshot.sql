ALTER TABLE test_attempts
  ADD COLUMN test_snapshot JSON NULL AFTER score;

ALTER TABLE questions
  ADD COLUMN owner_user_id BIGINT UNSIGNED NULL AFTER id,
  ADD CONSTRAINT fk_questions_owner FOREIGN KEY (owner_user_id) REFERENCES users(id);

UPDATE questions q
JOIN exercises e ON e.id = q.exercise_id
JOIN courses c ON c.id = e.course_id
SET q.owner_user_id = c.teacher_id
WHERE q.owner_user_id IS NULL;

UPDATE questions q
JOIN test_questions tq ON tq.question_id = q.id
JOIN tests t ON t.id = tq.test_id
JOIN courses c ON c.id = t.course_id
SET q.owner_user_id = c.teacher_id
WHERE q.owner_user_id IS NULL;

CREATE INDEX idx_questions_owner_user_id ON questions(owner_user_id);

ALTER TABLE payment_transactions
  ADD CONSTRAINT uk_payment_transactions_gateway_code UNIQUE (gateway_transaction_code);
