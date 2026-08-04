ALTER TABLE questions ADD COLUMN skill_type VARCHAR(30) NULL;
ALTER TABLE questions ADD COLUMN topic VARCHAR(120) NULL;
ALTER TABLE questions ADD COLUMN recommended_lesson_id BIGINT  NULL;

ALTER TABLE questions
  ADD CONSTRAINT fk_questions_recommended_lesson
  FOREIGN KEY (recommended_lesson_id) REFERENCES lessons(id);

CREATE INDEX idx_questions_skill_topic ON questions(skill_type, topic);
CREATE INDEX idx_questions_recommended_lesson ON questions(recommended_lesson_id);

UPDATE questions
SET skill_type = CASE question_type
  WHEN 'LISTENING_MULTIPLE_CHOICE' THEN 'LISTENING'
  WHEN 'WRITING' THEN 'WRITING'
  WHEN 'FILL_IN_THE_BLANK' THEN 'GRAMMAR'
  WHEN 'SENTENCE_ORDERING' THEN 'GRAMMAR'
  ELSE 'READING'
END
WHERE skill_type IS NULL;

UPDATE questions
SET topic = 'Kiến thức tổng hợp'
WHERE topic IS NULL;
