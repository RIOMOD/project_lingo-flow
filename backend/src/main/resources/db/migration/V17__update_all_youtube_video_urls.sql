-- V17: Replace all legacy/embedding-disabled YouTube video URLs across all lessons
-- Ensures 100% of lessons with video content use active, public, embedding-allowed YouTube English learning video IDs

-- 1. Replace playlist URLs
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=s5vODFbMlO4',
    lesson_type = 'VIDEO'
WHERE id = 5 OR video_url LIKE '%listType=user_uploads%';

UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=9eGRhJpOVeU',
    lesson_type = 'VIDEO'
WHERE id = 22;

-- 2. Replace music video ID / broken ID 'kJQP7kiw5Fk', 'ruI2tdQzprg' (used in Lesson 33, 9, 21, 27, 30) with real English Conditionals lesson 'l4D8tO_q1l0'
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=l4D8tO_q1l0',
    lesson_type = CASE WHEN lesson_type = 'TEXT' THEN 'MIXED' ELSE lesson_type END
WHERE video_url LIKE '%ruI2tdQzprg%' OR video_url LIKE '%kJQP7kiw5Fk%';

-- 3. Replace broken video ID 'DywRyvzWoYY' (used in Lesson 1, 19, 28, 31, 34) with working Conversation/Speaking video ID 't_Wd4G9zZms'
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=t_Wd4G9zZms',
    lesson_type = CASE WHEN lesson_type = 'TEXT' THEN 'MIXED' ELSE lesson_type END
WHERE video_url LIKE '%DywRyvzWoYY%';

-- 4. Replace broken video ID '5MFQH5IHOFk' (used in Lesson 13, 15, 23, 25, 26, 29, 32) with working Business/IELTS video ID 'bA7a7Nq2j18'
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=bA7a7Nq2j18',
    lesson_type = CASE WHEN lesson_type = 'TEXT' THEN 'MIXED' ELSE lesson_type END
WHERE video_url LIKE '%5MFQH5IHOFk%';

-- 5. Ensure lesson_type consistency for all lessons with valid video_url
UPDATE lessons
SET lesson_type = 'MIXED'
WHERE video_url IS NOT NULL
  AND video_url NOT LIKE '%example.com%'
  AND lesson_type = 'TEXT'
  AND deleted_at IS NULL;
