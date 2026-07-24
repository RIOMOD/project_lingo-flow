-- Student learning telemetry and lesson checkpoint metadata.
-- Apply after 001_create_schema.sql and before 001_seed_sample_data.sql on a fresh database.

ALTER TABLE lessons
  ADD COLUMN checkpoint_question VARCHAR(500) NULL AFTER video_url,
  ADD COLUMN checkpoint_answer VARCHAR(255) NULL AFTER checkpoint_question,
  ADD COLUMN checkpoint_explanation VARCHAR(1000) NULL AFTER checkpoint_answer;

ALTER TABLE learning_progress
  ADD COLUMN study_time_seconds INT NOT NULL DEFAULT 0 AFTER study_time_minutes,
  ADD COLUMN media_position_seconds DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER study_time_seconds,
  ADD COLUMN media_duration_seconds DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER media_position_seconds,
  ADD COLUMN content_progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER media_duration_seconds,
  ADD COLUMN checkpoint_score DECIMAL(5,2) NULL AFTER content_progress_percent,
  ADD COLUMN checkpoint_passed BOOLEAN NOT NULL DEFAULT FALSE AFTER checkpoint_score,
  ADD COLUMN checkpoint_attempts INT NOT NULL DEFAULT 0 AFTER checkpoint_passed,
  ADD CONSTRAINT ck_learning_content_progress CHECK (content_progress_percent BETWEEN 0 AND 100),
  ADD CONSTRAINT ck_learning_media_position CHECK (media_position_seconds >= 0),
  ADD CONSTRAINT ck_learning_study_seconds CHECK (study_time_seconds >= 0);

UPDATE lessons
SET checkpoint_question = CONCAT('Bạn vừa hoàn thành nội dung chính nào trong bài “', title, '”?'),
    checkpoint_answer = LOWER(TRIM(title)),
    checkpoint_explanation = CONCAT('Hãy xem lại ý chính và nhập đúng tên bài: ', title)
WHERE checkpoint_question IS NULL;
