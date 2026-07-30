-- Enrich lesson 2 and lesson 3 with video URLs and detailed conversation content

UPDATE lessons 
SET lesson_type = 'MIXED',
    video_url = 'https://www.youtube.com/watch?v=DywRyvzWoYY',
    content = 'Học các mẫu câu hỏi thăm sức khỏe, tâm trạng và cách phản hồi lịch sự trong tiếng Anh hằng ngày:

1. How are you today? (Bạn hôm nay thế nào?)
- I am doing great, thank you! (Tôi rất tốt, cảm ơn bạn!)
- Pretty good, how about you? (Khá tốt, còn bạn thì sao?)
- Not bad, thanks. (Không tệ, cảm ơn bạn.)

2. How is it going? (Mọi chuyện thế nào rồi?)
- Everything is fine! (Mọi thứ đều ổn!)
- Couldn''t be better! (Không thể tốt hơn!)

3. Luyện tập theo video bài giảng để nắm vững phát âm và ngữ điệu hội thoại tự nhiên.'
WHERE id = 2;

UPDATE lessons 
SET lesson_type = 'MIXED',
    video_url = 'https://www.youtube.com/watch?v=DywRyvzWoYY',
    content = 'Các mẫu câu phổ biến khi gọi món tại quán cà phê:

1. Order drinks:
- Can I have an Iced Americano, please? (Cho tôi một ly Americano đá nhé)
- I''d like a Latte with oat milk. (Cho tôi một Latte sữa yến mạch)

2. Response:
- Sure! Would you like anything else? (Dạ được! Bạn có muốn dùng thêm gì không?)
- Takeaway or dine-in? (Mang đi hay dùng tại chỗ ạ?)'
WHERE id = 3;
