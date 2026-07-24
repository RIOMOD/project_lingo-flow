-- Seed sample vocabularies for practice tracking

MERGE INTO vocabularies (id, course_id, lesson_id, word, ipa, meaning, example_sentence, topic, level) KEY(id) VALUES
  (1, 1, 1, 'Greeting', '/ˈɡriːtɪŋ/', 'Lời chào', 'She said a warm greeting.', 'Daily Conversation', 'BEGINNER'),
  (2, 1, 1, 'Polite', '/pəˈlaɪt/', 'Lịch sự', 'He is very polite.', 'Daily Conversation', 'BEGINNER'),
  (3, 1, 1, 'Apologize', '/əˈpɒl.ə.dʒaɪz/', 'Xin lỗi', 'I apologize for being late.', 'Daily Conversation', 'BEGINNER'),
  (4, 1, 2, 'Resilient', '/rɪˈzɪl.jənt/', 'Phục hồi nhanh', 'She is a resilient girl.', 'Technology & Science', 'INTERMEDIATE'),
  (5, 1, 2, 'Meticulous', '/mɪˈtɪk.jə.ləs/', 'Tỉ mỉ', 'He is meticulous in his work.', 'Technology & Science', 'INTERMEDIATE');
