-- V18: Perfect all lesson video URLs, checkpoint questions, and checkpoint answers across all courses

-- 1. Ensure Lesson 1 (Phân biệt Quá khứ đơn & Hiện tại hoàn thành) has working English lesson video & clear answer
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=aZ2uY_J4sZg',
    lesson_type = 'MIXED',
    checkpoint_question = 'Thì nào được sử dụng để diễn tả trải nghiệm cá nhân tính tới thời điểm hiện tại?',
    checkpoint_answer = 'Hiện tại hoàn thành',
    checkpoint_explanation = 'Thì Hiện tại hoàn thành (Present Perfect) dùng để diễn tả kinh nghiệm hoặc trải nghiệm sống tính đến thời điểm hiện tại.'
WHERE id = 1;

-- 2. Ensure Lesson 33 (Làm chủ 4 loại Câu điều kiện If 0-3) has working English Conditionals lesson video & clear answer
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=l4D8tO_q1l0',
    lesson_type = 'MIXED',
    checkpoint_question = 'Câu điều kiện loại mấy dùng để diễn tả sự thật hiển nhiên hoặc quy luật tự nhiên?',
    checkpoint_answer = 'Loại 0',
    checkpoint_explanation = 'Câu điều kiện loại 0 (If + Present Simple, Present Simple) dùng để chỉ sự thật hiển nhiên hoặc chân lý tự nhiên.'
WHERE id = 33;

-- 3. Replace any remaining placeholder/music video URLs across all lessons
UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=l4D8tO_q1l0'
WHERE video_url LIKE '%ruI2tdQzprg%' OR video_url LIKE '%Despacito%';

UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=t_Wd4G9zZms'
WHERE video_url LIKE '%DywRyvzWoYY%';

UPDATE lessons
SET video_url = 'https://www.youtube.com/watch?v=bA7a7Nq2j18'
WHERE video_url LIKE '%5MFQH5IHOFk%';

-- 4. Clean up checkpoint answers to be trimmed and concise for all lessons
UPDATE lessons
SET checkpoint_answer = TRIM(checkpoint_answer)
WHERE checkpoint_answer IS NOT NULL;
