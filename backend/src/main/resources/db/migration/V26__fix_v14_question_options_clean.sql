-- V26: Fix V14 question options — delete placeholder options and ensure clean, meaningful options exist
-- Root cause: V25 ON DUPLICATE KEY UPDATE only updates existing rows but older placeholder rows
-- with different IDs may persist. This migration cleans all options for questions 2001–2010 first.

DELETE FROM answer_options WHERE question_id IN (2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
  -- 2001: Nghe đoạn hội thoại - nearest subway station
  (2001, 'Ga tàu điện ngầm', TRUE,  1),
  (2001, 'Trạm xe buýt trung tâm', FALSE, 2),
  (2001, 'Sân bay quốc tế', FALSE, 3),
  (2001, 'Bến tàu thủy', FALSE, 4),

  -- 2002: Book a double room for two nights
  (2002, 'Đặt một phòng đôi cho 2 đêm', TRUE,  1),
  (2002, 'Đặt một phòng đơn cho 1 đêm', FALSE, 2),
  (2002, 'Trả phòng khách sạn sớm', FALSE, 3),
  (2002, 'Đặt bàn ăn tối cho 2 người', FALSE, 4),

  -- 2003: Could I have the check, please?
  (2003, 'Here is your check/bill, sir.', TRUE,  1),
  (2003, 'Yes, I would like some coffee.', FALSE, 2),
  (2003, 'The room is ready now.', FALSE, 3),
  (2003, 'I am looking for a taxi.', FALSE, 4),

  -- 2004: Sự đồng ý khi bạn bè rủ đi ăn trưa
  (2004, 'That sounds great! Let us go.', TRUE,  1),
  (2004, 'Sorry, I am too busy today.', FALSE, 2),
  (2004, 'I do not think so.', FALSE, 3),
  (2004, 'No, thank you very much.', FALSE, 4),

  -- 2005: Flight target departure time
  (2005, 'Giờ khởi hành chuyến bay', TRUE,  1),
  (2005, 'Giờ hạ cánh dự kiến', FALSE, 2),
  (2005, 'Số ghế trên tàu', FALSE, 3),
  (2005, 'Hạn cân hành lý ký gửi', FALSE, 4),

  -- 2006: Mind the gap
  (2006, 'Chú ý khoảng trống giữa tàu và mép sân ga', TRUE,  1),
  (2006, 'Vui lòng giữ trật tự trên toa tàu', FALSE, 2),
  (2006, 'Không mang vật dễ cháy nổ trên tàu', FALSE, 3),
  (2006, 'Xin xuất trình vé cho nhân viên soát vé', FALSE, 4),

  -- 2007: Thank you for your help – formal response
  (2007, 'You are very welcome!', TRUE,  1),
  (2007, 'Yes, please.', FALSE, 2),
  (2007, 'Never mind.', FALSE, 3),
  (2007, 'See you next time.', FALSE, 4),

  -- 2008: Boarding Pass
  (2008, 'Thẻ lên máy bay', TRUE,  1),
  (2008, 'Hộ chiếu cá nhân', FALSE, 2),
  (2008, 'Tờ khai y tế', FALSE, 3),
  (2008, 'Hóa đơn tiền phòng khách sạn', FALSE, 4),

  -- 2009: How would you like to pay?
  (2009, 'By credit card, please.', TRUE,  1),
  (2009, 'Yes, it is very expensive.', FALSE, 2),
  (2009, 'I prefer tea over coffee.', FALSE, 3),
  (2009, 'At five o''clock in the afternoon.', FALSE, 4),

  -- 2010: Round-trip ticket
  (2010, 'Vé khứ hồi (đi và về)', TRUE,  1),
  (2010, 'Vé một chiều', FALSE, 2),
  (2010, 'Vé hạng thương gia', FALSE, 3),
  (2010, 'Thẻ thành viên tích điểm', FALSE, 4);
