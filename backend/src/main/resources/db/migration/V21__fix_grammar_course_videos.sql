-- V21: Update real YouTube video links for 'Grammar for Real Communication' course
-- This fixes the issue where all lessons were sharing the same placeholder future-form video.

-- 1. Present Simple or Present Continuous
UPDATE lessons 
SET video_url = 'https://www.youtube.com/watch?v=D-aQ0eX9lV0' 
WHERE title = 'Present Simple or Present Continuous';

-- 2. Past Simple or Present Perfect
UPDATE lessons 
SET video_url = 'https://www.youtube.com/watch?v=q1LKvqHEt7A' 
WHERE title = 'Past Simple or Present Perfect';

-- 3. Choosing the Right Future Form (Use the BBC 6 Minute Grammar future video)
UPDATE lessons 
SET video_url = 'https://www.youtube.com/watch?v=elPHkXNxi2g' 
WHERE title = 'Choosing the Right Future Form';

-- 4. Conditionals and Advice
UPDATE lessons 
SET video_url = 'https://www.youtube.com/watch?v=Ojo2t-73wP4' 
WHERE title = 'Conditionals and Advice';
