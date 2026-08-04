-- Student learning telemetry and lesson checkpoint metadata.

ALTER TABLE lessons ADD COLUMN checkpoint_question VARCHAR(500) NULL;
ALTER TABLE lessons ADD COLUMN checkpoint_answer VARCHAR(255) NULL;
ALTER TABLE lessons ADD COLUMN checkpoint_explanation VARCHAR(1000) NULL;

ALTER TABLE learning_progress ADD COLUMN study_time_seconds INT NOT NULL DEFAULT 0;
ALTER TABLE learning_progress ADD COLUMN media_position_seconds DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE learning_progress ADD COLUMN media_duration_seconds DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE learning_progress ADD COLUMN content_progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE learning_progress ADD COLUMN checkpoint_score DECIMAL(5,2) NULL;
ALTER TABLE learning_progress ADD COLUMN checkpoint_passed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE learning_progress ADD COLUMN checkpoint_attempts INT NOT NULL DEFAULT 0;

ALTER TABLE learning_progress ADD CONSTRAINT ck_learning_content_progress CHECK (content_progress_percent BETWEEN 0 AND 100);
ALTER TABLE learning_progress ADD CONSTRAINT ck_learning_media_position CHECK (media_position_seconds >= 0);
ALTER TABLE learning_progress ADD CONSTRAINT ck_learning_study_seconds CHECK (study_time_seconds >= 0);

UPDATE lessons
SET checkpoint_question = CONCAT('Bạn vừa hoàn thành nội dung chính nào trong bài “', title, '”?'),
    checkpoint_answer = LOWER(TRIM(title)),
    checkpoint_explanation = CONCAT('Hãy xem lại ý chính và nhập đúng tên bài: ', title)
WHERE checkpoint_question IS NULL;
