-- Enrich all remaining lessons with rich formatted text, key takeaways, and realistic quizzes

UPDATE lessons SET
  content = 'Bài học phân biệt hai thì dễ gây nhầm lẫn nhất trong Tiếng Anh: Quá khứ đơn (Past Simple) và Hiện tại hoàn thành (Present Perfect).

📌 1. Thì Quá khứ đơn (Past Simple):
• Diễn tả hành động ĐÃ XẢY RA và ĐÃ KẾT THÚC hoàn toàn trong quá khứ.
• Có mốc thời gian xác định rõ ràng: yesterday, last week, in 2020, 2 days ago.
• Cấu trúc: S + V2/ed. (Ví dụ: I visited Da Nang in 2022.)

📌 2. Thì Hiện tại hoàn thành (Present Perfect):
• Diễn tả hành động đã xảy ra nhưng KẾT QUẢ hoặc ẢNH HƯỞNG vẫn kéo dài đến hiện tại.
• Diễn tả trải nghiệm cuộc sống (Experience) không có thời điểm cụ thể: ever, never, just, already, since, for.
• Cấu trúc: S + have/has + V3/ed. (Ví dụ: I have lived in Hanoi for 5 years.)

💡 Mẹo phân biệt nhanh:
- Nếu có mốc thời gian đã chấm dứt hoàn toàn (như last year, yesterday) -> Dùng Quá khứ đơn.
- Nếu diễn tả kinh nghiệm cá nhân hoặc hành động kéo dài từ quá khứ tới hiện tại -> Dùng Hiện tại hoàn thành.',
  checkpoint_question = 'Thì nào được sử dụng để diễn tả trải nghiệm cá nhân tính tới hiện tại?',
  checkpoint_answer = 'Hiện tại hoàn thành',
  checkpoint_explanation = 'Thì Hiện tại hoàn thành (Present Perfect) dùng để diễn tả kinh nghiệm hoặc trải nghiệm sống tính đến thời điểm hiện tại.'
WHERE id = 24 OR title LIKE '%Quá khứ đơn%';
