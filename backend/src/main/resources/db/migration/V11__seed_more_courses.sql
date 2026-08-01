-- Seed additional sample courses for a richer learning catalog

INSERT INTO courses (
  id, category_id, teacher_id, title, slug, short_description, description,
  thumbnail_url, level, course_type, original_price, sale_price, sale_start_at,
  sale_end_at, status, published_at
) VALUES
  (6, 2, 2, 'Luyện thi TOEIC 750+ Chuyên sâu', 'luyen-thi-toeic-750-chuyen-sau', 'Chiến lược làm bài Listening & Reading đạt điểm cao.', 'Khóa học cung cấp mẹo xử lý Part 1-7, mở rộng vốn từ vựng thương mại và các bài thi thử TOEIC thực chiến.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80', 'INTERMEDIATE', 'PAID', 1450000.00, 890000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),

  (7, 1, 5, 'Tiếng Anh Du lịch & Định cư Thực tế', 'tieng-anh-du-lich-va-dinh-cu-thuc-te', 'Làm chủ tình huống khi đi nước ngoài & giao tiếp tự nhiên.', 'Hướng dẫn đặt vé, làm thủ tục sân bay, nhận phòng khách sạn, giao tiếp với người bản xứ và xử lý tình huống khẩn cấp.', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80', 'ELEMENTARY', 'PAID', 1100000.00, 650000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),

  (8, 2, 2, 'Bí quyết Luyện Nói Speaking Band 7.0+', 'bi-quyet-luyen-noi-speaking-band-7-plus', 'Nâng cấp từ vựng C1-C2 và độ trôi chảy khi phản xạ.', 'Học cách phát triển ý tưởng Part 1, 2, 3, làm chủ ngữ điệu tự nhiên và tự tin đạt điểm cao trong kỳ thi Speaking.', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80', 'ADVANCED', 'PAID', 1800000.00, 1190000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),

  (9, 4, 5, 'Tiếng Anh Phỏng vấn Xin việc & Viết CV', 'tieng-anh-phong-van-xin-viec-va-viet-cv', 'Chinh phục nhà tuyển dụng nước ngoài và tập đoàn đa quốc gia.', 'Xây dựng CV tiếng Anh chuẩn ATS, trả lời 20 câu hỏi phỏng vấn phổ biến và đàm phán mức lương tự tin.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80', 'INTERMEDIATE', 'PAID', 950000.00, 590000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),

  (10, 3, 2, 'Ngữ pháp Tiếng Anh Ứng dụng Thực chiến', 'ngu-phap-tieng-anh-ung-dung-thuc-chien', 'Khóa FREE chuẩn hóa ngữ pháp nền tảng.', 'Nắm vững 12 thì cơ bản, cấu trúc câu điều kiện, mệnh đề quan hệ và sửa các lỗi sai ngữ pháp thường gặp.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80', 'BEGINNER', 'FREE', 0.00, NULL, NULL, NULL, 'PUBLISHED', CURRENT_TIMESTAMP),

  (11, 4, 5, 'Tiếng Anh Thuyết trình & Đàm phán Thương mại', 'tieng-anh-thuyet-trinh-va-dam-phan-thuong-mai', 'Kỹ năng thuyết trình ấn tượng trước đối tác quốc tế.', 'Nghệ thuật làm slide tiếng Anh, kỹ thuật cuốn hút người nghe và các chiến thuật đàm phán hợp đồng thành công.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80', 'ADVANCED', 'PAID', 2100000.00, 1490000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP);

INSERT INTO chapters (id, course_id, title, description, position, status) VALUES
  (9, 6, 'TOEIC Listening Part 1-4', 'Mẹo nhận diện bẫy âm và từ đồng nghĩa', 1, 'PUBLISHED'),
  (10, 6, 'TOEIC Reading Part 5-7', 'Chiến thuật phân bổ thời gian hiệu quả', 2, 'PUBLISHED'),
  (11, 7, 'Thủ tục Sân bay & Xuất nhập cảnh', 'Mẫu câu hội thoại thực tế tại sân bay', 1, 'PUBLISHED'),
  (12, 7, 'Khách sạn & Ăn uống', 'Đặt phòng và gọi món tại nhà hàng', 2, 'PUBLISHED'),
  (13, 8, 'Developing Part 2 Stories', 'Xây dựng câu chuyện Part 2 cuốn hút', 1, 'PUBLISHED'),
  (14, 8, 'Academic Fluency', 'Phản xạ từ vựng C1-C2 tự nhiên', 2, 'PUBLISHED'),
  (15, 9, 'Viết CV tiếng Anh ATS', 'Cách dùng Action Verbs cho CV ấn tượng', 1, 'PUBLISHED'),
  (16, 9, '20 Câu hỏi phỏng vấn kinh điển', 'Trả lời theo phương pháp STAR', 2, 'PUBLISHED'),
  (17, 10, '12 Thì cơ bản', 'Làm chủ các thì trong tiếng Anh', 1, 'PUBLISHED'),
  (18, 10, 'Câu điều kiện & Mệnh đề quan hệ', 'Sử dụng cấu trúc câu nâng cao', 2, 'PUBLISHED'),
  (19, 11, 'Mở đầu bài thuyết trình', 'Gây ấn tượng 3 phút đầu tiên', 1, 'PUBLISHED'),
  (20, 11, 'Chiến thuật đàm phán hợp đồng', 'Đạt thỏa thuận win-win', 2, 'PUBLISHED');

INSERT INTO lessons (
  id, chapter_id, title, lesson_type, content, audio_url, video_url,
  position, duration_minutes, is_preview, status
) VALUES
  (19, 9, 'Mẹo Part 1: Mô tả hình ảnh', 'MIXED', 'Pay attention to verbs and position of people.', NULL, 'https://www.youtube.com/watch?v=DywRyvzWoYY', 1, 20, TRUE, 'PUBLISHED'),
  (20, 9, 'Mẹo Part 2: Hỏi - Đáp nhanh', 'AUDIO', 'Listen for WH-questions and auxiliary verbs.', 'https://www.oxfordonlineenglish.com/wp-content/uploads/2013/09/directions.mp3', NULL, 2, 22, FALSE, 'PUBLISHED'),
  (21, 11, 'Check-in tại quầy làm thủ tục', 'MIXED', 'May I see your passport and boarding pass?', NULL, 'https://www.youtube.com/watch?v=ruI2tdQzprg', 1, 18, TRUE, 'PUBLISHED'),
  (22, 13, 'Cấu trúc bài nói Part 2 chuẩn 2 phút', 'VIDEO', 'Hook, background, main story and personal feeling.', NULL, 'https://www.youtube.com/embed?listType=user_uploads&list=IELTSofficial', 1, 25, TRUE, 'PUBLISHED'),
  (23, 15, 'Kỹ thuật dùng Action Verbs trong CV', 'MIXED', 'Achieved, spearheaded, optimized and delivered.', NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk', 1, 24, TRUE, 'PUBLISHED'),
  (24, 17, 'Phân biệt Quá khứ đơn & Hiện tại hoàn thành', 'TEXT', 'Finished action vs experience with present relevance.', NULL, NULL, 1, 20, TRUE, 'PUBLISHED'),
  (25, 19, '3 Kỹ thuật mở đầu thuyết trình cuốn hút', 'MIXED', 'Start with a story, a statistic or a rhetorical question.', NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk', 1, 25, TRUE, 'PUBLISHED');
