-- Seed full published lessons for all remaining chapters across courses

INSERT INTO lessons (
  id, chapter_id, title, lesson_type, content, audio_url, video_url,
  checkpoint_question, checkpoint_answer, checkpoint_explanation,
  position, duration_minutes, is_preview, status
) VALUES
  -- Chapter 16: 20 Câu hỏi phỏng vấn kinh điển
  (26, 16, 'Mô hình trả lời STAR thần thánh', 'MIXED',
   'Hướng dẫn áp dụng công thức STAR (Situation, Task, Action, Result) để trả lời thuyết phục mọi câu hỏi tình huống trong phỏng vấn.

🎯 Cấu trúc bài trả lời STAR:
• S - Situation (15%): Mô tả bối cảnh tình huống thực tế.
• T - Task (15%): Thách thức hoặc nhiệm vụ cần đạt được.
• A - Action (50%): Các bước cụ thể BẠN đã thực hiện (dùng Action Verbs).
• R - Result (20%): Kết quả thành công đo lường bằng con số.',
   NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk',
   'Chữ A trong mô hình STAR viết tắt của từ tiếng Anh nào?',
   'Action',
   'A đại diện cho Action - những hành động cụ thể bạn đã triển khai.',
   1, 20, TRUE, 'PUBLISHED'),

  (27, 16, 'Cách trả lời câu hỏi "Điểm yếu của bạn là gì?"', 'MIXED',
   'Bí quyết biến điểm yếu thành cơ hội chứng minh tinh thần cầu tiến trước nhà tuyển dụng.

💡 Quy tắc 3 KHÔNG:
1. KHÔNG trả lời "Tôi không có điểm yếu nào".
2. KHÔNG chọn điểm yếu gây ảnh hưởng trực tiếp tới năng lực cốt lõi của công việc.
3. KHÔNG đưa ra điểm yếu giả tạo như "Tôi quá cầu toàn".

✨ Công thức trả lời chuẩn:
Nêu 1 điểm yếu thực tế + Hành động bạn ĐANG làm để khắc phục + Tiến bộ đạt được.',
   NULL, 'https://www.youtube.com/watch?v=ruI2tdQzprg',
   'Khi nêu điểm yếu trong phỏng vấn, bạn luôn cần đi kèm với nội dung gì?',
   'Khắc phục',
   'Luôn phải trình bày giải pháp và hành động cụ thể bạn đang thực hiện để khắc phục điểm yếu đó.',
   2, 22, TRUE, 'PUBLISHED'),

  (28, 16, 'Đàm phán mức lương & Đặt câu hỏi ngược cho nhà tuyển dụng', 'MIXED',
   'Kỹ thuật đàm phán thu nhập tự tin và 5 câu hỏi thông minh hỏi lại nhà tuyển dụng cuối buổi phỏng vấn.

🗣️ Top 3 câu hỏi thể hiện tư duy chiến lược:
1. "Mục tiêu ưu tiên lớn nhất của phòng ban trong 6 tháng tới là gì?"
2. "Lộ trình phát triển và đánh giá hiệu suất công việc ở vị trí này như thế nào?"
3. "Văn hóa làm việc của team được thể hiện rõ nhất qua điều gì?"',
   NULL, 'https://www.youtube.com/watch?v=DywRyvzWoYY',
   'Cuối buổi phỏng vấn, bạn có nên đặt câu hỏi ngược lại cho nhà tuyển dụng không?',
   'Có',
   'Đặt câu hỏi ngược thể hiện sự quan tâm nghiêm túc và tinh thần chủ động của ứng viên.',
   3, 25, FALSE, 'PUBLISHED'),

  -- Chapter 10: TOEIC Reading Part 5-7
  (29, 10, 'Chiến thuật làm Part 5: Từ vựng & Ngữ pháp', 'MIXED',
   'Phương pháp phân loại câu hỏi Part 5 giúp làm nhanh dưới 30 giây mỗi câu.

📌 2 Dạng câu hỏi Part 5:
1. Câu hỏi Từ loại (Grammar): Nhìn trước & sau khoảng trống để chọn Noun, Verb, Adj, Adv.
2. Câu hỏi Từ vựng (Vocabulary): Dịch nghĩa ngữ cảnh để chọn từ phù hợp nhất.',
   NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk',
   'Với câu hỏi từ loại trong Part 5, bạn cần quan sát vị trí nào của khoảng trống?',
   'Trước và sau',
   'Quan sát từ đứng ngay trước và ngay sau khoảng trống giúp xác định từ loại nhanh chóng.',
   1, 20, TRUE, 'PUBLISHED'),

  (30, 10, 'Đọc nhanh Part 7: Đoạn văn đôi & Đoạn văn ba', 'MIXED',
   'Kỹ thuật Skimming & Scanning quét thông tin trong các bài đọc nối tiếp Part 7 TOEIC.',
   NULL, 'https://www.youtube.com/watch?v=ruI2tdQzprg',
   'Kỹ thuật đọc lướt lấy ý chính trong tiếng Anh gọi là gì?',
   'Skimming',
   'Skimming là kỹ thuật đọc lướt nhanh tiêu đề và câu đầu để nắm ý chính.',
   2, 25, FALSE, 'PUBLISHED'),

  -- Chapter 12: Khách sạn & Ăn uống
  (31, 12, 'Đặt phòng & Đổi phòng tại Khách sạn', 'MIXED',
   'Mẫu câu tiếng Anh giao tiếp chuẩn khi nhận phòng, yêu cầu dịch vụ phòng và đổi phòng.',
   NULL, 'https://www.youtube.com/watch?v=DywRyvzWoYY',
   'Cụm từ tiếng Anh nào dùng để làm thủ tục nhận phòng khách sạn?',
   'Check in',
   'Check-in là thủ tục xác nhận nhận phòng tại khách sạn.',
   1, 18, TRUE, 'PUBLISHED'),

  -- Chapter 14: Academic Fluency
  (32, 14, 'Phản xạ từ vựng C1-C2 tự nhiên trong Speaking', 'MIXED',
   'Nâng cấp câu nói thường ngày bằng các Idioms và Collocations cấp độ C1-C2.',
   NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk',
   'Để nói tiếng Anh tự nhiên như người bản xứ, bạn nên kết hợp học từ vựng theo cụm từ nào?',
   'Collocations',
   'Học theo cụm từ cố định (Collocations) giúp câu nói tự nhiên và trôi chảy.',
   1, 22, TRUE, 'PUBLISHED'),

  -- Chapter 18: Câu điều kiện & Mệnh đề quan hệ
  (33, 18, 'Làm chủ 4 loại Câu điều kiện (If 0-3)', 'MIXED',
   'Tổng hợp cấu trúc và ứng dụng của Câu điều kiện loại 0, 1, 2, 3 và câu điều kiện hỗn hợp.',
   NULL, 'https://www.youtube.com/watch?v=ruI2tdQzprg',
   'Câu điều kiện loại mấy dùng để diễn tả sự thật hiển nhiên hoặc quy luật tự nhiên?',
   'Loại 0',
   'Câu điều kiện loại 0 (If + Present Simple, Present Simple) dùng cho sự thật hiển nhiên.',
   1, 20, TRUE, 'PUBLISHED'),

  -- Chapter 20: Chiến thuật đàm phán hợp đồng
  (34, 20, 'Chiến thuật đàm phán hợp đồng Win-Win', 'MIXED',
   'Các thuật ngữ thương mại và kỹ thuật thuyết phục đối tác đạt thỏa thuận đôi bên cùng có lợi.',
   NULL, 'https://www.youtube.com/watch?v=DywRyvzWoYY',
   'Mô hình đàm phán đôi bên cùng có lợi trong tiếng Anh được gọi là gì?',
   'Win Win',
   'Win-Win negotiation là phương pháp đàm phán mà cả hai bên cùng đạt được lợi ích.',
   1, 25, TRUE, 'PUBLISHED');
