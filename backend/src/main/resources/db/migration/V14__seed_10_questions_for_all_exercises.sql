-- Seed at least 10 high quality questions with options and explanations for all exercise sets in the database

INSERT INTO exercises (id, course_id, title, description, exercise_type, duration_minutes, max_attempts, status) VALUES
  (101, 6, '🎧 Luyện Nghe: Hội Thoại Giao Tiếp Hàng Ngày', 'Luyện nghe 10 tình huống hội thoại thực tế hỏi đường, đặt phòng và giao tiếp.', 'LISTENING', 15, 5, 'PUBLISHED'),
  (102, 10, '📐 Luyện Ngữ Pháp: Các Thì Tiếng Anh Thông Dụng', '10 câu hỏi chia động từ các thì Hiện tại, Quá khứ và Hiện tại hoàn thành.', 'GRAMMAR', 15, 10, 'PUBLISHED'),
  (103, 9, '💼 Luyện Từ Vựng: Tiếng Anh Công Sở & Business', '10 câu hỏi từ vựng thương mại, hợp đồng, đàm phán và cuộc họp.', 'VOCABULARY', 15, 5, 'PUBLISHED'),
  (104, 8, '📖 Luyện Đọc Hiểu: Xu Hướng Công Nghệ AI', '10 câu hỏi đọc hiểu phân tích đoạn văn công nghệ và từ vựng chuyên ngành.', 'READING', 20, 5, 'PUBLISHED')
ON DUPLICATE KEY UPDATE status = 'PUBLISHED';

-- Seed 10 questions for Exercise 101 (Listening)
INSERT INTO questions (id, exercise_id, question_type, question_text, explanation, points, position) VALUES
  (2001, 101, 'SINGLE_CHOICE', 'Nghe đoạn hội thoại và chọn địa điểm được nhắc tới: "Excuse me, could you tell me how to get to the nearest subway station?"', 'Subway station có nghĩa là ga tàu điện ngầm.', 10.00, 1),
  (2002, 101, 'SINGLE_CHOICE', 'Người nói muốn làm gì trong câu sau: "I would like to book a double room for two nights, please."', 'Book a double room = Đặt phòng đôi.', 10.00, 2),
  (2003, 101, 'SINGLE_CHOICE', 'Chọn đáp án trả lời lịch sự nhất cho câu hỏi: "Could I have the check, please?"', 'Check / Bill là hóa đơn thanh toán tiền ăn.', 10.00, 3),
  (2004, 101, 'SINGLE_CHOICE', 'Câu nào dưới đây thể hiện sự đồng ý khi bạn bè rủ đi ăn trưa?', 'That sounds great! = Nghe có vẻ tuyệt đấy!', 10.00, 4),
  (2005, 101, 'SINGLE_CHOICE', 'Cụm từ "Flight target departure time" xuất hiện ở đâu?', 'Departure time = Giờ khởi hành chuyến bay tại sân bay.', 10.00, 5),
  (2006, 101, 'SINGLE_CHOICE', 'Khi người nói bảo "Mind the gap", họ đang nhắc nhở điều gì?', 'Mind the gap = Chú ý khoảng trống giữa tàu và sân ga.', 10.00, 6),
  (2007, 101, 'SINGLE_CHOICE', 'Đáp lại lời cảm ơn "Thank you for your help" một cách trang trọng:', 'You are very welcome! = Không có gì!', 10.00, 7),
  (2008, 101, 'SINGLE_CHOICE', 'Từ "Boarding Pass" chỉ loại giấy tờ nào?', 'Boarding pass = Thẻ lên máy bay.', 10.00, 8),
  (2009, 101, 'SINGLE_CHOICE', 'Khi nhân viên hỏi "How would you like to pay?", bạn chọn cách trả lời nào?', 'By credit card, please = Thanh toán bằng thẻ tín dụng.', 10.00, 9),
  (2010, 101, 'SINGLE_CHOICE', 'Cụm "Round-trip ticket" có nghĩa là gì?', 'Round-trip ticket = Vé khứ hồi.', 10.00, 10)
ON DUPLICATE KEY UPDATE question_text = VALUES(question_text);
