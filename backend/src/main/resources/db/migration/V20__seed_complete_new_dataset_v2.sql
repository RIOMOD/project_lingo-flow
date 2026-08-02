-- V20: Seed Complete New Dataset V2
-- Inserts 10 new courses (Everyday English Essentials, English for Online Communication, Listening in Public Places,
-- Reading Everyday Texts, Vocabulary Through Word Patterns, Grammar for Real Communication, Practical Writing for Study and Work,
-- Speaking with Confidence, Academic Study Skills in English, Critical English for Digital Life)
-- Includes 20 Chapters, 40 Lessons, 120 Vocabularies, 40 Grammar Topics, 10 Exercises, 100 Questions, 400 Answer Options

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- COURSE 1: Everyday English Essentials
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Everyday English Essentials', 'everyday-english-essentials', 'Xây dựng nền tảng giao tiếp cho các hoạt động quen thuộc mỗi ngày.', 'Khóa học mới dành cho người bắt đầu, giúp học viên nói về lịch sinh hoạt, thời gian, ăn uống và mua sắm bằng các mẫu câu ngắn, rõ ràng và dễ áp dụng.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Everyday+English+Essentials', 'BEGINNER', 'FREE', 0.00, NULL, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c1 = (SELECT id FROM courses WHERE slug = 'everyday-english-essentials');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c1, 'Sinh hoạt và thời gian', 'Chương 1 của khóa Everyday English Essentials, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c1, 'Ăn uống và mua sắm', 'Chương 2 của khóa Everyday English Essentials, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch1_1 = (SELECT id FROM chapters WHERE course_id = @c1 AND position = 1);
SET @ch1_2 = (SELECT id FROM chapters WHERE course_id = @c1 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch1_1, 'Morning and Evening Routines', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Mô tả hoạt động buổi sáng và buổi tối
- Dùng hiện tại đơn với thói quen
- Sắp xếp hoạt động theo trình tự

NỘI DUNG CHÍNH
Bài học “Morning and Evening Routines” giới thiệu từ vựng, cấu trúc và tình huống giao tiếp theo đúng chủ đề.', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Câu nào mô tả đúng thói quen mỗi sáng?', 'I get up at six every morning.', 'Hiện tại đơn được dùng cho hoạt động lặp lại.', 1, 20, TRUE, 'PUBLISHED'),
(@ch1_1, 'Telling Time and Making a Schedule', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Nói giờ chính xác
- Dùng giới từ thời gian at, on, in
- Mô tả thời khóa biểu

NỘI DUNG CHÍNH
Bài học “Telling Time and Making a Schedule” giới thiệu từ vựng, cấu trúc và tình huống giao tiếp theo đúng chủ đề.', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Half past seven là mấy giờ?', '7:30', 'Half past seven nghĩa là bảy giờ ba mươi.', 2, 22, FALSE, 'PUBLISHED'),
(@ch1_2, 'Ordering Food and Drinks', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Gọi món lịch sự
- Hỏi thành phần món ăn
- Yêu cầu hóa đơn

NỘI DUNG CHÍNH
Bài học “Ordering Food and Drinks” giới thiệu từ vựng, cấu trúc và tình huống giao tiếp theo đúng chủ đề.', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Câu nào dùng để gọi một món lịch sự?', 'I would like the chicken soup, please.', 'Would like là cách gọi món lịch sự.', 1, 24, FALSE, 'PUBLISHED'),
(@ch1_2, 'Shopping and Asking About Prices', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Hỏi giá và kích cỡ
- So sánh hai sản phẩm
- Yêu cầu thử hoặc đổi hàng

NỘI DUNG CHÍNH
Bài học “Shopping and Asking About Prices” giới thiệu từ vựng, cấu trúc và tình huống giao tiếp theo đúng chủ đề.', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Câu nào dùng để hỏi giá?', 'How much is this jacket?', 'How much dùng để hỏi giá tiền.', 2, 26, FALSE, 'PUBLISHED');

SET @l1_1 = (SELECT id FROM lessons WHERE chapter_id = @ch1_1 AND position = 1);
SET @l1_2 = (SELECT id FROM lessons WHERE chapter_id = @ch1_1 AND position = 2);
SET @l1_3 = (SELECT id FROM lessons WHERE chapter_id = @ch1_2 AND position = 1);
SET @l1_4 = (SELECT id FROM lessons WHERE chapter_id = @ch1_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c1, @l1_1, 'routine', '/ruːˈtiːn/', 'lịch sinh hoạt, thói quen', 'NOUN', 'My morning routine starts at six.', 'Lịch sinh hoạt buổi sáng của tôi bắt đầu lúc sáu giờ.', 'BEGINNER', 'Daily Routine'),
(@c1, @l1_1, 'wake up', '/weɪk ʌp/', 'thức dậy', 'PHRASE', 'I wake up before sunrise.', 'Tôi thức dậy trước khi mặt trời mọc.', 'BEGINNER', 'Daily Routine'),
(@c1, @l1_1, 'get dressed', '/ɡet drest/', 'mặc quần áo', 'PHRASE', 'She gets dressed after breakfast.', 'Cô ấy mặc quần áo sau bữa sáng.', 'BEGINNER', 'Daily Routine'),
(@c1, @l1_2, 'schedule', '/ˈskedʒuːl/', 'lịch trình', 'NOUN', 'My schedule is busy on Monday.', 'Lịch trình của tôi bận vào thứ Hai.', 'BEGINNER', 'Time and Schedule'),
(@c1, @l1_2, 'quarter', '/ˈkwɔːrtər/', 'một phần tư; mười lăm phút', 'NOUN', 'The class starts at a quarter past eight.', 'Lớp học bắt đầu lúc tám giờ mười lăm.', 'BEGINNER', 'Time and Schedule'),
(@c1, @l1_2, 'appointment', '/əˈpɔɪntmənt/', 'cuộc hẹn', 'NOUN', 'I have a dentist appointment at two.', 'Tôi có cuộc hẹn nha sĩ lúc hai giờ.', 'BEGINNER', 'Time and Schedule'),
(@c1, @l1_3, 'menu', '/ˈmenjuː/', 'thực đơn', 'NOUN', 'Could I see the menu, please?', 'Cho tôi xem thực đơn được không?', 'BEGINNER', 'Food and Drinks'),
(@c1, @l1_3, 'ingredient', '/ɪnˈɡriːdiənt/', 'nguyên liệu', 'NOUN', 'What ingredients are in this dish?', 'Món này có những nguyên liệu gì?', 'BEGINNER', 'Food and Drinks'),
(@c1, @l1_3, 'bill', '/bɪl/', 'hóa đơn', 'NOUN', 'Could we have the bill, please?', 'Cho chúng tôi xin hóa đơn được không?', 'BEGINNER', 'Food and Drinks'),
(@c1, @l1_4, 'price', '/praɪs/', 'giá', 'NOUN', 'The price includes tax.', 'Giá đã bao gồm thuế.', 'BEGINNER', 'Shopping'),
(@c1, @l1_4, 'size', '/saɪz/', 'kích cỡ', 'NOUN', 'Do you have this in a larger size?', 'Bạn có món này với kích cỡ lớn hơn không?', 'BEGINNER', 'Shopping'),
(@c1, @l1_4, 'receipt', '/rɪˈsiːt/', 'biên lai', 'NOUN', 'Please keep your receipt.', 'Vui lòng giữ biên lai.', 'BEGINNER', 'Shopping');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c1, @l1_1, 'Present Simple for Routines', 'Hiện tại đơn diễn tả thói quen và hoạt động lặp lại.', 'S + V(s/es) + O', 'Dùng với every day, usually, often và các lịch sinh hoạt.', 'He walks to school every day.', 'Thêm s/es khi chủ ngữ là he, she hoặc it.', 'BEGINNER'),
(@c1, @l1_2, 'Prepositions of Time', 'At, on và in được dùng với các loại mốc thời gian khác nhau.', 'at + time; on + day/date; in + month/year/part of day', 'At cho giờ, on cho ngày, in cho tháng, năm và buổi.', 'The meeting is at 9 a.m. on Friday.', 'Dùng at night nhưng in the morning.', 'BEGINNER'),
(@c1, @l1_3, 'Polite Requests with Would Like', 'Would like diễn tả mong muốn lịch sự.', 'S + would like + noun/to-infinitive', 'Dùng khi gọi món, mua hàng hoặc nói điều mình muốn.', 'I would like a glass of water.', 'Không dùng would like + V-ing.', 'BEGINNER'),
(@c1, @l1_4, 'How Much and How Many', 'How much hỏi lượng không đếm được hoặc giá; how many hỏi số lượng đếm được.', 'How much + uncountable noun; How many + plural countable noun', 'Dùng khi hỏi giá, lượng và số lượng.', 'How many shirts do you need?', 'How much is also used without a noun to ask the price.', 'BEGINNER');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c1, NULL, 'Everyday English Essentials – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex1 = (SELECT id FROM exercises WHERE course_id = @c1 AND title = 'Everyday English Essentials – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex1, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “lịch sinh hoạt, thói quen”?', '“routine” có nghĩa là “lịch sinh hoạt, thói quen”. Ví dụ: My morning routine starts at six.', 10.00, 'routine', 1),
(@ex1, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thức dậy”?', '“wake up” có nghĩa là “thức dậy”. Ví dụ: I wake up before sunrise.', 10.00, 'wake up', 2),
(@ex1, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “mặc quần áo”?', '“get dressed” có nghĩa là “mặc quần áo”. Ví dụ: She gets dressed after breakfast.', 10.00, 'get dressed', 3),
(@ex1, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “lịch trình”?', '“schedule” có nghĩa là “lịch trình”. Ví dụ: My schedule is busy on Monday.', 10.00, 'schedule', 4),
(@ex1, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “một phần tư; mười lăm phút”?', '“quarter” có nghĩa là “một phần tư; mười lăm phút”. Ví dụ: The class starts at a quarter past eight.', 10.00, 'quarter', 5),
(@ex1, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “cuộc hẹn”?', '“appointment” có nghĩa là “cuộc hẹn”. Ví dụ: I have a dentist appointment at two.', 10.00, 'appointment', 6),
(@ex1, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Present Simple for Routines” là gì?', 'Hiện tại đơn diễn tả thói quen và hoạt động lặp lại. Mẫu dùng trong dữ liệu: S + V(s/es) + O.', 10.00, 'S + V(s/es) + O', 7),
(@ex1, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Prepositions of Time” là gì?', 'At, on và in được dùng với các loại mốc thời gian khác nhau.', 10.00, 'at + time; on + day/date; in + month/year/part of day', 8),
(@ex1, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Polite Requests with Would Like” là gì?', 'Would like diễn tả mong muốn lịch sự.', 10.00, 'S + would like + noun/to-infinitive', 9),
(@ex1, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “How Much and How Many” là gì?', 'How much hỏi lượng không đếm được hoặc giá; how many hỏi số lượng đếm được.', 10.00, 'How much + uncountable noun; How many + plural countable noun', 10);

SET @q1_1 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 1);
SET @q1_2 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 2);
SET @q1_3 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 3);
SET @q1_4 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 4);
SET @q1_5 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 5);
SET @q1_6 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 6);
SET @q1_7 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 7);
SET @q1_8 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 8);
SET @q1_9 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 9);
SET @q1_10 = (SELECT id FROM questions WHERE exercise_id = @ex1 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q1_1, 'menu', FALSE, 1), (@q1_1, 'ingredient', FALSE, 2), (@q1_1, 'size', FALSE, 3), (@q1_1, 'routine', TRUE, 4),
(@q1_2, 'bill', FALSE, 1), (@q1_2, 'wake up', TRUE, 2), (@q1_2, 'receipt', FALSE, 3), (@q1_2, 'schedule', FALSE, 4),
(@q1_3, 'schedule', FALSE, 1), (@q1_3, 'quarter', FALSE, 2), (@q1_3, 'size', FALSE, 3), (@q1_3, 'get dressed', TRUE, 4),
(@q1_4, 'quarter', FALSE, 1), (@q1_4, 'ingredient', FALSE, 2), (@q1_4, 'size', FALSE, 3), (@q1_4, 'schedule', TRUE, 4),
(@q1_5, 'routine', FALSE, 1), (@q1_5, 'quarter', TRUE, 2), (@q1_5, 'receipt', FALSE, 3), (@q1_5, 'size', FALSE, 4),
(@q1_6, 'schedule', FALSE, 1), (@q1_6, 'menu', FALSE, 2), (@q1_6, 'receipt', FALSE, 3), (@q1_6, 'appointment', TRUE, 4),
(@q1_7, 'V-ing + subject + no auxiliary', FALSE, 1), (@q1_7, 'S + V(s/es) + O', TRUE, 2), (@q1_7, 'at + time; on + day/date; in + month/year/part of day', FALSE, 3), (@q1_7, 'Question word + noun + adjective only', FALSE, 4),
(@q1_8, 'S + past participle without an auxiliary', FALSE, 1), (@q1_8, 'Question word + noun + adjective only', FALSE, 2), (@q1_8, 'at + time; on + day/date; in + month/year/part of day', TRUE, 3), (@q1_8, 'S + would like + noun/to-infinitive', FALSE, 4),
(@q1_9, 'S + past participle without an auxiliary', FALSE, 1), (@q1_9, 'Question word + noun + adjective only', FALSE, 2), (@q1_9, 'How much + uncountable noun; How many + plural countable noun', FALSE, 3), (@q1_9, 'S + would like + noun/to-infinitive', TRUE, 4),
(@q1_10, 'How much + uncountable noun; How many + plural countable noun', TRUE, 1), (@q1_10, 'at + time; on + day/date; in + month/year/part of day', FALSE, 2), (@q1_10, 'S + V(s/es) + O', FALSE, 3), (@q1_10, 'S + would like + noun/to-infinitive', FALSE, 4);

