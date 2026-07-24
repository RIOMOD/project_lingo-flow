-- Fix vocabulary_progress schema to match JPA VocabularyProgress entity

ALTER TABLE vocabulary_progress ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'NEW';
ALTER TABLE vocabulary_progress ADD COLUMN mastery_score DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE vocabulary_progress ADD COLUMN correct_count INT NOT NULL DEFAULT 0;
ALTER TABLE vocabulary_progress ADD COLUMN incorrect_count INT NOT NULL DEFAULT 0;
ALTER TABLE vocabulary_progress ADD COLUMN consecutive_correct INT NOT NULL DEFAULT 0;
ALTER TABLE vocabulary_progress ADD COLUMN review_count INT NOT NULL DEFAULT 0;
ALTER TABLE vocabulary_progress ADD COLUMN average_response_time BIGINT NULL DEFAULT 0;
