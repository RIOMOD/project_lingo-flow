-- Enrich all lessons with comprehensive instructional text, key vocabulary, and realistic checkpoint quizzes

UPDATE lessons SET
  content = 'Bài học hướng dẫn bạn bí quyết xây dựng CV tiếng Anh chuẩn ATS giúp gây ấn tượng mạnh với nhà tuyển dụng quốc tế.

📌 Dạng từ quan trọng (Action Verbs):
• Spearheaded: Dẫn dắt, khởi xướng dự án (Ví dụ: Spearheaded a cross-functional team of 10 engineers)
• Spearheaded/Optimized: Tối ưu hóa quy trình (Ví dụ: Optimized system database latency by 45%)
• Delivered/Achieved: Hoàn thành & Đạt mục tiêu (Ví dụ: Delivered $1.2M in annual revenue growth)

💡 Mẹo viết CV chuẩn ATS:
1. Luôn dùng Động từ hành động (Action Verbs) ở đầu mỗi dòng gạch đầu dòng.
2. Đo lường kết quả bằng con số cụ thể (%. số tiền, số lượng người).
3. Sử dụng thì Quá khứ đơn cho các công việc trong quá khứ.',
  checkpoint_question = 'Động từ hành động nào mang nghĩa "khởi xướng, dẫn dắt dự án"?',
  checkpoint_answer = 'Spearheaded',
  checkpoint_explanation = '“Spearheaded” có nghĩa là khởi xướng, dẫn dắt một nhóm hoặc dự án từ giai đoạn đầu tiên.'
WHERE id = 23 OR title LIKE '%Action Verbs%';

UPDATE lessons SET
  content = 'Nắm vững bí quyết trả lời 20 câu hỏi phỏng vấn phổ biến nhất bằng Tiếng Anh theo công thức STAR (Situation - Task - Action - Result).

🎯 4 Bước Công Thức STAR:
1. Situation (Bối cảnh): Mô tả ngắn gọn tình huống bạn gặp phải.
2. Task (Nhiệm vụ): Mục tiêu hoặc thách thức cần phải giải quyết.
3. Action (Hành động): Các bước cụ thể BẠN đã thực hiện để vượt qua thách thức.
4. Result (Kết quả): Con số hoặc thành tựu đạt được sau khi hành động.

🗣️ Ví dụ trả lời câu hỏi "Tell me about a difficult situation at work":
"In my previous role as Project Lead (Situation), we faced a strict deadline with missing specs (Task). I reorganized sprint backlog and set up daily 15-min syncs (Action). As a result, we delivered 2 days ahead of schedule (Result)."',
  checkpoint_question = 'Chữ "R" trong mô hình trả lời phỏng vấn STAR viết tắt của từ nào?',
  checkpoint_answer = 'Result',
  checkpoint_explanation = 'R đại diện cho "Result" (Kết quả đạt được), yếu tố quan trọng nhất để chứng minh năng lực của bạn.'
WHERE id = 16 OR title LIKE '%STAR%' OR title LIKE '%phỏng vấn%';

UPDATE lessons SET
  content = 'Hướng dẫn chi tiết mẹo làm bài TOEIC Listening Part 1 (Mô tả hình ảnh người và vật).

🔍 3 Quy tắc bẫy Part 1 cần tránh:
1. Bẫy Từ đồng âm khác nghĩa (Homophones): Cùng âm đọc nhưng nghĩa hoàn toàn khác.
2. Bẫy Hành động đang diễn ra (Being + V3): Nếu trong ảnh KHÔNG có người đang thao tác, đáp án chứa "being" là SAI.
3. Bẫy Sai vị trí/đối tượng: Tên vật đúng nhưng hành động hoặc vị trí bị sai.',
  checkpoint_question = 'Từ nào xuất hiện trong đáp án mô tả tranh vật KHÔNG có người sẽ bị tính là sai?',
  checkpoint_answer = 'Being',
  checkpoint_explanation = 'Thì hiện tại tiếp diễn thể bị động "being" yêu cầu phải có người đang thực hiện hành động lên vật.'
WHERE id = 19 OR title LIKE '%TOEIC%';

UPDATE lessons SET
  content = 'Luyện tập phát âm chuẩn bảng ký tự phiên âm quốc tế IPA (International Phonetic Alphabet).

🗣️ Bí quyết luyện âm:
• Nguyên âm đơn & Nguyên âm đôi: Phân biệt độ dài hơi (/i:/ ngắn và /i/ dài).
• Trọng âm từ (Word Stress): Luôn nhấn mạnh vào âm tiết mang trọng âm.
• Ngữ điệu (Intonation): Trầm giọng ở cuối câu khẳng định, nâng giọng ở cuối câu hỏi Yes/No.',
  checkpoint_question = 'Ở cuối câu hỏi Yes/No trong tiếng Anh, ngữ điệu nên chuyển động thế nào?',
  checkpoint_answer = 'Nâng giọng',
  checkpoint_explanation = 'Câu hỏi Yes/No thường nâng ngữ điệu (rising intonation) ở cuối câu để thể hiện sự thắc mắc.'
WHERE title LIKE '%Phát âm%' OR title LIKE '%IPA%';