-- ─────────────────────────────────────────────────────────────
-- COURSE 2: English for Online Communication
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'English for Online Communication', 'english-for-online-communication', 'Nhắn tin, họp trực tuyến và trao đổi lịch sự bằng tiếng Anh.', 'Khóa học hoàn toàn mới về giao tiếp số, giúp học viên viết tin nhắn rõ ràng, yêu cầu lịch sự, tham gia cuộc họp trực tuyến và bảo vệ thông tin cá nhân.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=English+for+Online+Communication', 'ELEMENTARY', 'FREE', 0.00, NULL, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c2 = (SELECT id FROM courses WHERE slug = 'english-for-online-communication');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c2, 'Tin nhắn và yêu cầu', 'Chương 1 của khóa English for Online Communication, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c2, 'Họp trực tuyến và an toàn số', 'Chương 2 của khóa English for Online Communication, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch2_1 = (SELECT id FROM chapters WHERE course_id = @c2 AND position = 1);
SET @ch2_2 = (SELECT id FROM chapters WHERE course_id = @c2 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch2_1, 'Friendly Messages That Sound Natural', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Mở đầu tin nhắn thân thiện
- Phản hồi tự nhiên
- Kết thúc cuộc trò chuyện lịch sự', NULL, 'https://www.youtube.com/watch?v=2FOptwGnD8I', 'Cụm nào dùng để đồng ý tự nhiên?', 'Sounds good.', 'Sounds good thể hiện đồng ý với một kế hoạch.', 1, 20, TRUE, 'PUBLISHED'),
(@ch2_1, 'Polite Requests in Chat', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Đưa ra yêu cầu lịch sự
- Xin lỗi vì phản hồi muộn
- Yêu cầu làm rõ', NULL, 'https://www.youtube.com/watch?v=2FOptwGnD8I', 'Câu nào yêu cầu gửi lại tệp lịch sự?', 'Could you send the file again, please?', 'Could you... please là mẫu yêu cầu lịch sự.', 2, 22, FALSE, 'PUBLISHED'),
(@ch2_2, 'Joining an Online Meeting', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Kiểm tra âm thanh và hình ảnh
- Xin phép phát biểu
- Xử lý sự cố kết nối', NULL, 'https://www.youtube.com/watch?v=2FOptwGnD8I', 'Câu nào báo rằng người khác không nghe thấy bạn?', 'I think my microphone is muted.', 'Muted nghĩa là mic đang bị tắt tiếng.', 1, 24, FALSE, 'PUBLISHED'),
(@ch2_2, 'Safe and Respectful Online Communication', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Bảo vệ thông tin cá nhân
- Nhận biết tin nhắn đáng ngờ
- Giao tiếp tôn trọng', NULL, 'https://www.youtube.com/watch?v=2FOptwGnD8I', 'Bạn có nên gửi mật khẩu qua tin nhắn không?', 'No', 'Mật khẩu là thông tin riêng tư và không nên chia sẻ.', 2, 26, FALSE, 'PUBLISHED');

SET @l2_1 = (SELECT id FROM lessons WHERE chapter_id = @ch2_1 AND position = 1);
SET @l2_2 = (SELECT id FROM lessons WHERE chapter_id = @ch2_1 AND position = 2);
SET @l2_3 = (SELECT id FROM lessons WHERE chapter_id = @ch2_2 AND position = 1);
SET @l2_4 = (SELECT id FROM lessons WHERE chapter_id = @ch2_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c2, @l2_1, 'reply', '/rɪˈplaɪ/', 'trả lời, phản hồi', 'VERB', 'I will reply after class.', 'Tôi sẽ trả lời sau giờ học.', 'ELEMENTARY', 'Messaging'),
(@c2, @l2_1, 'update', '/ˈʌpdeɪt/', 'thông tin cập nhật', 'NOUN', 'Thanks for the update.', 'Cảm ơn bạn đã cập nhật.', 'ELEMENTARY', 'Messaging'),
(@c2, @l2_1, 'available', '/əˈveɪləbl/', 'có thời gian, sẵn sàng', 'ADJECTIVE', 'Are you available this evening?', 'Bạn có rảnh tối nay không?', 'ELEMENTARY', 'Messaging'),
(@c2, @l2_2, 'attach', '/əˈtætʃ/', 'đính kèm', 'VERB', 'Please attach the document.', 'Vui lòng đính kèm tài liệu.', 'ELEMENTARY', 'Polite Requests'),
(@c2, @l2_2, 'clarify', '/ˈklærəfaɪ/', 'làm rõ', 'VERB', 'Could you clarify the final requirement?', 'Bạn có thể làm rõ yêu cầu cuối cùng không?', 'ELEMENTARY', 'Polite Requests'),
(@c2, @l2_2, 'delay', '/dɪˈleɪ/', 'sự chậm trễ', 'NOUN', 'Sorry for the delay.', 'Xin lỗi vì sự chậm trễ.', 'ELEMENTARY', 'Polite Requests'),
(@c2, @l2_3, 'microphone', '/ˈmaɪkrəfoʊn/', 'micrô', 'NOUN', 'Please check your microphone.', 'Vui lòng kiểm tra micrô.', 'ELEMENTARY', 'Online Meetings'),
(@c2, @l2_3, 'connection', '/kəˈnekʃn/', 'kết nối', 'NOUN', 'My internet connection is unstable.', 'Kết nối Internet của tôi không ổn định.', 'ELEMENTARY', 'Online Meetings'),
(@c2, @l2_3, 'share screen', '/ʃer skriːn/', 'chia sẻ màn hình', 'PHRASE', 'Can you share your screen?', 'Bạn có thể chia sẻ màn hình không?', 'ELEMENTARY', 'Online Meetings'),
(@c2, @l2_4, 'password', '/ˈpæswɜːrd/', 'mật khẩu', 'NOUN', 'Never share your password.', 'Không bao giờ chia sẻ mật khẩu.', 'ELEMENTARY', 'Online Safety'),
(@c2, @l2_4, 'private', '/ˈpraɪvət/', 'riêng tư', 'ADJECTIVE', 'Keep personal information private.', 'Hãy giữ thông tin cá nhân ở chế độ riêng tư.', 'ELEMENTARY', 'Online Safety'),
(@c2, @l2_4, 'suspicious', '/səˈspɪʃəs/', 'đáng ngờ', 'ADJECTIVE', 'Do not open suspicious links.', 'Không mở các liên kết đáng ngờ.', 'ELEMENTARY', 'Online Safety');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c2, @l2_1, 'Short Natural Responses', 'Các phản hồi ngắn giúp tin nhắn tự nhiên và rõ thái độ.', 'Sounds good / No problem / That works for me', 'Dùng để đồng ý, xác nhận hoặc phản hồi nhanh.', 'That works for me. See you at three.', 'Chọn phản hồi phù hợp với mức độ trang trọng.', 'ELEMENTARY'),
(@c2, @l2_2, 'Could You and Would You Mind', 'Hai cấu trúc dùng để đưa ra yêu cầu lịch sự.', 'Could you + V...? / Would you mind + V-ing...?', 'Dùng khi nhờ người khác thực hiện hành động.', 'Would you mind checking the link?', 'Sau mind dùng động từ thêm -ing.', 'ELEMENTARY'),
(@c2, @l2_3, 'Present Continuous for Current Problems', 'Hiện tại tiếp diễn mô tả sự việc đang xảy ra lúc nói.', 'S + am/is/are + V-ing', 'Dùng để mô tả sự cố đang diễn ra trong cuộc họp.', 'The audio is breaking up.', 'Một số động từ trạng thái thường không dùng ở dạng tiếp diễn.', 'ELEMENTARY'),
(@c2, @l2_4, 'Should, Must and Must Not', 'Động từ khuyết thiếu diễn tả lời khuyên, nghĩa vụ và điều cấm.', 'S + should/must/must not + V', 'Should cho lời khuyên; must cho yêu cầu mạnh; must not cho điều cấm.', 'You must not share your password.', 'Sau modal verb dùng động từ nguyên mẫu.', 'ELEMENTARY');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c2, NULL, 'English for Online Communication – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex2 = (SELECT id FROM exercises WHERE course_id = @c2 AND title = 'English for Online Communication – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex2, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “trả lời, phản hồi”?', '“reply” có nghĩa là “trả lời, phản hồi”. Ví dụ: I will reply after class.', 10.00, 'reply', 1),
(@ex2, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thông tin cập nhật”?', '“update” có nghĩa là “thông tin cập nhật”. Ví dụ: Thanks for the update.', 10.00, 'update', 2),
(@ex2, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “có thời gian, sẵn sàng”?', '“available” có nghĩa là “có thời gian, sẵn sàng”. Ví dụ: Are you available this evening?', 10.00, 'available', 3),
(@ex2, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “đính kèm”?', '“attach” có nghĩa là “đính kèm”. Ví dụ: Please attach the document.', 10.00, 'attach', 4),
(@ex2, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “làm rõ”?', '“clarify” có nghĩa là “làm rõ”. Ví dụ: Could you clarify the final requirement?', 10.00, 'clarify', 5),
(@ex2, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “sự chậm trễ”?', '“delay” có nghĩa là “sự chậm trễ”. Ví dụ: Sorry for the delay.', 10.00, 'delay', 6),
(@ex2, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Short Natural Responses” là gì?', 'Các phản hồi ngắn giúp tin nhắn tự nhiên và rõ thái độ.', 10.00, 'Sounds good / No problem / That works for me', 7),
(@ex2, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Could You and Would You Mind” là gì?', 'Hai cấu trúc dùng để đưa ra yêu cầu lịch sự.', 10.00, 'Could you + V...? / Would you mind + V-ing...?', 8),
(@ex2, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Present Continuous for Current Problems” là gì?', 'Hiện tại tiếp diễn mô tả sự việc đang xảy ra lúc nói.', 10.00, 'S + am/is/are + V-ing', 9),
(@ex2, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Should, Must and Must Not” là gì?', 'Động từ khuyết thiếu diễn tả lời khuyên, nghĩa vụ và điều cấm.', 10.00, 'S + should/must/must not + V', 10);

SET @q2_1 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 1);
SET @q2_2 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 2);
SET @q2_3 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 3);
SET @q2_4 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 4);
SET @q2_5 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 5);
SET @q2_6 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 6);
SET @q2_7 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 7);
SET @q2_8 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 8);
SET @q2_9 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 9);
SET @q2_10 = (SELECT id FROM questions WHERE exercise_id = @ex2 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q2_1, 'reply', TRUE, 1), (@q2_1, 'suspicious', FALSE, 2), (@q2_1, 'attach', FALSE, 3), (@q2_1, 'clarify', FALSE, 4),
(@q2_2, 'available', FALSE, 1), (@q2_2, 'share screen', FALSE, 2), (@q2_2, 'update', TRUE, 3), (@q2_2, 'attach', FALSE, 4),
(@q2_3, 'password', FALSE, 1), (@q2_3, 'available', TRUE, 2), (@q2_3, 'reply', FALSE, 3), (@q2_3, 'connection', FALSE, 4),
(@q2_4, 'attach', TRUE, 1), (@q2_4, 'connection', FALSE, 2), (@q2_4, 'password', FALSE, 3), (@q2_4, 'private', FALSE, 4),
(@q2_5, 'share screen', FALSE, 1), (@q2_5, 'clarify', TRUE, 2), (@q2_5, 'suspicious', FALSE, 3), (@q2_5, 'reply', FALSE, 4),
(@q2_6, 'suspicious', FALSE, 1), (@q2_6, 'delay', TRUE, 2), (@q2_6, 'available', FALSE, 3), (@q2_6, 'attach', FALSE, 4),
(@q2_7, 'Sounds good / No problem / That works for me', TRUE, 1), (@q2_7, 'S + be + noun only', FALSE, 2), (@q2_7, 'S + should/must/must not + V', FALSE, 3), (@q2_7, 'S + past participle without an auxiliary', FALSE, 4),
(@q2_8, 'S + past participle without an auxiliary', FALSE, 1), (@q2_8, 'Could you + V...? / Would you mind + V-ing...?', TRUE, 2), (@q2_8, 'Sounds good / No problem / That works for me', FALSE, 3), (@q2_8, 'S + should/must/must not + V', FALSE, 4),
(@q2_9, 'S + am/is/are + V-ing', TRUE, 1), (@q2_9, 'S + be + noun only', FALSE, 2), (@q2_9, 'V-ing + subject + no auxiliary', FALSE, 3), (@q2_9, 'S + past participle without an auxiliary', FALSE, 4),
(@q2_10, 'S + am/is/are + V-ing', FALSE, 1), (@q2_10, 'S + should/must/must not + V', TRUE, 2), (@q2_10, 'V-ing + subject + no auxiliary', FALSE, 3), (@q2_10, 'Sounds good / No problem / That works for me', FALSE, 4);


-- ─────────────────────────────────────────────────────────────
-- COURSE 3: Listening in Public Places
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Listening in Public Places', 'listening-in-public-places', 'Nghe và hiểu thông báo tại nhà ga, sân bay và các địa điểm công cộng.', 'Khóa học mới tập trung vào kỹ năng nghe từ khóa, số, thời gian, địa điểm và thay đổi lịch trình trong các thông báo thực tế.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Listening+in+Public+Places', 'ELEMENTARY', 'PAID', 449000.00, 299000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c3 = (SELECT id FROM courses WHERE slug = 'listening-in-public-places');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c3, 'Thông báo giao thông', 'Chương 1 của khóa Listening in Public Places, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c3, 'Chỉ đường và lịch hẹn', 'Chương 2 của khóa Listening in Public Places, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch3_1 = (SELECT id FROM chapters WHERE course_id = @c3 AND position = 1);
SET @ch3_2 = (SELECT id FROM chapters WHERE course_id = @c3 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch3_1, 'Bus and Train Announcements', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nghe số tuyến và sân ga
- Nhận biết giờ khởi hành
- Hiểu thông báo chậm trễ', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Delayed có nghĩa là gì?', 'Bị trì hoãn', 'Delayed thông báo phương tiện khởi hành muộn hơn dự kiến.', 1, 20, TRUE, 'PUBLISHED'),
(@ch3_1, 'Airport Announcements', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nghe số hiệu chuyến bay
- Nhận biết cửa ra máy bay
- Hiểu lời gọi lên máy bay', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Final call nghĩa là gì?', 'Lời gọi cuối cùng', 'Final call báo hành khách phải đến cửa lên máy bay ngay.', 2, 22, FALSE, 'PUBLISHED'),
(@ch3_2, 'Directions and Landmarks', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Nghe động từ chỉ hướng
- Nhận biết mốc địa điểm
- Theo dõi thứ tự chỉ dẫn', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Across from có nghĩa là gì?', 'Đối diện', 'Across from mô tả hai địa điểm ở hai phía đối diện.', 1, 24, FALSE, 'PUBLISHED'),
(@ch3_2, 'Appointments and Schedule Changes', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nghe ngày và giờ hẹn
- Nhận biết thay đổi kế hoạch
- Xác nhận lịch mới', NULL, 'https://www.youtube.com/watch?v=t_Wd4G9zZms', 'Reschedule có nghĩa là gì?', 'Sắp xếp lại lịch', 'Reschedule là đổi cuộc hẹn sang thời gian khác.', 2, 26, FALSE, 'PUBLISHED');

SET @l3_1 = (SELECT id FROM lessons WHERE chapter_id = @ch3_1 AND position = 1);
SET @l3_2 = (SELECT id FROM lessons WHERE chapter_id = @ch3_1 AND position = 2);
SET @l3_3 = (SELECT id FROM lessons WHERE chapter_id = @ch3_2 AND position = 1);
SET @l3_4 = (SELECT id FROM lessons WHERE chapter_id = @ch3_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c3, @l3_1, 'platform', '/ˈplætfɔːrm/', 'sân ga', 'NOUN', 'The train leaves from platform five.', 'Tàu rời sân ga số năm.', 'ELEMENTARY', 'Transport Announcements'),
(@c3, @l3_1, 'departure', '/dɪˈpɑːrtʃər/', 'sự khởi hành', 'NOUN', 'The departure time is 8:40.', 'Giờ khởi hành là 8 giờ 40.', 'ELEMENTARY', 'Transport Announcements'),
(@c3, @l3_1, 'delayed', '/dɪˈleɪd/', 'bị trì hoãn', 'ADJECTIVE', 'The bus is delayed by ten minutes.', 'Xe buýt bị trễ mười phút.', 'ELEMENTARY', 'Transport Announcements'),
(@c3, @l3_2, 'boarding', '/ˈbɔːrdɪŋ/', 'việc lên máy bay', 'NOUN', 'Boarding begins at gate twelve.', 'Việc lên máy bay bắt đầu tại cửa số mười hai.', 'ELEMENTARY', 'Airport Announcements'),
(@c3, @l3_2, 'gate', '/ɡeɪt/', 'cửa ra máy bay', 'NOUN', 'Your gate has changed.', 'Cửa ra máy bay của bạn đã thay đổi.', 'ELEMENTARY', 'Airport Announcements'),
(@c3, @l3_2, 'passenger', '/ˈpæsɪndʒər/', 'hành khách', 'NOUN', 'Passengers should have their passports ready.', 'Hành khách nên chuẩn bị sẵn hộ chiếu.', 'ELEMENTARY', 'Airport Announcements'),
(@c3, @l3_3, 'landmark', '/ˈlændmɑːrk/', 'mốc địa điểm', 'NOUN', 'Use the clock tower as a landmark.', 'Dùng tháp đồng hồ làm mốc.', 'ELEMENTARY', 'Directions'),
(@c3, @l3_3, 'intersection', '/ˌɪntərˈsekʃn/', 'ngã tư, giao lộ', 'NOUN', 'Turn left at the intersection.', 'Rẽ trái tại giao lộ.', 'ELEMENTARY', 'Directions'),
(@c3, @l3_3, 'opposite', '/ˈɑːpəzɪt/', 'đối diện', 'PREPOSITION', 'The bank is opposite the museum.', 'Ngân hàng đối diện bảo tàng.', 'ELEMENTARY', 'Directions'),
(@c3, @l3_4, 'reschedule', '/ˌriːˈskedʒuːl/', 'đổi lịch', 'VERB', 'We need to reschedule the appointment.', 'Chúng ta cần đổi lịch cuộc hẹn.', 'ELEMENTARY', 'Appointments'),
(@c3, @l3_4, 'confirm', '/kənˈfɜːrm/', 'xác nhận', 'VERB', 'Please confirm the new time.', 'Vui lòng xác nhận giờ mới.', 'ELEMENTARY', 'Appointments'),
(@c3, @l3_4, 'instead', '/ɪnˈsted/', 'thay vào đó', 'ADVERB', 'Can we meet on Thursday instead?', 'Chúng ta có thể gặp vào thứ Năm thay vào đó không?', 'ELEMENTARY', 'Appointments');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c3, @l3_1, 'Passive Forms in Announcements', 'Câu bị động thường xuất hiện trong thông báo.', 'S + be + past participle', 'Dùng khi hành động hoặc kết quả quan trọng hơn người thực hiện.', 'The service is delayed.', 'Chú ý dạng be thay đổi theo thời và chủ ngữ.', 'ELEMENTARY'),
(@c3, @l3_2, 'Imperatives in Public Instructions', 'Mệnh lệnh dùng để đưa hướng dẫn ngắn gọn.', 'Base verb + object', 'Dùng trong thông báo như proceed, remain, keep và show.', 'Please proceed to gate twelve.', 'Please làm câu mệnh lệnh lịch sự hơn.', 'ELEMENTARY'),
(@c3, @l3_3, 'Prepositions of Place', 'Giới từ vị trí mô tả quan hệ giữa các địa điểm.', 'next to / opposite / between / behind / in front of', 'Dùng khi mô tả bản đồ và chỉ đường.', 'The café is between the bank and the station.', 'Between thường đi với hai đối tượng.', 'ELEMENTARY'),
(@c3, @l3_4, 'Present Continuous for Arrangements', 'Hiện tại tiếp diễn có thể diễn tả lịch hẹn đã sắp xếp.', 'S + am/is/are + V-ing + future time', 'Dùng cho kế hoạch đã có thời gian hoặc địa điểm cụ thể.', 'We are meeting at two tomorrow.', 'Cần có ngữ cảnh tương lai rõ ràng.', 'ELEMENTARY');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c3, NULL, 'Listening in Public Places – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex3 = (SELECT id FROM exercises WHERE course_id = @c3 AND title = 'Listening in Public Places – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex3, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “sân ga”?', '“platform” có nghĩa là “sân ga”. Ví dụ: The train leaves from platform five.', 10.00, 'platform', 1),
(@ex3, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “sự khởi hành”?', '“departure” có nghĩa là “sự khởi hành”. Ví dụ: The departure time is 8:40.', 10.00, 'departure', 2),
(@ex3, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “bị trì hoãn”?', '“delayed” có nghĩa là “bị trì hoãn”. Ví dụ: The bus is delayed by ten minutes.', 10.00, 'delayed', 3),
(@ex3, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “việc lên máy bay”?', '“boarding” có nghĩa là “việc lên máy bay”. Ví dụ: Boarding begins at gate twelve.', 10.00, 'boarding', 4),
(@ex3, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “cửa ra máy bay”?', '“gate” có nghĩa là “cửa ra máy bay”. Ví dụ: Your gate has changed.', 10.00, 'gate', 5),
(@ex3, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “hành khách”?', '“passenger” có nghĩa là “hành khách”. Ví dụ: Passengers should have their passports ready.', 10.00, 'passenger', 6),
(@ex3, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Passive Forms in Announcements” là gì?', 'Câu bị động thường xuất hiện trong thông báo.', 10.00, 'S + be + past participle', 7),
(@ex3, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Imperatives in Public Instructions” là gì?', 'Mệnh lệnh dùng để đưa hướng dẫn ngắn gọn.', 10.00, 'Base verb + object', 8),
(@ex3, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Prepositions of Place” là gì?', 'Giới từ vị trí mô tả quan hệ giữa các địa điểm.', 10.00, 'next to / opposite / between / behind / in front of', 9),
(@ex3, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Present Continuous for Arrangements” là gì?', 'Hiện tại tiếp diễn có thể diễn tả lịch hẹn đã sắp xếp.', 10.00, 'S + am/is/are + V-ing + future time', 10);

SET @q3_1 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 1);
SET @q3_2 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 2);
SET @q3_3 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 3);
SET @q3_4 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 4);
SET @q3_5 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 5);
SET @q3_6 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 6);
SET @q3_7 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 7);
SET @q3_8 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 8);
SET @q3_9 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 9);
SET @q3_10 = (SELECT id FROM questions WHERE exercise_id = @ex3 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q3_1, 'departure', FALSE, 1), (@q3_1, 'instead', FALSE, 2), (@q3_1, 'delayed', FALSE, 3), (@q3_1, 'platform', TRUE, 4),
(@q3_2, 'platform', FALSE, 1), (@q3_2, 'boarding', FALSE, 2), (@q3_2, 'departure', TRUE, 3), (@q3_2, 'gate', FALSE, 4),
(@q3_3, 'delayed', TRUE, 1), (@q3_3, 'instead', FALSE, 2), (@q3_3, 'boarding', FALSE, 3), (@q3_3, 'intersection', FALSE, 4),
(@q3_4, 'instead', FALSE, 1), (@q3_4, 'boarding', TRUE, 2), (@q3_4, 'gate', FALSE, 3), (@q3_4, 'departure', FALSE, 4),
(@q3_5, 'departure', FALSE, 1), (@q3_5, 'gate', TRUE, 2), (@q3_5, 'delayed', FALSE, 3), (@q3_5, 'reschedule', FALSE, 4),
(@q3_6, 'boarding', FALSE, 1), (@q3_6, 'instead', FALSE, 2), (@q3_6, 'passenger', TRUE, 3), (@q3_6, 'opposite', FALSE, 4),
(@q3_7, 'S + past participle without an auxiliary', FALSE, 1), (@q3_7, 'next to / opposite / between / behind / in front of', FALSE, 2), (@q3_7, 'S + be + past participle', TRUE, 3), (@q3_7, 'V-ing + subject + no auxiliary', FALSE, 4),
(@q3_8, 'S + be + past participle', FALSE, 1), (@q3_8, 'S + past participle without an auxiliary', FALSE, 2), (@q3_8, 'Base verb + object', TRUE, 3), (@q3_8, 'S + be + noun only', FALSE, 4),
(@q3_9, 'S + be + noun only', FALSE, 1), (@q3_9, 'Question word + noun + adjective only', FALSE, 2), (@q3_9, 'next to / opposite / between / behind / in front of', TRUE, 3), (@q3_9, 'S + be + past participle', FALSE, 4),
(@q3_10, 'Question word + noun + adjective only', FALSE, 1), (@q3_10, 'S + past participle without an auxiliary', FALSE, 2), (@q3_10, 'V-ing + subject + no auxiliary', FALSE, 3), (@q3_10, 'S + am/is/are + V-ing + future time', TRUE, 4);

-- ─────────────────────────────────────────────────────────────
-- COURSE 4: Reading Everyday Texts
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Reading Everyday Texts', 'reading-everyday-texts', 'Đọc hiểu biển báo, tin nhắn, bài báo ngắn và truyện đơn giản.', 'Khóa học mới rèn chiến lược tìm ý chính, chi tiết, mục đích và trình tự sự kiện qua các văn bản thường gặp.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Reading+Everyday+Texts', 'ELEMENTARY', 'PAID', 499000.00, 329000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c4 = (SELECT id FROM courses WHERE slug = 'reading-everyday-texts');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c4, 'Văn bản ngắn hằng ngày', 'Chương 1 của khóa Reading Everyday Texts, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c4, 'Tin tức và câu chuyện', 'Chương 2 của khóa Reading Everyday Texts, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch4_1 = (SELECT id FROM chapters WHERE course_id = @c4 AND position = 1);
SET @ch4_2 = (SELECT id FROM chapters WHERE course_id = @c4 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch4_1, 'Signs and Notices', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Hiểu biển báo phổ biến
- Xác định hành động được yêu cầu
- Nhận biết từ khóa cảnh báo', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'No entry có nghĩa là gì?', 'Không được vào', 'No entry là biển cấm đi vào.', 1, 20, TRUE, 'PUBLISHED'),
(@ch4_1, 'Messages and Short Emails', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Xác định người gửi và mục đích
- Tìm thời gian và hành động cần làm
- Suy luận giọng điệu', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'Deadline có nghĩa là gì?', 'Hạn chót', 'Deadline là thời điểm cuối phải hoàn thành việc.', 2, 22, FALSE, 'PUBLISHED'),
(@ch4_2, 'Short News Articles', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Đọc tiêu đề và câu mở đầu
- Tìm ai, việc gì, ở đâu và khi nào
- Phân biệt ý chính và chi tiết', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'Headline có nghĩa là gì?', 'Tiêu đề bài báo', 'Headline tóm lược chủ đề chính của tin.', 1, 24, FALSE, 'PUBLISHED'),
(@ch4_2, 'Story Sequence and Retelling', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Xác định mở đầu, diễn biến và kết thúc
- Theo dõi nguyên nhân và kết quả
- Kể lại bằng từ của bản thân', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'In the end dùng để làm gì?', 'Giới thiệu kết quả cuối cùng', 'In the end báo hiệu kết thúc hoặc kết quả.', 2, 26, FALSE, 'PUBLISHED');

SET @l4_1 = (SELECT id FROM lessons WHERE chapter_id = @ch4_1 AND position = 1);
SET @l4_2 = (SELECT id FROM lessons WHERE chapter_id = @ch4_1 AND position = 2);
SET @l4_3 = (SELECT id FROM lessons WHERE chapter_id = @ch4_2 AND position = 1);
SET @l4_4 = (SELECT id FROM lessons WHERE chapter_id = @ch4_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c4, @l4_1, 'notice', '/ˈnoʊtɪs/', 'thông báo', 'NOUN', 'Read the notice before entering.', 'Đọc thông báo trước khi vào.', 'ELEMENTARY', 'Signs and Notices'),
(@c4, @l4_1, 'prohibited', '/prəˈhɪbɪtɪd/', 'bị cấm', 'ADJECTIVE', 'Parking is prohibited here.', 'Đỗ xe bị cấm ở đây.', 'ELEMENTARY', 'Signs and Notices'),
(@c4, @l4_1, 'caution', '/ˈkɔːʃn/', 'cảnh báo, thận trọng', 'NOUN', 'The sign says caution: wet floor.', 'Biển báo ghi cảnh báo: sàn ướt.', 'ELEMENTARY', 'Signs and Notices'),
(@c4, @l4_2, 'deadline', '/ˈdedlaɪn/', 'hạn chót', 'NOUN', 'The deadline is Friday at noon.', 'Hạn chót là trưa thứ Sáu.', 'ELEMENTARY', 'Messages and Emails'),
(@c4, @l4_2, 'reminder', '/rɪˈmaɪndər/', 'lời nhắc', 'NOUN', 'This is a reminder about tomorrow''s class.', 'Đây là lời nhắc về lớp học ngày mai.', 'ELEMENTARY', 'Messages and Emails'),
(@c4, @l4_2, 'request', '/rɪˈkwest/', 'yêu cầu', 'NOUN', 'Her email contains a clear request.', 'Email của cô ấy có một yêu cầu rõ ràng.', 'ELEMENTARY', 'Messages and Emails'),
(@c4, @l4_3, 'headline', '/ˈhedlaɪn/', 'tiêu đề tin', 'NOUN', 'The headline attracted many readers.', 'Tiêu đề thu hút nhiều độc giả.', 'ELEMENTARY', 'News Reading'),
(@c4, @l4_3, 'report', '/rɪˈpɔːrt/', 'bản tin, báo cáo', 'NOUN', 'The report describes the new project.', 'Bản tin mô tả dự án mới.', 'ELEMENTARY', 'News Reading'),
(@c4, @l4_3, 'according to', '/əˈkɔːrdɪŋ tuː/', 'theo như', 'PHRASE', 'According to the report, prices fell.', 'Theo báo cáo, giá đã giảm.', 'ELEMENTARY', 'News Reading'),
(@c4, @l4_4, 'sequence', '/ˈsiːkwəns/', 'trình tự', 'NOUN', 'Put the events in the correct sequence.', 'Hãy đặt các sự kiện đúng trình tự.', 'ELEMENTARY', 'Story Reading'),
(@c4, @l4_4, 'character', '/ˈkærəktər/', 'nhân vật', 'NOUN', 'The main character solves the problem.', 'Nhân vật chính giải quyết vấn đề.', 'ELEMENTARY', 'Story Reading'),
(@c4, @l4_4, 'solution', '/səˈluːʃn/', 'giải pháp', 'NOUN', 'The story ends with a surprising solution.', 'Câu chuyện kết thúc bằng một giải pháp bất ngờ.', 'ELEMENTARY', 'Story Reading');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c4, @l4_1, 'Imperatives and Prohibitions', 'Biển báo thường dùng mệnh lệnh hoặc cấu trúc cấm.', 'Base verb / Do not + V / No + noun or V-ing', 'Dùng để chỉ dẫn hoặc cấm một hành động.', 'Do not touch the equipment.', 'No smoking là cấu trúc No + V-ing.', 'ELEMENTARY'),
(@c4, @l4_2, 'Modal Verbs in Messages', 'Can, could, should và need to thể hiện khả năng, yêu cầu và nghĩa vụ.', 'modal + base verb', 'Dùng để hiểu hành động người gửi muốn người nhận thực hiện.', 'Could you send the form today?', 'Sau modal không thêm to, ngoại trừ need to.', 'ELEMENTARY'),
(@c4, @l4_3, 'Past Simple in News Reports', 'Quá khứ đơn kể các sự kiện đã xảy ra và kết thúc.', 'S + V2/ed + O', 'Dùng cho sự kiện có thời gian quá khứ xác định.', 'The city opened a new library last week.', 'Động từ bất quy tắc cần học dạng V2.', 'ELEMENTARY'),
(@c4, @l4_4, 'Sequence Connectors', 'Từ nối giúp tổ chức trình tự câu chuyện.', 'First, next, then, after that, finally', 'Dùng để kể sự kiện theo thứ tự.', 'First, Mia opened the box. Then, she found a note.', 'Không lặp then ở mọi câu; kết hợp nhiều từ nối.', 'ELEMENTARY');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c4, NULL, 'Reading Everyday Texts – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex4 = (SELECT id FROM exercises WHERE course_id = @c4 AND title = 'Reading Everyday Texts – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex4, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thông báo”?', '“notice” có nghĩa là “thông báo”. Ví dụ: Read the notice before entering.', 10.00, 'notice', 1),
(@ex4, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “bị cấm”?', '“prohibited” có nghĩa là “bị cấm”. Ví dụ: Parking is prohibited here.', 10.00, 'prohibited', 2),
(@ex4, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “cảnh báo, thận trọng”?', '“caution” có nghĩa là “cảnh báo, thận trọng”. Ví dụ: The sign says caution: wet floor.', 10.00, 'caution', 3),
(@ex4, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “hạn chót”?', '“deadline” có nghĩa là “hạn chót”. Ví dụ: The deadline is Friday at noon.', 10.00, 'deadline', 4),
(@ex4, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “lời nhắc”?', '“reminder” có nghĩa là “lời nhắc”. Ví dụ: This is a reminder about tomorrow''s class.', 10.00, 'reminder', 5),
(@ex4, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “yêu cầu”?', '“request” có nghĩa là “yêu cầu”. Ví dụ: Her email contains a clear request.', 10.00, 'request', 6),
(@ex4, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Imperatives and Prohibitions” là gì?', 'Biển báo thường dùng mệnh lệnh hoặc cấu trúc cấm.', 10.00, 'Base verb / Do not + V / No + noun or V-ing', 7),
(@ex4, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Modal Verbs in Messages” là gì?', 'Can, could, should và need to thể hiện khả năng, yêu cầu và nghĩa vụ.', 10.00, 'modal + base verb', 8),
(@ex4, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Past Simple in News Reports” là gì?', 'Quá khứ đơn kể các sự kiện đã xảy ra và kết thúc.', 10.00, 'S + V2/ed + O', 9),
(@ex4, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Sequence Connectors” là gì?', 'Từ nối giúp tổ chức trình tự câu chuyện.', 10.00, 'First, next, then, after that, finally', 10);

SET @q4_1 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 1);
SET @q4_2 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 2);
SET @q4_3 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 3);
SET @q4_4 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 4);
SET @q4_5 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 5);
SET @q4_6 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 6);
SET @q4_7 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 7);
SET @q4_8 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 8);
SET @q4_9 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 9);
SET @q4_10 = (SELECT id FROM questions WHERE exercise_id = @ex4 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q4_1, 'character', FALSE, 1), (@q4_1, 'prohibited', FALSE, 2), (@q4_1, 'notice', TRUE, 3), (@q4_1, 'deadline', FALSE, 4),
(@q4_2, 'headline', FALSE, 1), (@q4_2, 'character', FALSE, 2), (@q4_2, 'report', FALSE, 3), (@q4_2, 'prohibited', TRUE, 4),
(@q4_3, 'solution', FALSE, 1), (@q4_3, 'deadline', FALSE, 2), (@q4_3, 'headline', FALSE, 3), (@q4_3, 'caution', TRUE, 4),
(@q4_4, 'prohibited', FALSE, 1), (@q4_4, 'report', FALSE, 2), (@q4_4, 'deadline', TRUE, 3), (@q4_4, 'according to', FALSE, 4),
(@q4_5, 'caution', FALSE, 1), (@q4_5, 'reminder', TRUE, 2), (@q4_5, 'report', FALSE, 3), (@q4_5, 'character', FALSE, 4),
(@q4_6, 'request', TRUE, 1), (@q4_6, 'according to', FALSE, 2), (@q4_6, 'report', FALSE, 3), (@q4_6, 'sequence', FALSE, 4),
(@q4_7, 'V-ing + subject + no auxiliary', FALSE, 1), (@q4_7, 'Base verb / Do not + V / No + noun or V-ing', TRUE, 2), (@q4_7, 'modal + base verb', FALSE, 3), (@q4_7, 'First, next, then, after that, finally', FALSE, 4),
(@q4_8, 'S + be + noun only', FALSE, 1), (@q4_8, 'modal + base verb', TRUE, 2), (@q4_8, 'First, next, then, after that, finally', FALSE, 3), (@q4_8, 'V-ing + subject + no auxiliary', FALSE, 4),
(@q4_9, 'Base verb / Do not + V / No + noun or V-ing', FALSE, 1), (@q4_9, 'S + V2/ed + O', TRUE, 2), (@q4_9, 'Question word + noun + adjective only', FALSE, 3), (@q4_9, 'V-ing + subject + no auxiliary', FALSE, 4),
(@q4_10, 'S + be + noun only', FALSE, 1), (@q4_10, 'First, next, then, after that, finally', TRUE, 2), (@q4_10, 'Base verb / Do not + V / No + noun or V-ing', FALSE, 3), (@q4_10, 'V-ing + subject + no auxiliary', FALSE, 4);


-- ─────────────────────────────────────────────────────────────
-- COURSE 5: Vocabulary Through Word Patterns
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Vocabulary Through Word Patterns', 'vocabulary-through-word-patterns', 'Mở rộng vốn từ bằng họ từ, tiền tố, hậu tố, collocation và phrasal verb.', 'Khóa học mới giúp học viên ghi nhớ từ theo hệ thống và sử dụng các tổ hợp từ tự nhiên thay vì học từng từ rời rạc.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Vocabulary+Through+Word+Patterns', 'INTERMEDIATE', 'PAID', 549000.00, 369000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c5 = (SELECT id FROM courses WHERE slug = 'vocabulary-through-word-patterns');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c5, 'Cấu tạo và họ từ', 'Chương 1 của khóa Vocabulary Through Word Patterns, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c5, 'Tổ hợp từ tự nhiên', 'Chương 2 của khóa Vocabulary Through Word Patterns, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch5_1 = (SELECT id FROM chapters WHERE course_id = @c5 AND position = 1);
SET @ch5_2 = (SELECT id FROM chapters WHERE course_id = @c5 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch5_1, 'Word Families', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nhận biết noun, verb, adjective và adverb
- Tạo bảng họ từ
- Chọn đúng dạng từ trong câu', NULL, 'https://www.youtube.com/watch?v=9eGRhJpOVeU', 'Tính từ của success là gì?', 'Successful', 'Successful là tính từ thuộc họ từ success.', 1, 20, TRUE, 'PUBLISHED'),
(@ch5_1, 'Prefixes and Suffixes', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Hiểu nghĩa tiền tố phổ biến
- Nhận biết hậu tố từ loại
- Đoán nghĩa từ mới', NULL, 'https://www.youtube.com/watch?v=9eGRhJpOVeU', 'Tiền tố un- thường mang nghĩa gì?', 'Không hoặc trái nghĩa', 'Un- thường tạo nghĩa phủ định.', 2, 22, FALSE, 'PUBLISHED'),
(@ch5_2, 'Everyday Collocations', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Học verb-noun collocation
- Học adjective-noun collocation
- Sửa tổ hợp từ không tự nhiên', NULL, 'https://www.youtube.com/watch?v=9eGRhJpOVeU', 'Động từ nào đi với a decision?', 'Make', 'Cụm tự nhiên là make a decision.', 1, 24, FALSE, 'PUBLISHED'),
(@ch5_2, 'Phrasal Verbs in Context', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Hiểu phrasal verb thông dụng
- Nhận biết phrasal verb tách được
- Sử dụng trong hội thoại', NULL, 'https://www.youtube.com/watch?v=9eGRhJpOVeU', 'Look after có nghĩa là gì?', 'Chăm sóc', 'Look after someone nghĩa là chăm sóc người đó.', 2, 26, FALSE, 'PUBLISHED');

SET @l5_1 = (SELECT id FROM lessons WHERE chapter_id = @ch5_1 AND position = 1);
SET @l5_2 = (SELECT id FROM lessons WHERE chapter_id = @ch5_1 AND position = 2);
SET @l5_3 = (SELECT id FROM lessons WHERE chapter_id = @ch5_2 AND position = 1);
SET @l5_4 = (SELECT id FROM lessons WHERE chapter_id = @ch5_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c5, @l5_1, 'succeed', '/səkˈsiːd/', 'thành công', 'VERB', 'She worked hard to succeed.', 'Cô ấy làm việc chăm chỉ để thành công.', 'INTERMEDIATE', 'Word Families'),
(@c5, @l5_1, 'success', '/səkˈses/', 'sự thành công', 'NOUN', 'The event was a great success.', 'Sự kiện là một thành công lớn.', 'INTERMEDIATE', 'Word Families'),
(@c5, @l5_1, 'successful', '/səkˈsesfl/', 'thành công', 'ADJECTIVE', 'They launched a successful campaign.', 'Họ triển khai một chiến dịch thành công.', 'INTERMEDIATE', 'Word Families'),
(@c5, @l5_2, 'rewrite', '/ˌriːˈraɪt/', 'viết lại', 'VERB', 'Please rewrite the final paragraph.', 'Vui lòng viết lại đoạn cuối.', 'INTERMEDIATE', 'Affixes'),
(@c5, @l5_2, 'careless', '/ˈkerləs/', 'bất cẩn', 'ADJECTIVE', 'A careless mistake changed the result.', 'Một lỗi bất cẩn đã thay đổi kết quả.', 'INTERMEDIATE', 'Affixes'),
(@c5, @l5_2, 'unpredictable', '/ˌʌnprɪˈdɪktəbl/', 'khó đoán', 'ADJECTIVE', 'The weather is unpredictable.', 'Thời tiết khó đoán.', 'INTERMEDIATE', 'Affixes'),
(@c5, @l5_3, 'make a decision', '/meɪk ə dɪˈsɪʒn/', 'đưa ra quyết định', 'PHRASE', 'We need to make a decision today.', 'Chúng ta cần đưa ra quyết định hôm nay.', 'INTERMEDIATE', 'Collocations'),
(@c5, @l5_3, 'pay attention', '/peɪ əˈtenʃn/', 'chú ý', 'PHRASE', 'Please pay attention to the instructions.', 'Vui lòng chú ý hướng dẫn.', 'INTERMEDIATE', 'Collocations'),
(@c5, @l5_3, 'heavy traffic', '/ˈhevi ˈtræfɪk/', 'giao thông đông đúc', 'PHRASE', 'We were late because of heavy traffic.', 'Chúng tôi đến muộn vì giao thông đông đúc.', 'INTERMEDIATE', 'Collocations'),
(@c5, @l5_4, 'look after', '/lʊk ˈæftər/', 'chăm sóc', 'PHRASE', 'Can you look after the children?', 'Bạn có thể chăm sóc bọn trẻ không?', 'INTERMEDIATE', 'Phrasal Verbs'),
(@c5, @l5_4, 'find out', '/faɪnd aʊt/', 'tìm ra', 'PHRASE', 'We need to find out what happened.', 'Chúng ta cần tìm ra chuyện gì đã xảy ra.', 'INTERMEDIATE', 'Phrasal Verbs'),
(@c5, @l5_4, 'turn down', '/tɜːrn daʊn/', 'từ chối; giảm âm lượng', 'PHRASE', 'She turned down the offer.', 'Cô ấy từ chối lời đề nghị.', 'INTERMEDIATE', 'Phrasal Verbs');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c5, @l5_1, 'Word Form by Sentence Position', 'Vị trí trong câu giúp xác định từ loại cần dùng.', 'determiner + adjective + noun; verb + adverb', 'Dùng để chọn dạng từ đúng trong bài điền từ.', 'The team completed the task successfully.', 'Quan sát từ đứng trước và sau khoảng trống.', 'INTERMEDIATE'),
(@c5, @l5_2, 'Common Affix Patterns', 'Tiền tố thay đổi nghĩa; hậu tố thường thay đổi từ loại.', 'prefix + root + suffix', 'Dùng để đoán nghĩa và từ loại.', 'un + predict + able = unpredictable', 'Không phải từ nào cũng kết hợp với mọi tiền tố hoặc hậu tố.', 'INTERMEDIATE'),
(@c5, @l5_3, 'Collocation Patterns', 'Một số động từ và tính từ thường kết hợp cố định với danh từ.', 'verb + noun; adjective + noun', 'Dùng để diễn đạt tự nhiên hơn.', 'take a break; strong coffee; heavy rain', 'Không dịch từng từ trực tiếp từ tiếng Việt.', 'INTERMEDIATE'),
(@c5, @l5_4, 'Separable Phrasal Verbs', 'Một số phrasal verb cho phép tân ngữ đứng giữa động từ và tiểu từ.', 'verb + object + particle / verb + particle + object', 'Dùng với các phrasal verb như turn down và pick up.', 'Turn the music down.', 'Đại từ tân ngữ phải đứng giữa: turn it down.', 'INTERMEDIATE');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c5, NULL, 'Vocabulary Through Word Patterns – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex5 = (SELECT id FROM exercises WHERE course_id = @c5 AND title = 'Vocabulary Through Word Patterns – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex5, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thành công”?', '“succeed” có nghĩa là “thành công”. Ví dụ: She worked hard to succeed.', 10.00, 'succeed', 1),
(@ex5, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “sự thành công”?', '“success” có nghĩa là “sự thành công”. Ví dụ: The event was a great success.', 10.00, 'success', 2),
(@ex5, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thành công”?', '“successful” có nghĩa là “thành công”. Ví dụ: They launched a successful campaign.', 10.00, 'successful', 3),
(@ex5, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “viết lại”?', '“rewrite” có nghĩa là “viết lại”. Ví dụ: Please rewrite the final paragraph.', 10.00, 'rewrite', 4),
(@ex5, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “bất cẩn”?', '“careless” có nghĩa là “bất cẩn”. Ví dụ: A careless mistake changed the result.', 10.00, 'careless', 5),
(@ex5, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “khó đoán”?', '“unpredictable” có nghĩa là “khó đoán”. Ví dụ: The weather is unpredictable.', 10.00, 'unpredictable', 6),
(@ex5, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Word Form by Sentence Position” là gì?', 'Vị trí trong câu giúp xác định từ loại cần dùng.', 10.00, 'determiner + adjective + noun; verb + adverb', 7),
(@ex5, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Common Affix Patterns” là gì?', 'Tiền tố thay đổi nghĩa; hậu tố thường thay đổi từ loại.', 10.00, 'prefix + root + suffix', 8),
(@ex5, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Collocation Patterns” là gì?', 'Một số động từ và tính từ thường kết hợp cố định với danh từ.', 10.00, 'verb + noun; adjective + noun', 9),
(@ex5, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Separable Phrasal Verbs” là gì?', 'Một số phrasal verb cho phép tân ngữ đứng giữa động từ và tiểu từ.', 10.00, 'verb + object + particle / verb + particle + object', 10);

SET @q5_1 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 1);
SET @q5_2 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 2);
SET @q5_3 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 3);
SET @q5_4 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 4);
SET @q5_5 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 5);
SET @q5_6 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 6);
SET @q5_7 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 7);
SET @q5_8 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 8);
SET @q5_9 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 9);
SET @q5_10 = (SELECT id FROM questions WHERE exercise_id = @ex5 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q5_1, 'success', FALSE, 1), (@q5_1, 'succeed', TRUE, 2), (@q5_1, 'rewrite', FALSE, 3), (@q5_1, 'turn down', FALSE, 4),
(@q5_2, 'success', TRUE, 1), (@q5_2, 'find out', FALSE, 2), (@q5_2, 'successful', FALSE, 3), (@q5_2, 'heavy traffic', FALSE, 4),
(@q5_3, 'successful', TRUE, 1), (@q5_3, 'make a decision', FALSE, 2), (@q5_3, 'unpredictable', FALSE, 3), (@q5_3, 'rewrite', FALSE, 4),
(@q5_4, 'look after', FALSE, 1), (@q5_4, 'successful', FALSE, 2), (@q5_4, 'rewrite', TRUE, 3), (@q5_4, 'heavy traffic', FALSE, 4),
(@q5_5, 'successful', FALSE, 1), (@q5_5, 'careless', TRUE, 2), (@q5_5, 'rewrite', FALSE, 3), (@q5_5, 'turn down', FALSE, 4),
(@q5_6, 'successful', FALSE, 1), (@q5_6, 'rewrite', FALSE, 2), (@q5_6, 'pay attention', FALSE, 3), (@q5_6, 'unpredictable', TRUE, 4),
(@q5_7, 'determiner + adjective + noun; verb + adverb', TRUE, 1), (@q5_7, 'V-ing + subject + no auxiliary', FALSE, 2), (@q5_7, 'S + past participle without an auxiliary', FALSE, 3), (@q5_7, 'verb + object + particle / verb + particle + object', FALSE, 4),
(@q5_8, 'verb + noun; adjective + noun', FALSE, 1), (@q5_8, 'verb + object + particle / verb + particle + object', FALSE, 2), (@q5_8, 'S + be + noun only', FALSE, 3), (@q5_8, 'prefix + root + suffix', TRUE, 4),
(@q5_9, 'prefix + root + suffix', FALSE, 1), (@q5_9, 'verb + object + particle / verb + particle + object', FALSE, 2), (@q5_9, 'verb + noun; adjective + noun', TRUE, 3), (@q5_9, 'S + be + noun only', FALSE, 4),
(@q5_10, 'determiner + adjective + noun; verb + adverb', FALSE, 1), (@q5_10, 'verb + object + particle / verb + particle + object', TRUE, 2), (@q5_10, 'S + past participle without an auxiliary', FALSE, 3), (@q5_10, 'Question word + noun + adjective only', FALSE, 4);

-- ─────────────────────────────────────────────────────────────
-- COURSE 6: Grammar for Real Communication
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Grammar for Real Communication', 'grammar-for-real-communication', 'Áp dụng các cấu trúc ngữ pháp quan trọng vào tình huống giao tiếp.', 'Khóa học mới tập trung vào lựa chọn thì và cấu trúc theo ý nghĩa thực tế, giúp học viên tránh học công thức rời rạc.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Grammar+for+Real+Communication', 'INTERMEDIATE', 'PAID', 599000.00, 399000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c6 = (SELECT id FROM courses WHERE slug = 'grammar-for-real-communication');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c6, 'Hiện tại và quá khứ', 'Chương 1 của khóa Grammar for Real Communication, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c6, 'Tương lai và tình huống giả định', 'Chương 2 của khóa Grammar for Real Communication, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch6_1 = (SELECT id FROM chapters WHERE course_id = @c6 AND position = 1);
SET @ch6_2 = (SELECT id FROM chapters WHERE course_id = @c6 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch6_1, 'Present Simple or Present Continuous', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Phân biệt thói quen và hành động đang xảy ra
- Dùng trạng từ thời gian đúng
- Sửa lỗi chia động từ', NULL, 'https://www.youtube.com/watch?v=elPHkXNxi2g', 'Câu nào mô tả việc đang xảy ra lúc nói?', 'She is talking on the phone now.', 'Now là dấu hiệu của hiện tại tiếp diễn.', 1, 20, TRUE, 'PUBLISHED'),
(@ch6_1, 'Past Simple or Present Perfect', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Phân biệt thời gian quá khứ xác định và trải nghiệm
- Dùng ever, never, already, yet
- Hỏi và trả lời về trải nghiệm', NULL, 'https://www.youtube.com/watch?v=q1LKvqHEt7A', 'Từ nào thường dùng trong câu hỏi Have you ...?', 'Ever', 'Ever hỏi về trải nghiệm vào bất kỳ lúc nào trước hiện tại.', 2, 22, FALSE, 'PUBLISHED'),
(@ch6_2, 'Choosing the Right Future Form', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Dùng will cho quyết định tức thời
- Dùng going to cho dự định
- Dùng hiện tại tiếp diễn cho lịch hẹn', NULL, 'https://www.youtube.com/watch?v=elPHkXNxi2g', 'Cấu trúc nào phù hợp với kế hoạch đã sắp xếp?', 'Present continuous', 'Hiện tại tiếp diễn dùng cho arrangement có thời gian cụ thể.', 1, 24, FALSE, 'PUBLISHED'),
(@ch6_2, 'Conditionals and Advice', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Dùng điều kiện loại 1
- Đưa lời khuyên với should
- Nói kết quả có thể xảy ra', NULL, 'https://www.youtube.com/watch?v=Ojo2t-73wP4', 'Mệnh đề if loại 1 dùng thì nào?', 'Present simple', 'Câu điều kiện loại 1 dùng present simple sau if.', 2, 26, FALSE, 'PUBLISHED');

SET @l6_1 = (SELECT id FROM lessons WHERE chapter_id = @ch6_1 AND position = 1);
SET @l6_2 = (SELECT id FROM lessons WHERE chapter_id = @ch6_1 AND position = 2);
SET @l6_3 = (SELECT id FROM lessons WHERE chapter_id = @ch6_2 AND position = 1);
SET @l6_4 = (SELECT id FROM lessons WHERE chapter_id = @ch6_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c6, @l6_1, 'temporary', '/ˈtempəreri/', 'tạm thời', 'ADJECTIVE', 'She is staying with a friend temporarily.', 'Cô ấy đang ở tạm với một người bạn.', 'INTERMEDIATE', 'Present Tenses'),
(@c6, @l6_1, 'habit', '/ˈhæbɪt/', 'thói quen', 'NOUN', 'Reading before bed is a good habit.', 'Đọc trước khi ngủ là một thói quen tốt.', 'INTERMEDIATE', 'Present Tenses'),
(@c6, @l6_1, 'currently', '/ˈkɜːrəntli/', 'hiện tại', 'ADVERB', 'I am currently working from home.', 'Hiện tại tôi đang làm việc tại nhà.', 'INTERMEDIATE', 'Present Tenses'),
(@c6, @l6_2, 'experience', '/ɪkˈspɪriəns/', 'trải nghiệm', 'NOUN', 'Travel is a valuable experience.', 'Du lịch là một trải nghiệm có giá trị.', 'INTERMEDIATE', 'Past and Perfect'),
(@c6, @l6_2, 'recently', '/ˈriːsntli/', 'gần đây', 'ADVERB', 'I have recently started a new course.', 'Gần đây tôi đã bắt đầu một khóa học mới.', 'INTERMEDIATE', 'Past and Perfect'),
(@c6, @l6_2, 'yet', '/jet/', 'chưa; rồi chưa', 'ADVERB', 'Have you finished yet?', 'Bạn đã hoàn thành chưa?', 'INTERMEDIATE', 'Past and Perfect'),
(@c6, @l6_3, 'intention', '/ɪnˈtenʃn/', 'dự định', 'NOUN', 'My intention is to study abroad.', 'Dự định của tôi là du học.', 'INTERMEDIATE', 'Future Forms'),
(@c6, @l6_3, 'prediction', '/prɪˈdɪkʃn/', 'dự đoán', 'NOUN', 'Her prediction was correct.', 'Dự đoán của cô ấy đã đúng.', 'INTERMEDIATE', 'Future Forms'),
(@c6, @l6_3, 'arrangement', '/əˈreɪndʒmənt/', 'sự sắp xếp, lịch hẹn', 'NOUN', 'We have a dinner arrangement for Friday.', 'Chúng tôi có lịch ăn tối vào thứ Sáu.', 'INTERMEDIATE', 'Future Forms'),
(@c6, @l6_4, 'condition', '/kənˈdɪʃn/', 'điều kiện', 'NOUN', 'The offer depends on one condition.', 'Lời đề nghị phụ thuộc vào một điều kiện.', 'INTERMEDIATE', 'Conditionals'),
(@c6, @l6_4, 'consequence', '/ˈkɑːnsəkwens/', 'hậu quả, kết quả', 'NOUN', 'Every choice has a consequence.', 'Mỗi lựa chọn đều có hậu quả.', 'INTERMEDIATE', 'Conditionals'),
(@c6, @l6_4, 'advice', '/ədˈvaɪs/', 'lời khuyên', 'NOUN', 'Thank you for your advice.', 'Cảm ơn lời khuyên của bạn.', 'INTERMEDIATE', 'Advice');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c6, @l6_1, 'Present Simple vs Present Continuous', 'Hiện tại đơn cho thói quen; hiện tại tiếp diễn cho hành động đang diễn ra hoặc tạm thời.', 'S + V(s/es); S + am/is/are + V-ing', 'Chọn thì dựa vào bản chất và thời gian của hành động.', 'He usually drives, but today he is taking the bus.', 'Các động từ trạng thái thường không dùng dạng tiếp diễn.', 'INTERMEDIATE'),
(@c6, @l6_2, 'Past Simple vs Present Perfect', 'Quá khứ đơn dùng với thời gian đã kết thúc; hiện tại hoàn thành liên hệ với hiện tại.', 'S + V2/ed; S + have/has + V3', 'Dùng past simple với yesterday/in 2024; present perfect với ever/never/yet.', 'I visited Hue last year. I have visited Hue twice.', 'Không dùng present perfect với mốc quá khứ đã kết thúc.', 'INTERMEDIATE'),
(@c6, @l6_3, 'Will, Going To and Present Continuous', 'Ba dạng tương lai thể hiện quyết định, dự định và lịch hẹn khác nhau.', 'will + V; be going to + V; be + V-ing + future time', 'Dùng theo mục đích và mức độ sắp xếp của kế hoạch.', 'I will answer. I am going to exercise. I am meeting Lan at six.', 'Không dùng một dạng tương lai cho mọi trường hợp.', 'INTERMEDIATE'),
(@c6, @l6_4, 'First Conditional and Should', 'Câu điều kiện loại 1 nói về khả năng thực tế; should đưa lời khuyên.', 'If + present simple, will + V; S + should + V', 'Dùng cho kế hoạch có điều kiện và lời khuyên.', 'If it rains, we will stay home. You should take an umbrella.', 'Không dùng will ngay sau if trong cấu trúc cơ bản.', 'INTERMEDIATE');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c6, NULL, 'Grammar for Real Communication – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex6 = (SELECT id FROM exercises WHERE course_id = @c6 AND title = 'Grammar for Real Communication – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex6, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “tạm thời”?', '“temporary” có nghĩa là “tạm thời”. Ví dụ: She is staying with a friend temporarily.', 10.00, 'temporary', 1),
(@ex6, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thói quen”?', '“habit” có nghĩa là “thói quen”. Ví dụ: Reading before bed is a good habit.', 10.00, 'habit', 2),
(@ex6, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “hiện tại”?', '“currently” có nghĩa là “hiện tại”. Ví dụ: I am currently working from home.', 10.00, 'currently', 3),
(@ex6, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “trải nghiệm”?', '“experience” có nghĩa là “trải nghiệm”. Ví dụ: Travel is a valuable experience.', 10.00, 'experience', 4),
(@ex6, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “gần đây”?', '“recently” có nghĩa là “gần đây”. Ví dụ: I have recently started a new course.', 10.00, 'recently', 5),
(@ex6, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “chưa; rồi chưa”?', '“yet” có nghĩa là “chưa; rồi chưa”. Ví dụ: Have you finished yet?', 10.00, 'yet', 6),
(@ex6, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Present Simple vs Present Continuous” là gì?', 'Hiện tại đơn cho thói quen; hiện tại tiếp diễn cho hành động đang diễn ra hoặc tạm thời.', 10.00, 'S + V(s/es); S + am/is/are + V-ing', 7),
(@ex6, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Past Simple vs Present Perfect” là gì?', 'Quá khứ đơn dùng với thời gian đã kết thúc; hiện tại hoàn thành liên hệ với hiện tại.', 10.00, 'S + V2/ed; S + have/has + V3', 8),
(@ex6, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Will, Going To and Present Continuous” là gì?', 'Ba dạng tương lai thể hiện quyết định, dự định và lịch hẹn khác nhau.', 10.00, 'will + V; be going to + V; be + V-ing + future time', 9),
(@ex6, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “First Conditional and Should” là gì?', 'Câu điều kiện loại 1 nói về khả năng thực tế; should đưa lời khuyên.', 10.00, 'If + present simple, will + V; S + should + V', 10);

SET @q6_1 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 1);
SET @q6_2 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 2);
SET @q6_3 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 3);
SET @q6_4 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 4);
SET @q6_5 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 5);
SET @q6_6 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 6);
SET @q6_7 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 7);
SET @q6_8 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 8);
SET @q6_9 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 9);
SET @q6_10 = (SELECT id FROM questions WHERE exercise_id = @ex6 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q6_1, 'consequence', FALSE, 1), (@q6_1, 'temporary', TRUE, 2), (@q6_1, 'arrangement', FALSE, 3), (@q6_1, 'advice', FALSE, 4),
(@q6_2, 'experience', FALSE, 1), (@q6_2, 'habit', TRUE, 2), (@q6_2, 'recently', FALSE, 3), (@q6_2, 'consequence', FALSE, 4),
(@q6_3, 'currently', TRUE, 1), (@q6_3, 'intention', FALSE, 2), (@q6_3, 'consequence', FALSE, 3), (@q6_3, 'advice', FALSE, 4),
(@q6_4, 'currently', FALSE, 1), (@q6_4, 'condition', FALSE, 2), (@q6_4, 'experience', TRUE, 3), (@q6_4, 'prediction', FALSE, 4),
(@q6_5, 'recently', TRUE, 1), (@q6_5, 'arrangement', FALSE, 2), (@q6_5, 'consequence', FALSE, 3), (@q6_5, 'yet', FALSE, 4),
(@q6_6, 'yet', TRUE, 1), (@q6_6, 'prediction', FALSE, 2), (@q6_6, 'consequence', FALSE, 3), (@q6_6, 'intention', FALSE, 4),
(@q6_7, 'S + V2/ed; S + have/has + V3', FALSE, 1), (@q6_7, 'S + V(s/es); S + am/is/are + V-ing', TRUE, 2), (@q6_7, 'If + present simple, will + V; S + should + V', FALSE, 3), (@q6_7, 'V-ing + subject + no auxiliary', FALSE, 4),
(@q6_8, 'S + V(s/es); S + am/is/are + V-ing', FALSE, 1), (@q6_8, 'S + V2/ed; S + have/has + V3', TRUE, 2), (@q6_8, 'S + past participle without an auxiliary', FALSE, 3), (@q6_8, 'If + present simple, will + V; S + should + V', FALSE, 4),
(@q6_9, 'If + present simple, will + V; S + should + V', FALSE, 1), (@q6_9, 'S + past participle without an auxiliary', FALSE, 2), (@q6_9, 'S + be + noun only', FALSE, 3), (@q6_9, 'will + V; be going to + V; be + V-ing + future time', TRUE, 4),
(@q6_10, 'S + past participle without an auxiliary', FALSE, 1), (@q6_10, 'If + present simple, will + V; S + should + V', TRUE, 2), (@q6_10, 'V-ing + subject + no auxiliary', FALSE, 3), (@q6_10, 'Question word + noun + adjective only', FALSE, 4);


-- ─────────────────────────────────────────────────────────────
-- COURSE 7: Practical Writing for Study and Work
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Practical Writing for Study and Work', 'practical-writing-for-study-and-work', 'Viết tin nhắn, email, báo lỗi và đoạn văn rõ ràng.', 'Khóa học mới cung cấp quy trình viết có mục đích, cấu trúc và giọng điệu phù hợp cho học tập và môi trường làm việc.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Practical+Writing+for+Study+and+Work', 'INTERMEDIATE', 'PAID', 649000.00, 429000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c7 = (SELECT id FROM courses WHERE slug = 'practical-writing-for-study-and-work');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c7, 'Yêu cầu và email', 'Chương 1 của khóa Practical Writing for Study and Work, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c7, 'Báo cáo và phản hồi', 'Chương 2 của khóa Practical Writing for Study and Work, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch7_1 = (SELECT id FROM chapters WHERE course_id = @c7 AND position = 1);
SET @ch7_2 = (SELECT id FROM chapters WHERE course_id = @c7 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch7_1, 'Clear Requests and Instructions', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nêu mục đích ngay đầu
- Chỉ rõ hành động và thời hạn
- Viết hướng dẫn ngắn gọn', NULL, 'https://www.youtube.com/watch?v=aO3Det4ir8U', 'Một yêu cầu rõ ràng cần có hành động và gì?', 'Thời hạn', 'Thời hạn giúp người nhận biết khi nào phải hoàn thành.', 1, 20, TRUE, 'PUBLISHED'),
(@ch7_1, 'Professional Email Structure', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Viết subject rõ ràng
- Sắp xếp greeting, body và closing
- Chọn giọng điệu phù hợp', NULL, 'https://www.youtube.com/watch?v=aO3Det4ir8U', 'Phần nào tóm tắt mục đích email?', 'Subject', 'Subject line cho người nhận biết nội dung chính.', 2, 22, FALSE, 'PUBLISHED'),
(@ch7_2, 'Reporting a Problem', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Mô tả lỗi bằng dữ kiện
- Nêu ảnh hưởng
- Đề xuất bước xử lý', NULL, 'https://www.youtube.com/watch?v=aO3Det4ir8U', 'Khi báo lỗi nên tập trung vào sự việc hay con người?', 'Sự việc', 'Báo lỗi chuyên nghiệp mô tả hành vi quan sát được.', 1, 24, FALSE, 'PUBLISHED'),
(@ch7_2, 'Paragraphs and Constructive Feedback', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Viết topic sentence
- Thêm ví dụ hỗ trợ
- Đưa phản hồi cụ thể và tôn trọng', NULL, 'https://www.youtube.com/watch?v=aO3Det4ir8U', 'Câu đầu nêu ý chính của đoạn gọi là gì?', 'Topic sentence', 'Topic sentence giới thiệu ý trung tâm của đoạn.', 2, 26, FALSE, 'PUBLISHED');

SET @l7_1 = (SELECT id FROM lessons WHERE chapter_id = @ch7_1 AND position = 1);
SET @l7_2 = (SELECT id FROM lessons WHERE chapter_id = @ch7_1 AND position = 2);
SET @l7_3 = (SELECT id FROM lessons WHERE chapter_id = @ch7_2 AND position = 1);
SET @l7_4 = (SELECT id FROM lessons WHERE chapter_id = @ch7_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c7, @l7_1, 'instruction', '/ɪnˈstrʌkʃn/', 'hướng dẫn', 'NOUN', 'Follow the instructions carefully.', 'Hãy làm theo hướng dẫn cẩn thận.', 'INTERMEDIATE', 'Clear Writing'),
(@c7, @l7_1, 'specific', '/spəˈsɪfɪk/', 'cụ thể', 'ADJECTIVE', 'Please give a specific deadline.', 'Vui lòng đưa ra hạn chót cụ thể.', 'INTERMEDIATE', 'Clear Writing'),
(@c7, @l7_1, 'complete', '/kəmˈpliːt/', 'hoàn thành', 'VERB', 'Complete the form by Friday.', 'Hoàn thành biểu mẫu trước thứ Sáu.', 'INTERMEDIATE', 'Clear Writing'),
(@c7, @l7_2, 'subject line', '/ˈsʌbdʒɪkt laɪn/', 'dòng tiêu đề', 'PHRASE', 'Use a clear subject line.', 'Hãy dùng dòng tiêu đề rõ ràng.', 'INTERMEDIATE', 'Professional Email'),
(@c7, @l7_2, 'recipient', '/rɪˈsɪpiənt/', 'người nhận', 'NOUN', 'Check the recipient before sending.', 'Kiểm tra người nhận trước khi gửi.', 'INTERMEDIATE', 'Professional Email'),
(@c7, @l7_2, 'regards', '/rɪˈɡɑːrdz/', 'lời chào cuối thư', 'NOUN', 'Kind regards is a professional closing.', 'Kind regards là lời chào cuối thư chuyên nghiệp.', 'INTERMEDIATE', 'Professional Email'),
(@c7, @l7_3, 'issue', '/ˈɪʃuː/', 'vấn đề', 'NOUN', 'We found an issue during testing.', 'Chúng tôi phát hiện một vấn đề khi kiểm thử.', 'INTERMEDIATE', 'Problem Reports'),
(@c7, @l7_3, 'impact', '/ˈɪmpækt/', 'ảnh hưởng', 'NOUN', 'The issue has a major impact on students.', 'Vấn đề ảnh hưởng lớn đến học viên.', 'INTERMEDIATE', 'Problem Reports'),
(@c7, @l7_3, 'resolve', '/rɪˈzɑːlv/', 'giải quyết', 'VERB', 'The team resolved the error.', 'Nhóm đã giải quyết lỗi.', 'INTERMEDIATE', 'Problem Reports'),
(@c7, @l7_4, 'feedback', '/ˈfiːdbæk/', 'phản hồi', 'NOUN', 'Your feedback helped me improve.', 'Phản hồi của bạn giúp tôi cải thiện.', 'INTERMEDIATE', 'Paragraph and Feedback'),
(@c7, @l7_4, 'evidence', '/ˈevɪdəns/', 'bằng chứng', 'NOUN', 'Use evidence to support your point.', 'Dùng bằng chứng để hỗ trợ quan điểm.', 'INTERMEDIATE', 'Paragraph and Feedback'),
(@c7, @l7_4, 'revise', '/rɪˈvaɪz/', 'chỉnh sửa', 'VERB', 'Revise the paragraph before submitting.', 'Chỉnh sửa đoạn văn trước khi nộp.', 'INTERMEDIATE', 'Paragraph and Feedback');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c7, @l7_1, 'Purpose Statements', 'Câu mở đầu nêu lý do viết giúp người đọc hiểu nhanh.', 'I am writing to + V / This message is to + V', 'Dùng trong yêu cầu, cập nhật và thông báo.', 'I am writing to request access to the folder.', 'Sau to dùng động từ nguyên mẫu.', 'INTERMEDIATE'),
(@c7, @l7_2, 'Formal Request Language', 'Các modal verb và cụm lịch sự làm email chuyên nghiệp hơn.', 'Could you + V...? / I would appreciate it if + past simple', 'Dùng khi yêu cầu thông tin hoặc hành động.', 'I would appreciate it if you could confirm the date.', 'Cấu trúc dài hơn phù hợp email trang trọng.', 'INTERMEDIATE'),
(@c7, @l7_3, 'Cause and Effect Connectors', 'Từ nối làm rõ nguyên nhân và hậu quả.', 'because / because of / therefore / as a result', 'Dùng trong báo cáo vấn đề và tác động.', 'The server was unavailable; as a result, users could not log in.', 'Because đi với mệnh đề; because of đi với danh từ.', 'INTERMEDIATE'),
(@c7, @l7_4, 'Paragraph Linking', 'Từ nối kết nối ý chính, giải thích, ví dụ và kết luận.', 'topic sentence + explanation + example + link', 'Dùng để tạo đoạn văn mạch lạc.', 'For example, regular review improves long-term memory.', 'Mỗi đoạn nên tập trung vào một ý chính.', 'INTERMEDIATE');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c7, NULL, 'Practical Writing for Study and Work – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex7 = (SELECT id FROM exercises WHERE course_id = @c7 AND title = 'Practical Writing for Study and Work – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex7, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “hướng dẫn”?', '“instruction” có nghĩa là “hướng dẫn”. Ví dụ: Follow the instructions carefully.', 10.00, 'instruction', 1),
(@ex7, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “cụ thể”?', '“specific” có nghĩa là “cụ thể”. Ví dụ: Please give a specific deadline.', 10.00, 'specific', 2),
(@ex7, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “hoàn thành”?', '“complete” có nghĩa là “hoàn thành”. Ví dụ: Complete the form by Friday.', 10.00, 'complete', 3),
(@ex7, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “dòng tiêu đề”?', '“subject line” có nghĩa là “dòng tiêu đề”. Ví dụ: Use a clear subject line.', 10.00, 'subject line', 4),
(@ex7, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “người nhận”?', '“recipient” có nghĩa là “người nhận”. Ví dụ: Check the recipient before sending.', 10.00, 'recipient', 5),
(@ex7, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “lời chào cuối thư”?', '“regards” có nghĩa là “lời chào cuối thư”. Ví dụ: Kind regards is a professional closing.', 10.00, 'regards', 6),
(@ex7, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Purpose Statements” là gì?', 'Câu mở đầu nêu lý do viết giúp người đọc hiểu nhanh.', 10.00, 'I am writing to + V / This message is to + V', 7),
(@ex7, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Formal Request Language” là gì?', 'Các modal verb và cụm lịch sự làm email chuyên nghiệp hơn.', 10.00, 'Could you + V...? / I would appreciate it if + past simple', 8),
(@ex7, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Cause and Effect Connectors” là gì?', 'Từ nối làm rõ nguyên nhân và hậu quả.', 10.00, 'because / because of / therefore / as a result', 9),
(@ex7, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Paragraph Linking” là gì?', 'Từ nối kết nối ý chính, giải thích, ví dụ và kết luận.', 10.00, 'topic sentence + explanation + example + link', 10);

SET @q7_1 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 1);
SET @q7_2 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 2);
SET @q7_3 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 3);
SET @q7_4 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 4);
SET @q7_5 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 5);
SET @q7_6 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 6);
SET @q7_7 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 7);
SET @q7_8 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 8);
SET @q7_9 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 9);
SET @q7_10 = (SELECT id FROM questions WHERE exercise_id = @ex7 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q7_1, 'issue', FALSE, 1), (@q7_1, 'subject line', FALSE, 2), (@q7_1, 'instruction', TRUE, 3), (@q7_1, 'specific', FALSE, 4),
(@q7_2, 'specific', TRUE, 1), (@q7_2, 'recipient', FALSE, 2), (@q7_2, 'subject line', FALSE, 3), (@q7_2, 'feedback', FALSE, 4),
(@q7_3, 'complete', TRUE, 1), (@q7_3, 'revise', FALSE, 2), (@q7_3, 'impact', FALSE, 3), (@q7_3, 'feedback', FALSE, 4),
(@q7_4, 'subject line', TRUE, 1), (@q7_4, 'regards', FALSE, 2), (@q7_4, 'revise', FALSE, 3), (@q7_4, 'evidence', FALSE, 4),
(@q7_5, 'revise', FALSE, 1), (@q7_5, 'recipient', TRUE, 2), (@q7_5, 'impact', FALSE, 3), (@q7_5, 'instruction', FALSE, 4),
(@q7_6, 'impact', FALSE, 1), (@q7_6, 'revise', FALSE, 2), (@q7_6, 'regards', TRUE, 3), (@q7_6, 'instruction', FALSE, 4),
(@q7_7, 'I am writing to + V / This message is to + V', TRUE, 1), (@q7_7, 'S + be + noun only', FALSE, 2), (@q7_7, 'because / because of / therefore / as a result', FALSE, 3), (@q7_7, 'Question word + noun + adjective only', FALSE, 4),
(@q7_8, 'S + be + noun only', FALSE, 1), (@q7_8, 'S + past participle without an auxiliary', FALSE, 2), (@q7_8, 'Could you + V...? / I would appreciate it if + past simple', TRUE, 3), (@q7_8, 'Question word + noun + adjective only', FALSE, 4),
(@q7_9, 'V-ing + subject + no auxiliary', FALSE, 1), (@q7_9, 'Could you + V...? / I would appreciate it if + past simple', FALSE, 2), (@q7_9, 'because / because of / therefore / as a result', TRUE, 3), (@q7_9, 'S + past participle without an auxiliary', FALSE, 4),
(@q7_10, 'because / because of / therefore / as a result', FALSE, 1), (@q7_10, 'V-ing + subject + no auxiliary', FALSE, 2), (@q7_10, 'topic sentence + explanation + example + link', TRUE, 3), (@q7_10, 'S + be + noun only', FALSE, 4);

-- ─────────────────────────────────────────────────────────────
-- COURSE 8: Speaking with Confidence
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Speaking with Confidence', 'speaking-with-confidence', 'Duy trì hội thoại, kể chuyện, trình bày ý kiến và xử lý câu hỏi.', 'Khóa học mới phát triển chiến lược nói thay vì chỉ học thuộc mẫu câu, giúp học viên phản hồi linh hoạt trong hội thoại và thuyết trình.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Speaking+with+Confidence', 'INTERMEDIATE', 'PAID', 699000.00, 459000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c8 = (SELECT id FROM courses WHERE slug = 'speaking-with-confidence');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c8, 'Hội thoại và kể chuyện', 'Chương 1 của khóa Speaking with Confidence, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c8, 'Ý kiến và thuyết trình', 'Chương 2 của khóa Speaking with Confidence, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch8_1 = (SELECT id FROM chapters WHERE course_id = @c8 AND position = 1);
SET @ch8_2 = (SELECT id FROM chapters WHERE course_id = @c8 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch8_1, 'Small Talk and Follow-up Questions', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Bắt đầu cuộc trò chuyện
- Đặt câu hỏi tiếp nối
- Thể hiện đang lắng nghe', NULL, 'https://www.youtube.com/watch?v=I1GWT0Oosp8', 'Câu hỏi nào khuyến khích người nói tiếp tục?', 'What happened next?', 'Đây là câu hỏi tiếp nối mở.', 1, 20, TRUE, 'PUBLISHED'),
(@ch8_1, 'Tell a Clear Story', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Tạo bối cảnh
- Kể sự kiện theo trình tự
- Kết thúc bằng kết quả hoặc cảm nhận', NULL, 'https://www.youtube.com/watch?v=I1GWT0Oosp8', 'Từ nối nào báo hiệu sự kiện bất ngờ?', 'Suddenly', 'Suddenly giới thiệu một thay đổi bất ngờ.', 2, 22, FALSE, 'PUBLISHED'),
(@ch8_2, 'Opinions and Polite Disagreement', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nêu ý kiến
- Thêm lý do và ví dụ
- Không đồng ý lịch sự', NULL, 'https://www.youtube.com/watch?v=I1GWT0Oosp8', 'Cụm nào không đồng ý lịch sự?', 'I see your point, but I have a different view.', 'Câu công nhận ý đối phương trước khi đưa quan điểm khác.', 1, 24, FALSE, 'PUBLISHED'),
(@ch8_2, 'Presentations and Question Handling', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Mở đầu và giới thiệu cấu trúc
- Dùng signposting
- Yêu cầu làm rõ câu hỏi', NULL, 'https://www.youtube.com/watch?v=I1GWT0Oosp8', 'Cụm nào yêu cầu làm rõ câu hỏi?', 'Could you clarify your question?', 'Clarify dùng khi câu hỏi chưa rõ.', 2, 26, FALSE, 'PUBLISHED');

SET @l8_1 = (SELECT id FROM lessons WHERE chapter_id = @ch8_1 AND position = 1);
SET @l8_2 = (SELECT id FROM lessons WHERE chapter_id = @ch8_1 AND position = 2);
SET @l8_3 = (SELECT id FROM lessons WHERE chapter_id = @ch8_2 AND position = 1);
SET @l8_4 = (SELECT id FROM lessons WHERE chapter_id = @ch8_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c8, @l8_1, 'conversation', '/ˌkɑːnvərˈseɪʃn/', 'cuộc trò chuyện', 'NOUN', 'We had a friendly conversation.', 'Chúng tôi có một cuộc trò chuyện thân thiện.', 'INTERMEDIATE', 'Small Talk'),
(@c8, @l8_1, 'follow-up', '/ˈfɑːloʊ ʌp/', 'tiếp nối', 'ADJECTIVE', 'Ask a follow-up question.', 'Hãy đặt một câu hỏi tiếp nối.', 'INTERMEDIATE', 'Small Talk'),
(@c8, @l8_1, 'interest', '/ˈɪntrəst/', 'sự quan tâm', 'NOUN', 'Show interest in the other person''s answer.', 'Hãy thể hiện sự quan tâm đến câu trả lời của người kia.', 'INTERMEDIATE', 'Small Talk'),
(@c8, @l8_2, 'background', '/ˈbækɡraʊnd/', 'bối cảnh', 'NOUN', 'Start by giving some background.', 'Hãy bắt đầu bằng cách cung cấp bối cảnh.', 'INTERMEDIATE', 'Storytelling'),
(@c8, @l8_2, 'suddenly', '/ˈsʌdənli/', 'đột nhiên', 'ADVERB', 'Suddenly, the lights went out.', 'Đột nhiên, đèn tắt.', 'INTERMEDIATE', 'Storytelling'),
(@c8, @l8_2, 'reaction', '/riˈækʃn/', 'phản ứng', 'NOUN', 'Her reaction surprised everyone.', 'Phản ứng của cô ấy làm mọi người ngạc nhiên.', 'INTERMEDIATE', 'Storytelling'),
(@c8, @l8_3, 'opinion', '/əˈpɪnjən/', 'ý kiến', 'NOUN', 'Everyone should be able to express an opinion.', 'Mọi người nên có thể trình bày ý kiến.', 'INTERMEDIATE', 'Opinions'),
(@c8, @l8_3, 'perspective', '/pərˈspektɪv/', 'góc nhìn', 'NOUN', 'Try to understand another perspective.', 'Hãy cố hiểu một góc nhìn khác.', 'INTERMEDIATE', 'Opinions'),
(@c8, @l8_3, 'agree to some extent', '/əˈɡriː tə sʌm ɪkˈstent/', 'đồng ý ở một mức độ', 'PHRASE', 'I agree to some extent, but cost is still a concern.', 'Tôi đồng ý ở một mức độ, nhưng chi phí vẫn đáng lo.', 'INTERMEDIATE', 'Opinions'),
(@c8, @l8_4, 'signposting', '/ˈsaɪnpoʊstɪŋ/', 'ngôn ngữ dẫn dắt cấu trúc', 'NOUN', 'Signposting helps the audience follow the talk.', 'Ngôn ngữ dẫn dắt giúp khán giả theo dõi bài nói.', 'INTERMEDIATE', 'Presentations'),
(@c8, @l8_4, 'audience', '/ˈɔːdiəns/', 'khán giả', 'NOUN', 'Maintain eye contact with the audience.', 'Hãy duy trì giao tiếp bằng mắt với khán giả.', 'INTERMEDIATE', 'Presentations'),
(@c8, @l8_4, 'clarify', '/ˈklærəfaɪ/', 'làm rõ', 'VERB', 'Could you clarify the last question?', 'Bạn có thể làm rõ câu hỏi cuối không?', 'INTERMEDIATE', 'Presentations');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c8, @l8_1, 'Open and Closed Questions', 'Câu hỏi mở tạo câu trả lời dài; câu hỏi đóng thường trả lời yes/no.', 'Wh-word + auxiliary + S + V? / Auxiliary + S + V?', 'Dùng câu hỏi mở để duy trì hội thoại.', 'What did you enjoy most about the trip?', 'Không đặt liên tiếp quá nhiều câu hỏi như phỏng vấn.', 'INTERMEDIATE'),
(@c8, @l8_2, 'Past Simple and Past Continuous', 'Past continuous tạo bối cảnh; past simple kể sự kiện chính.', 'S + was/were + V-ing; S + V2/ed', 'Dùng khi kể một hành động đang diễn ra bị một sự kiện xen vào.', 'I was walking home when it started to rain.', 'When thường giới thiệu sự kiện ngắn; while thường đi với hành động kéo dài.', 'INTERMEDIATE'),
(@c8, @l8_3, 'Opinion Clauses', 'Các cụm mở đầu giúp tổ chức quan điểm và mức độ chắc chắn.', 'I think/believe that... / In my view,... / From my experience,...', 'Dùng trước quan điểm, lý do và ví dụ.', 'In my view, flexible schedules improve productivity.', 'Tránh lặp I think ở mọi câu.', 'INTERMEDIATE'),
(@c8, @l8_4, 'Presentation Signposting', 'Các cụm chuyển phần làm bài nói mạch lạc.', 'First, I will... / Let us move on to... / To sum up,...', 'Dùng ở phần mở đầu, chuyển ý và kết luận.', 'Let us move on to the second point.', 'Không dùng quá nhiều cụm chuyển ý trong một đoạn ngắn.', 'INTERMEDIATE');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c8, NULL, 'Speaking with Confidence – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex8 = (SELECT id FROM exercises WHERE course_id = @c8 AND title = 'Speaking with Confidence – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex8, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “cuộc trò chuyện”?', '“conversation” có nghĩa là “cuộc trò chuyện”. Ví dụ: We had a friendly conversation.', 10.00, 'conversation', 1),
(@ex8, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “tiếp nối”?', '“follow-up” có nghĩa là “tiếp nối”. Ví dụ: Ask a follow-up question.', 10.00, 'follow-up', 2),
(@ex8, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “sự quan tâm”?', '“interest” có nghĩa là “sự quan tâm”. Ví dụ: Show interest in the other person''s answer.', 10.00, 'interest', 3),
(@ex8, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “bối cảnh”?', '“background” có nghĩa là “bối cảnh”. Ví dụ: Start by giving some background.', 10.00, 'background', 4),
(@ex8, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “đột nhiên”?', '“suddenly” có nghĩa là “đột nhiên”. Ví dụ: Suddenly, the lights went out.', 10.00, 'suddenly', 5),
(@ex8, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “phản ứng”?', '“reaction” có nghĩa là “phản ứng”. Ví dụ: Her reaction surprised everyone.', 10.00, 'reaction', 6),
(@ex8, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Open and Closed Questions” là gì?', 'Câu hỏi mở tạo câu trả lời dài; câu hỏi đóng thường trả lời yes/no.', 10.00, 'Wh-word + auxiliary + S + V? / Auxiliary + S + V?', 7),
(@ex8, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Past Simple and Past Continuous” là gì?', 'Past continuous tạo bối cảnh; past simple kể sự kiện chính.', 10.00, 'S + was/were + V-ing; S + V2/ed', 8),
(@ex8, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Opinion Clauses” là gì?', 'Các cụm mở đầu giúp tổ chức quan điểm và mức độ chắc chắn.', 10.00, 'I think/believe that... / In my view,... / From my experience,...', 9),
(@ex8, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Presentation Signposting” là gì?', 'Các cụm chuyển phần làm bài nói mạch lạc.', 10.00, 'First, I will... / Let us move on to... / To sum up,...', 10);

SET @q8_1 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 1);
SET @q8_2 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 2);
SET @q8_3 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 3);
SET @q8_4 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 4);
SET @q8_5 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 5);
SET @q8_6 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 6);
SET @q8_7 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 7);
SET @q8_8 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 8);
SET @q8_9 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 9);
SET @q8_10 = (SELECT id FROM questions WHERE exercise_id = @ex8 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q8_1, 'perspective', FALSE, 1), (@q8_1, 'audience', FALSE, 2), (@q8_1, 'conversation', TRUE, 3), (@q8_1, 'agree to some extent', FALSE, 4),
(@q8_2, 'interest', FALSE, 1), (@q8_2, 'clarify', FALSE, 2), (@q8_2, 'follow-up', TRUE, 3), (@q8_2, 'agree to some extent', FALSE, 4),
(@q8_3, 'agree to some extent', FALSE, 1), (@q8_3, 'conversation', FALSE, 2), (@q8_3, 'audience', FALSE, 3), (@q8_3, 'interest', TRUE, 4),
(@q8_4, 'interest', FALSE, 1), (@q8_4, 'audience', FALSE, 2), (@q8_4, 'background', TRUE, 3), (@q8_4, 'signposting', FALSE, 4),
(@q8_5, 'signposting', FALSE, 1), (@q8_5, 'suddenly', TRUE, 2), (@q8_5, 'follow-up', FALSE, 3), (@q8_5, 'interest', FALSE, 4),
(@q8_6, 'reaction', TRUE, 1), (@q8_6, 'interest', FALSE, 2), (@q8_6, 'perspective', FALSE, 3), (@q8_6, 'follow-up', FALSE, 4),
(@q8_7, 'S + was/were + V-ing; S + V2/ed', FALSE, 1), (@q8_7, 'Wh-word + auxiliary + S + V? / Auxiliary + S + V?', TRUE, 2), (@q8_7, 'V-ing + subject + no auxiliary', FALSE, 3), (@q8_7, 'First, I will... / Let us move on to... / To sum up,...', FALSE, 4),
(@q8_8, 'First, I will... / Let us move on to... / To sum up,...', FALSE, 1), (@q8_8, 'Question word + noun + adjective only', FALSE, 2), (@q8_8, 'Wh-word + auxiliary + S + V? / Auxiliary + S + V?', FALSE, 3), (@q8_8, 'S + was/were + V-ing; S + V2/ed', TRUE, 4),
(@q8_9, 'I think/believe that... / In my view,... / From my experience,...', TRUE, 1), (@q8_9, 'S + past participle without an auxiliary', FALSE, 2), (@q8_9, 'V-ing + subject + no auxiliary', FALSE, 3), (@q8_9, 'First, I will... / Let us move on to... / To sum up,...', FALSE, 4),
(@q8_10, 'Question word + noun + adjective only', FALSE, 1), (@q8_10, 'Wh-word + auxiliary + S + V? / Auxiliary + S + V?', FALSE, 2), (@q8_10, 'S + be + noun only', FALSE, 3), (@q8_10, 'First, I will... / Let us move on to... / To sum up,...', TRUE, 4);

-- ─────────────────────────────────────────────────────────────
-- COURSE 9: Academic Study Skills in English
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Academic Study Skills in English', 'academic-study-skills-in-english', 'Ghi chú, đọc có chiến lược, quản lý thời gian và xây dựng kế hoạch ôn tập.', 'Khóa học mới kết hợp kỹ năng ngôn ngữ với phương pháp tự học, phù hợp sinh viên cần học tài liệu và nghe bài giảng bằng tiếng Anh.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Academic+Study+Skills+in+English', 'INTERMEDIATE', 'FREE', 0.00, NULL, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c9 = (SELECT id FROM courses WHERE slug = 'academic-study-skills-in-english');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c9, 'Tiếp nhận và tổ chức thông tin', 'Chương 1 của khóa Academic Study Skills in English, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c9, 'Kế hoạch và ôn tập', 'Chương 2 của khóa Academic Study Skills in English, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch9_1 = (SELECT id FROM chapters WHERE course_id = @c9 AND position = 1);
SET @ch9_2 = (SELECT id FROM chapters WHERE course_id = @c9 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch9_1, 'Listen and Take Useful Notes', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Nghe ý chính
- Ghi từ khóa và ký hiệu
- Tổ chức ghi chú', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'Khi ghi chú nên tập trung vào gì?', 'Từ khóa', 'Từ khóa giúp ghi nhanh mà vẫn giữ nội dung chính.', 1, 20, TRUE, 'PUBLISHED'),
(@ch9_1, 'Reading Strategies for Study', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Skim tìm ý chính
- Scan tìm chi tiết
- Đoán nghĩa từ ngữ cảnh', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'Scanning dùng để làm gì?', 'Tìm thông tin cụ thể', 'Scanning tập trung vào từ khóa, số và tên riêng.', 2, 22, FALSE, 'PUBLISHED'),
(@ch9_2, 'Plan Your Study Time', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Đặt mục tiêu cụ thể
- Chia nhiệm vụ lớn
- Ưu tiên theo hạn chót', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'Mục tiêu tốt nên cụ thể hay mơ hồ?', 'Cụ thể', 'Mục tiêu cụ thể giúp đo lường và thực hiện.', 1, 24, FALSE, 'PUBLISHED'),
(@ch9_2, 'Review and Remember', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Dùng ôn tập giãn cách
- Tự kiểm tra
- Theo dõi lỗi và tiến bộ', NULL, 'https://www.youtube.com/watch?v=3kxF1-jkz-U', 'Spaced repetition có nghĩa là gì?', 'Ôn tập lặp lại theo khoảng thời gian', 'Phương pháp này phân bố các lần ôn thay vì học dồn.', 2, 26, FALSE, 'PUBLISHED');

SET @l9_1 = (SELECT id FROM lessons WHERE chapter_id = @ch9_1 AND position = 1);
SET @l9_2 = (SELECT id FROM lessons WHERE chapter_id = @ch9_1 AND position = 2);
SET @l9_3 = (SELECT id FROM lessons WHERE chapter_id = @ch9_2 AND position = 1);
SET @l9_4 = (SELECT id FROM lessons WHERE chapter_id = @ch9_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c9, @l9_1, 'keyword', '/ˈkiːwɜːrd/', 'từ khóa', 'NOUN', 'Write down the main keywords.', 'Hãy ghi lại các từ khóa chính.', 'INTERMEDIATE', 'Note Taking'),
(@c9, @l9_1, 'abbreviation', '/əˌbriːviˈeɪʃn/', 'chữ viết tắt', 'NOUN', 'Use abbreviations to save time.', 'Dùng chữ viết tắt để tiết kiệm thời gian.', 'INTERMEDIATE', 'Note Taking'),
(@c9, @l9_1, 'outline', '/ˈaʊtlaɪn/', 'dàn ý', 'NOUN', 'The outline shows the lecture structure.', 'Dàn ý thể hiện cấu trúc bài giảng.', 'INTERMEDIATE', 'Note Taking'),
(@c9, @l9_2, 'skim', '/skɪm/', 'đọc lướt lấy ý chính', 'VERB', 'Skim the article before reading closely.', 'Đọc lướt bài trước khi đọc kỹ.', 'INTERMEDIATE', 'Reading Strategies'),
(@c9, @l9_2, 'scan', '/skæn/', 'đọc quét tìm thông tin', 'VERB', 'Scan the page for dates and names.', 'Đọc quét trang để tìm ngày và tên.', 'INTERMEDIATE', 'Reading Strategies'),
(@c9, @l9_2, 'context', '/ˈkɑːntekst/', 'ngữ cảnh', 'NOUN', 'Use context to guess the meaning.', 'Dùng ngữ cảnh để đoán nghĩa.', 'INTERMEDIATE', 'Reading Strategies'),
(@c9, @l9_3, 'priority', '/praɪˈɔːrəti/', 'mức ưu tiên', 'NOUN', 'The exam is my top priority.', 'Kỳ thi là ưu tiên hàng đầu của tôi.', 'INTERMEDIATE', 'Study Planning'),
(@c9, @l9_3, 'deadline', '/ˈdedlaɪn/', 'hạn chót', 'NOUN', 'Add every deadline to your calendar.', 'Thêm mọi hạn chót vào lịch.', 'INTERMEDIATE', 'Study Planning'),
(@c9, @l9_3, 'manageable', '/ˈmænɪdʒəbl/', 'có thể quản lý được', 'ADJECTIVE', 'Break the project into manageable tasks.', 'Chia dự án thành các nhiệm vụ có thể quản lý.', 'INTERMEDIATE', 'Study Planning'),
(@c9, @l9_4, 'review', '/rɪˈvjuː/', 'ôn tập', 'VERB', 'Review the lesson after one day.', 'Ôn lại bài sau một ngày.', 'INTERMEDIATE', 'Memory and Review'),
(@c9, @l9_4, 'recall', '/rɪˈkɔːl/', 'nhớ lại', 'VERB', 'Try to recall the answer without looking.', 'Hãy cố nhớ đáp án mà không nhìn.', 'INTERMEDIATE', 'Memory and Review'),
(@c9, @l9_4, 'progress', '/ˈprɑːɡres/', 'tiến bộ', 'NOUN', 'Track your progress each week.', 'Theo dõi tiến bộ mỗi tuần.', 'INTERMEDIATE', 'Memory and Review');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c9, @l9_1, 'Noun Phrases in Notes', 'Ghi chú thường dùng cụm danh từ thay vì câu đầy đủ.', 'adjective + noun / noun + noun', 'Dùng để rút gọn thông tin mà vẫn giữ ý.', 'major climate change effects', 'Ghi chú có thể bỏ mạo từ và trợ động từ.', 'INTERMEDIATE'),
(@c9, @l9_2, 'Reference Words', 'Đại từ và từ tham chiếu liên kết các câu trong văn bản.', 'this/that/these/those/it/they + reference', 'Dùng để xác định từ hoặc ý mà đại từ thay thế.', 'The experiment failed. This result surprised the team.', 'Đọc câu trước và sau để tìm đối tượng tham chiếu.', 'INTERMEDIATE'),
(@c9, @l9_3, 'Future Plans and Goals', 'Will và be going to diễn tả kế hoạch học tập.', 'S + will + V / S + be going to + V', 'Dùng để nói cam kết và dự định.', 'I am going to review vocabulary every evening.', 'Mục tiêu nên đi kèm thời gian và số lượng cụ thể.', 'INTERMEDIATE'),
(@c9, @l9_4, 'Modals for Study Advice', 'Should, need to và must diễn tả mức độ cần thiết.', 'S + should/must + V; S + need to + V', 'Dùng để tạo kế hoạch và lời khuyên học tập.', 'You should review difficult words more often.', 'Must mạnh hơn should; dùng phù hợp để tránh giọng quá áp đặt.', 'INTERMEDIATE');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c9, NULL, 'Academic Study Skills in English – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex9 = (SELECT id FROM exercises WHERE course_id = @c9 AND title = 'Academic Study Skills in English – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex9, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “từ khóa”?', '“keyword” có nghĩa là “từ khóa”. Ví dụ: Write down the main keywords.', 10.00, 'keyword', 1),
(@ex9, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “chữ viết tắt”?', '“abbreviation” có nghĩa là “chữ viết tắt”. Ví dụ: Use abbreviations to save time.', 10.00, 'abbreviation', 2),
(@ex9, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “dàn ý”?', '“outline” có nghĩa là “dàn ý”. Ví dụ: The outline shows the lecture structure.', 10.00, 'outline', 3),
(@ex9, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “đọc lướt lấy ý chính”?', '“skim” có nghĩa là “đọc lướt lấy ý chính”. Ví dụ: Skim the article before reading closely.', 10.00, 'skim', 4),
(@ex9, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “đọc quét tìm thông tin”?', '“scan” có nghĩa là “đọc quét tìm thông tin”. Ví dụ: Scan the page for dates and names.', 10.00, 'scan', 5),
(@ex9, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “ngữ cảnh”?', '“context” có nghĩa là “ngữ cảnh”. Ví dụ: Use context to guess the meaning.', 10.00, 'context', 6),
(@ex9, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Noun Phrases in Notes” là gì?', 'Ghi chú thường dùng cụm danh từ thay vì câu đầy đủ.', 10.00, 'adjective + noun / noun + noun', 7),
(@ex9, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Reference Words” là gì?', 'Đại từ và từ tham chiếu liên kết các câu trong văn bản.', 10.00, 'this/that/these/those/it/they + reference', 8),
(@ex9, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Future Plans and Goals” là gì?', 'Will và be going to diễn tả kế hoạch học tập.', 10.00, 'S + will + V / S + be going to + V', 9),
(@ex9, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Modals for Study Advice” là gì?', 'Should, need to và must diễn tả mức độ cần thiết.', 10.00, 'S + should/must + V; S + need to + V', 10);

SET @q9_1 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 1);
SET @q9_2 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 2);
SET @q9_3 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 3);
SET @q9_4 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 4);
SET @q9_5 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 5);
SET @q9_6 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 6);
SET @q9_7 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 7);
SET @q9_8 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 8);
SET @q9_9 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 9);
SET @q9_10 = (SELECT id FROM questions WHERE exercise_id = @ex9 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q9_1, 'keyword', TRUE, 1), (@q9_1, 'deadline', FALSE, 2), (@q9_1, 'recall', FALSE, 3), (@q9_1, 'outline', FALSE, 4),
(@q9_2, 'outline', FALSE, 1), (@q9_2, 'keyword', FALSE, 2), (@q9_2, 'review', FALSE, 3), (@q9_2, 'abbreviation', TRUE, 4),
(@q9_3, 'priority', FALSE, 1), (@q9_3, 'progress', FALSE, 2), (@q9_3, 'outline', TRUE, 3), (@q9_3, 'recall', FALSE, 4),
(@q9_4, 'skim', TRUE, 1), (@q9_4, 'progress', FALSE, 2), (@q9_4, 'deadline', FALSE, 3), (@q9_4, 'review', FALSE, 4),
(@q9_5, 'review', FALSE, 1), (@q9_5, 'abbreviation', FALSE, 2), (@q9_5, 'recall', FALSE, 3), (@q9_5, 'scan', TRUE, 4),
(@q9_6, 'scan', FALSE, 1), (@q9_6, 'outline', FALSE, 2), (@q9_6, 'context', TRUE, 3), (@q9_6, 'recall', FALSE, 4),
(@q9_7, 'S + be + noun only', FALSE, 1), (@q9_7, 'adjective + noun / noun + noun', TRUE, 2), (@q9_7, 'Question word + noun + adjective only', FALSE, 3), (@q9_7, 'S + will + V / S + be going to + V', FALSE, 4),
(@q9_8, 'this/that/these/those/it/they + reference', TRUE, 1), (@q9_8, 'S + will + V / S + be going to + V', FALSE, 2), (@q9_8, 'adjective + noun / noun + noun', FALSE, 3), (@q9_8, 'V-ing + subject + no auxiliary', FALSE, 4),
(@q9_9, 'S + past participle without an auxiliary', FALSE, 1), (@q9_9, 'S + should/must + V; S + need to + V', FALSE, 2), (@q9_9, 'V-ing + subject + no auxiliary', FALSE, 3), (@q9_9, 'S + will + V / S + be going to + V', TRUE, 4),
(@q9_10, 'S + past participle without an auxiliary', FALSE, 1), (@q9_10, 'S + will + V / S + be going to + V', FALSE, 2), (@q9_10, 'adjective + noun / noun + noun', FALSE, 3), (@q9_10, 'S + should/must + V; S + need to + V', TRUE, 4);

-- ─────────────────────────────────────────────────────────────
-- COURSE 10: Critical English for Digital Life
-- ─────────────────────────────────────────────────────────────
INSERT INTO courses (teacher_id, title, slug, short_description, description, thumbnail_url, level, course_type, original_price, sale_price, status, published_at)
VALUES (2, 'Critical English for Digital Life', 'critical-english-for-digital-life', 'Thảo luận đời sống số, đánh giá nguồn tin và trình bày quan điểm có bằng chứng.', 'Khóa học mới tích hợp đọc, từ vựng và tư duy phản biện để học viên xử lý nội dung trực tuyến bằng tiếng Anh một cách có trách nhiệm.', 'https://placehold.co/1280x720/0F172A/FFFFFF?text=Critical+English+for+Digital+Life', 'ADVANCED', 'PAID', 799000.00, 529000.00, 'PUBLISHED', CURRENT_TIMESTAMP);

SET @c10 = (SELECT id FROM courses WHERE slug = 'critical-english-for-digital-life');

INSERT INTO chapters (course_id, title, description, position, status) VALUES
(@c10, 'Ngôn ngữ đời sống số', 'Chương 1 của khóa Critical English for Digital Life, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 1, 'PUBLISHED'),
(@c10, 'Đánh giá và tranh luận', 'Chương 2 của khóa Critical English for Digital Life, gồm hai bài học theo trình tự từ kiến thức nền đến vận dụng.', 2, 'PUBLISHED');

SET @ch10_1 = (SELECT id FROM chapters WHERE course_id = @c10 AND position = 1);
SET @ch10_2 = (SELECT id FROM chapters WHERE course_id = @c10 AND position = 2);

INSERT INTO lessons (chapter_id, title, lesson_type, content, audio_url, video_url, checkpoint_question, checkpoint_answer, checkpoint_explanation, position, duration_minutes, is_preview, status) VALUES
(@ch10_1, 'Social Media Language and Habits', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Hiểu động từ trên nền tảng số
- Mô tả thói quen sử dụng
- Nêu lợi ích và rủi ro', NULL, 'https://www.youtube.com/watch?v=E_2CwOpt0NY', 'Go viral có nghĩa là gì?', 'Lan truyền nhanh đến nhiều người', 'Nội dung viral được chia sẻ rộng trong thời gian ngắn.', 1, 20, TRUE, 'PUBLISHED'),
(@ch10_1, 'Fact, Opinion and Claim', 'MIXED', 'MỤC TIÊU BÀI HỌC
- Phân biệt dữ kiện và ý kiến
- Nhận biết claim cần bằng chứng
- Phân tích ngôn ngữ cảm xúc', NULL, 'https://www.youtube.com/watch?v=E_2CwOpt0NY', 'Thông tin có thể kiểm tra khách quan gọi là gì?', 'Fact', 'Fact có thể được xác minh bằng bằng chứng.', 2, 22, FALSE, 'PUBLISHED'),
(@ch10_2, 'Check Sources and Evidence', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Kiểm tra tác giả và ngày đăng
- Tìm nguồn gốc bằng chứng
- So sánh nhiều nguồn', NULL, 'https://www.youtube.com/watch?v=E_2CwOpt0NY', 'Trước khi chia sẻ nên kiểm tra gì?', 'Nguồn và bằng chứng', 'Nguồn đáng tin và bằng chứng hỗ trợ giúp đánh giá độ chính xác.', 1, 24, FALSE, 'PUBLISHED'),
(@ch10_2, 'Debate Digital Wellbeing', 'VIDEO', 'MỤC TIÊU BÀI HỌC
- Trình bày luận điểm
- Dùng bằng chứng và phản biện
- Đưa kết luận cân bằng', NULL, 'https://www.youtube.com/watch?v=E_2CwOpt0NY', 'Counterargument có nghĩa là gì?', 'Lập luận phản biện', 'Counterargument là ý kiến đối lập cần được xem xét và phản hồi.', 2, 26, FALSE, 'PUBLISHED');

SET @l10_1 = (SELECT id FROM lessons WHERE chapter_id = @ch10_1 AND position = 1);
SET @l10_2 = (SELECT id FROM lessons WHERE chapter_id = @ch10_1 AND position = 2);
SET @l10_3 = (SELECT id FROM lessons WHERE chapter_id = @ch10_2 AND position = 1);
SET @l10_4 = (SELECT id FROM lessons WHERE chapter_id = @ch10_2 AND position = 2);

INSERT INTO vocabularies (course_id, lesson_id, word, ipa, meaning, part_of_speech, example_sentence, example_meaning, level, topic) VALUES
(@c10, @l10_1, 'scroll', '/skroʊl/', 'lướt nội dung', 'VERB', 'I stopped scrolling after ten minutes.', 'Tôi ngừng lướt sau mười phút.', 'ADVANCED', 'Digital Habits'),
(@c10, @l10_1, 'algorithm', '/ˈælɡərɪðəm/', 'thuật toán', 'NOUN', 'The algorithm recommends similar videos.', 'Thuật toán đề xuất các video tương tự.', 'ADVANCED', 'Digital Habits'),
(@c10, @l10_1, 'viral', '/ˈvaɪrəl/', 'lan truyền nhanh', 'ADJECTIVE', 'The short video went viral overnight.', 'Video ngắn lan truyền chỉ sau một đêm.', 'ADVANCED', 'Digital Habits'),
(@c10, @l10_2, 'fact', '/fækt/', 'dữ kiện', 'NOUN', 'The publication date is a verifiable fact.', 'Ngày xuất bản là dữ kiện có thể kiểm tra.', 'ADVANCED', 'Critical Reading'),
(@c10, @l10_2, 'opinion', '/əˈpɪnjən/', 'ý kiến', 'NOUN', 'The review expresses a personal opinion.', 'Bài đánh giá thể hiện ý kiến cá nhân.', 'ADVANCED', 'Critical Reading'),
(@c10, @l10_2, 'claim', '/kleɪm/', 'khẳng định cần chứng minh', 'NOUN', 'The article makes a strong claim without evidence.', 'Bài viết đưa ra khẳng định mạnh nhưng không có bằng chứng.', 'ADVANCED', 'Critical Reading'),
(@c10, @l10_3, 'source', '/sɔːrs/', 'nguồn', 'NOUN', 'Always check the original source.', 'Luôn kiểm tra nguồn gốc ban đầu.', 'ADVANCED', 'Source Evaluation'),
(@c10, @l10_3, 'evidence', '/ˈevɪdəns/', 'bằng chứng', 'NOUN', 'The conclusion is supported by evidence.', 'Kết luận được hỗ trợ bằng bằng chứng.', 'ADVANCED', 'Source Evaluation'),
(@c10, @l10_3, 'reliable', '/rɪˈlaɪəbl/', 'đáng tin cậy', 'ADJECTIVE', 'Use reliable academic sources.', 'Hãy dùng nguồn học thuật đáng tin cậy.', 'ADVANCED', 'Source Evaluation'),
(@c10, @l10_4, 'wellbeing', '/ˌwelˈbiːɪŋ/', 'sức khỏe và trạng thái tốt', 'NOUN', 'Digital habits can affect wellbeing.', 'Thói quen số có thể ảnh hưởng sức khỏe.', 'ADVANCED', 'Digital Wellbeing'),
(@c10, @l10_4, 'counterargument', '/ˈkaʊntərˌɑːrɡjumənt/', 'lập luận phản biện', 'NOUN', 'A strong essay addresses a counterargument.', 'Bài luận tốt xử lý một lập luận phản biện.', 'ADVANCED', 'Digital Wellbeing'),
(@c10, @l10_4, 'balanced', '/ˈbælənst/', 'cân bằng', 'ADJECTIVE', 'The article presents a balanced conclusion.', 'Bài viết đưa ra kết luận cân bằng.', 'ADVANCED', 'Digital Wellbeing');

INSERT INTO grammar_topics (course_id, lesson_id, title, description, formula, usage_text, example, note, level) VALUES
(@c10, @l10_1, 'Present Simple for Digital Habits', 'Hiện tại đơn mô tả hành vi thường xuyên và cách hệ thống hoạt động.', 'S + V(s/es)', 'Dùng khi nói thói quen hoặc chức năng ổn định.', 'The platform collects usage data.', 'Phân biệt thói quen chung với hành động đang diễn ra.', 'ADVANCED'),
(@c10, @l10_2, 'Reporting Verbs', 'Reporting verbs cho biết mức độ chắc chắn hoặc thái độ của nguồn.', 'source + says/claims/reports/suggests + that-clause', 'Dùng khi tóm tắt và đánh giá thông tin.', 'The study suggests that screen time affects sleep.', 'Claims không đồng nghĩa với proves.', 'ADVANCED'),
(@c10, @l10_3, 'Passive Voice for Sources and Research', 'Bị động tập trung vào nghiên cứu, dữ liệu hoặc kết quả.', 'S + be + past participle', 'Dùng khi người thực hiện không quan trọng hoặc đã rõ.', 'The data was collected from 500 participants.', 'Cần nêu nguồn khi có thể, tránh bị động mơ hồ.', 'ADVANCED'),
(@c10, @l10_4, 'Hedging and Conditional Arguments', 'Hedging giúp tránh khẳng định quá tuyệt đối; conditionals trình bày quan hệ điều kiện.', 'may/might/could + V; If + clause, result clause', 'Dùng khi bằng chứng có giới hạn hoặc khi dự đoán tác động.', 'Excessive use may reduce sleep quality. If users set limits, they may focus better.', 'Hedging không làm lập luận yếu; nó thể hiện độ chính xác.', 'ADVANCED');

INSERT INTO exercises (course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status)
VALUES (@c10, NULL, 'Critical English for Digital Life – Final Check', 'Bài kiểm tra cuối khóa gồm 10 câu trắc nghiệm, đánh giá từ vựng, cấu trúc và khả năng vận dụng theo từng bài học.', 'MIXED', 20, 5, 'PUBLISHED');

SET @ex10 = (SELECT id FROM exercises WHERE course_id = @c10 AND title = 'Critical English for Digital Life – Final Check');

INSERT INTO questions (exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
(@ex10, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “lướt nội dung”?', '“scroll” có nghĩa là “lướt nội dung”. Ví dụ: I stopped scrolling after ten minutes.', 10.00, 'scroll', 1),
(@ex10, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “thuật toán”?', '“algorithm” có nghĩa là “thuật toán”. Ví dụ: The algorithm recommends similar videos.', 10.00, 'algorithm', 2),
(@ex10, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “lan truyền nhanh”?', '“viral” có nghĩa là “lan truyền nhanh”. Ví dụ: The short video went viral overnight.', 10.00, 'viral', 3),
(@ex10, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “dữ kiện”?', '“fact” có nghĩa là “dữ kiện”. Ví dụ: The publication date is a verifiable fact.', 10.00, 'fact', 4),
(@ex10, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “ý kiến”?', '“opinion” có nghĩa là “ý kiến”. Ví dụ: The review expresses a personal opinion.', 10.00, 'opinion', 5),
(@ex10, 'SINGLE_CHOICE', 'Từ hoặc cụm từ nào có nghĩa là “khẳng định cần chứng minh”?', '“claim” có nghĩa là “khẳng định cần chứng minh”. Ví dụ: The article makes a strong claim without evidence.', 10.00, 'claim', 6),
(@ex10, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Present Simple for Digital Habits” là gì?', 'Hiện tại đơn mô tả hành vi thường xuyên và cách hệ thống hoạt động.', 10.00, 'S + V(s/es)', 7),
(@ex10, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Reporting Verbs” là gì?', 'Reporting verbs cho biết mức độ chắc chắn hoặc thái độ của nguồn.', 10.00, 'source + says/claims/reports/suggests + that-clause', 8),
(@ex10, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Passive Voice for Sources and Research” là gì?', 'Bị động tập trung vào nghiên cứu, dữ liệu hoặc kết quả.', 10.00, 'S + be + past participle', 9),
(@ex10, 'SINGLE_CHOICE', 'Công thức hoặc mẫu cấu trúc phù hợp nhất với chủ điểm “Hedging and Conditional Arguments” là gì?', 'Hedging giúp tránh khẳng định quá tuyệt đối; conditionals trình bày quan hệ điều kiện.', 10.00, 'may/might/could + V; If + clause, result clause', 10);

SET @q10_1 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 1);
SET @q10_2 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 2);
SET @q10_3 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 3);
SET @q10_4 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 4);
SET @q10_5 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 5);
SET @q10_6 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 6);
SET @q10_7 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 7);
SET @q10_8 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 8);
SET @q10_9 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 9);
SET @q10_10 = (SELECT id FROM questions WHERE exercise_id = @ex10 AND position = 10);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
(@q10_1, 'counterargument', FALSE, 1), (@q10_1, 'opinion', FALSE, 2), (@q10_1, 'reliable', FALSE, 3), (@q10_1, 'scroll', TRUE, 4),
(@q10_2, 'algorithm', TRUE, 1), (@q10_2, 'source', FALSE, 2), (@q10_2, 'wellbeing', FALSE, 3), (@q10_2, 'fact', FALSE, 4),
(@q10_3, 'balanced', FALSE, 1), (@q10_3, 'viral', TRUE, 2), (@q10_3, 'fact', FALSE, 3), (@q10_3, 'counterargument', FALSE, 4),
(@q10_4, 'viral', FALSE, 1), (@q10_4, 'wellbeing', FALSE, 2), (@q10_4, 'fact', TRUE, 3), (@q10_4, 'claim', FALSE, 4),
(@q10_5, 'viral', FALSE, 1), (@q10_5, 'opinion', TRUE, 2), (@q10_5, 'reliable', FALSE, 3), (@q10_5, 'claim', FALSE, 4),
(@q10_6, 'claim', TRUE, 1), (@q10_6, 'source', FALSE, 2), (@q10_6, 'scroll', FALSE, 3), (@q10_6, 'evidence', FALSE, 4),
(@q10_7, 'S + V(s/es)', TRUE, 1), (@q10_7, 'V-ing + subject + no auxiliary', FALSE, 2), (@q10_7, 'S + past participle without an auxiliary', FALSE, 3), (@q10_7, 'S + be + noun only', FALSE, 4),
(@q10_8, 'source + says/claims/reports/suggests + that-clause', TRUE, 1), (@q10_8, 'S + past participle without an auxiliary', FALSE, 2), (@q10_8, 'S + be + noun only', FALSE, 3), (@q10_8, 'Question word + noun + adjective only', FALSE, 4),
(@q10_9, 'S + be + past participle', TRUE, 1), (@q10_9, 'Question word + noun + adjective only', FALSE, 2), (@q10_9, 'source + says/claims/reports/suggests + that-clause', FALSE, 3), (@q10_9, 'S + V(s/es)', FALSE, 4),
(@q10_10, 'Question word + noun + adjective only', FALSE, 1), (@q10_10, 'S + past participle without an auxiliary', FALSE, 2), (@q10_10, 'S + be + past participle', FALSE, 3), (@q10_10, 'may/might/could + V; If + clause, result clause', TRUE, 4);

