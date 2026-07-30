import { useEffect, useMemo, useState } from "react";
import AssessmentQuestion from "../../components/student/AssessmentQuestion";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getExercises, saveAnswer, startExercise, submitAttempt } from "../../services/assessmentService";

const DEFAULT_EXERCISES = [
  {
    id: 101,
    targetId: 101,
    type: "LISTENING",
    title: "🎧 Luyện Nghe: Hội Thoại Giao Tiếp Hàng Ngày",
    description: "Luyện nghe 5 hội thoại tiếng Anh thực tế về hỏi đường, đặt phòng khách sạn và gọi món.",
    durationMinutes: 10,
    maxAttempts: 5,
    questions: [
      {
        id: 1001,
        content: "Nghe đoạn hội thoại và chọn địa điểm được nhắc tới: 'Excuse me, could you tell me how to get to the nearest subway station?'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Trạm xe buýt (Bus stop)" },
          { id: "b", optionText: "Ga tàu điện ngầm (Subway station)", isCorrect: true },
          { id: "c", optionText: "Sân bay (Airport)" },
          { id: "d", optionText: "Bến xe khách (Coach station)" }
        ]
      },
      {
        id: 1002,
        content: "Người nói muốn làm gì trong câu sau: 'I'd like to book a double room for two nights, please.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Đặt phòng đôi 2 đêm", isCorrect: true },
          { id: "b", optionText: "Đặt phòng đơn 1 đêm" },
          { id: "c", optionText: "Hủy phòng khách sạn" },
          { id: "d", optionText: "Trả phòng sớm" }
        ]
      },
      {
        id: 1003,
        content: "Chọn đáp án trả lời lịch sự nhất cho câu hỏi: 'Could I have the check, please?'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Sure! Here is your bill, sir.", isCorrect: true },
          { id: "b", optionText: "No, I don't want it." },
          { id: "c", optionText: "You are welcome." },
          { id: "d", optionText: "Nice to meet you." }
        ]
      },
      {
        id: 1004,
        content: "Câu nào dưới đây thể hiện sự đồng ý khi bạn bè rủ đi ăn trưa?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "That sounds great! I'm starving.", isCorrect: true },
          { id: "b", optionText: "I'm sorry, I hate food." },
          { id: "c", optionText: "Where are you going tomorrow?" },
          { id: "d", optionText: "Never mind." }
        ]
      }
    ]
  },
  {
    id: 102,
    targetId: 102,
    type: "GRAMMAR",
    title: "📐 Luyện Ngữ Pháp: Các Thì Tiếng Anh Thông Dụng",
    description: "Thực hành chia động từ đúng cho thì Hiện tại đơn, Quá khứ đơn và Hiện tại hoàn thành.",
    durationMinutes: 15,
    maxAttempts: 10,
    questions: [
      {
        id: 1005,
        content: "Chọn dạng đúng của động từ: 'She _____ (walk) to the office every morning.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "walks", isCorrect: true },
          { id: "b", optionText: "is walking" },
          { id: "c", optionText: "walked" },
          { id: "d", optionText: "has walked" }
        ]
      },
      {
        id: 1006,
        content: "Chọn đáp án đúng cho thì Quá khứ đơn: 'They _____ (visit) Hoi An Ancient Town last summer.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "visited", isCorrect: true },
          { id: "b", optionText: "visits" },
          { id: "c", optionText: "have visited" },
          { id: "d", optionText: "visiting" }
        ]
      },
      {
        id: 1007,
        content: "Chọn đáp án đúng cho thì Hiện tại hoàn thành: 'I _____ (live) in Hanoi for five years.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "have lived", isCorrect: true },
          { id: "b", optionText: "lived" },
          { id: "c", optionText: "am living" },
          { id: "d", optionText: "live" }
        ]
      },
      {
        id: 1008,
        content: "Chọn từ nối thời gian phù hợp: 'Have you _____ tried Japanese sushi?'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "ever", isCorrect: true },
          { id: "b", optionText: "yet" },
          { id: "c", optionText: "ago" },
          { id: "d", optionText: "since" }
        ]
      }
    ]
  },
  {
    id: 103,
    targetId: 103,
    type: "VOCABULARY",
    title: "💼 Luyện Từ Vựng: Tiếng Anh Công Sở & Business",
    description: "Củng cố 15 thuật ngữ thương mại về hợp đồng, doanh thu, đàm phán và cuộc họp trực tuyến.",
    durationMinutes: 12,
    maxAttempts: 5,
    questions: [
      {
        id: 1009,
        content: "Từ nào đồng nghĩa với 'Revenue' trong doanh nghiệp?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Income / Earnings (Thu nhập / Doanh thu)", isCorrect: true },
          { id: "b", optionText: "Expense (Chi phí)" },
          { id: "c", optionText: "Debt (Nợ)" },
          { id: "d", optionText: "Tax (Thực thuế)" }
        ]
      },
      {
        id: 1010,
        content: "Chọn từ phù hợp hoàn thành câu: 'We need to sign the official _____ before launching the project.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "contract (Hợp đồng)", isCorrect: true },
          { id: "b", optionText: "vacation" },
          { id: "c", optionText: "compliment" },
          { id: "d", optionText: "hobby" }
        ]
      },
      {
        id: 1011,
        content: "Thuật ngữ 'Deadline' trong môi trường làm việc có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Hạn chót hoàn thành công việc", isCorrect: true },
          { id: "b", optionText: "Thời gian bắt đầu ca làm" },
          { id: "c", optionText: "Lịch nghỉ phép năm" },
          { id: "d", optionText: "Giờ giải lao giữa giờ" }
        ]
      },
      {
        id: 1012,
        content: "Từ 'Negotiation' dịch sang tiếng Việt có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Quá trình đàm phán / thương lượng", isCorrect: true },
          { id: "b", optionText: "Việc phỏng vấn xin việc" },
          { id: "c", optionText: "Sự hủy bỏ họp" },
          { id: "d", optionText: "Báo cáo tài chính" }
        ]
      }
    ]
  },
  {
    id: 104,
    targetId: 104,
    type: "READING",
    title: "📖 Luyện Đọc Hiểu: Xu Hướng Công Nghệ AI",
    description: "Đọc đoạn văn ngắn về Trí tuệ nhân tạo và trả lời các câu hỏi phân tích ý chính.",
    durationMinutes: 15,
    maxAttempts: 5,
    questions: [
      {
        id: 1013,
        content: "Đoạn văn: 'Artificial Intelligence (AI) is transforming global education by providing personalized learning experiences for students.' Ý chính của câu là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 33,
        options: [
          { id: "a", optionText: "AI đang thay đổi giáo dục bằng cá nhân hóa trải nghiệm học", isCorrect: true },
          { id: "b", optionText: "AI sẽ thay thế toàn bộ giáo viên" },
          { id: "c", optionText: "Học sinh không cần dùng máy tính" },
          { id: "d", optionText: "Công nghệ làm giảm chất lượng giáo dục" }
        ]
      },
      {
        id: 1014,
        content: "Từ 'Personalized' trong đoạn văn trên có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 33,
        options: [
          { id: "a", optionText: "Được tùy chỉnh phù hợp cá nhân", isCorrect: true },
          { id: "b", optionText: "Dành cho số đông" },
          { id: "c", optionText: "Mang tính bắt buộc" },
          { id: "d", optionText: "Rất đắt đỏ" }
        ]
      },
      {
        id: 1015,
        content: "Theo bài đọc, lợi ích cốt lõi của ứng dụng AI trong học tập là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 34,
        options: [
          { id: "a", optionText: "Giúp học viên nhận phản hồi và chữa lỗi tức thì", isCorrect: true },
          { id: "b", optionText: "Tăng chi phí mua sách vở" },
          { id: "c", optionText: "Kéo dài thời gian làm bài thi" },
          { id: "d", optionText: "Bắt buộc đi học trực tiếp" }
        ]
      }
    ]
  },
  {
    id: 105,
    targetId: 105,
    type: "PRONUNCIATION",
    title: "🗣️ Luyện Phát Âm & Trọng Âm Tiếng Anh",
    description: "Nhận biết trọng âm từ 2 và 3 âm tiết thông dụng trong giao tiếp hàng ngày.",
    durationMinutes: 10,
    maxAttempts: 10,
    questions: [
      {
        id: 1016,
        content: "Trọng âm của từ 'PRESENT' (Danh từ: Món quà) rơi vào âm tiết mấy?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Âm tiết 1 ('PRE-sent)", isCorrect: true },
          { id: "b", optionText: "Âm tiết 2 (pre-'SENT)" }
        ]
      },
      {
        id: 1017,
        content: "Trọng âm của từ 'PRESENT' (Động từ: Thuyết trình) rơi vào âm tiết mấy?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Âm tiết 2 (pre-'SENT)", isCorrect: true },
          { id: "b", optionText: "Âm tiết 1 ('PRE-sent)" }
        ]
      },
      {
        id: 1018,
        content: "Từ nào dưới đây có trọng âm rơi vào âm tiết thứ nhất?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "'ALGORITHM", isCorrect: true },
          { id: "b", optionText: "com'PUTER" },
          { id: "c", optionText: "cre'ATE" },
          { id: "d", optionText: "i'MAGINE" }
        ]
      },
      {
        id: 1019,
        content: "Chọn từ có cách phát âm đuôi '-ed' khác với các từ còn lại:",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "wanted (/id/)", isCorrect: true },
          { id: "b", optionText: "walked (/t/)" },
          { id: "c", optionText: "stopped (/t/)" },
          { id: "d", optionText: "looked (/t/)" }
        ]
      }
    ]
  },
  {
    id: 106,
    targetId: 106,
    type: "WRITING",
    title: "✉️ Luyện Viết Email Công Việc Trang Trọng",
    description: "Luyện chọn cấu trúc câu lịch sự trong email phản hồi khách hàng và xác nhận cuộc hẹn.",
    durationMinutes: 12,
    maxAttempts: 5,
    questions: [
      {
        id: 1020,
        content: "Câu mở đầu nào lịch sự nhất để mở đầu email cảm ơn đối tác?",
        questionType: "MULTIPLE_CHOICE",
        points: 33,
        options: [
          { id: "a", optionText: "Thank you for taking the time to meet with us yesterday.", isCorrect: true },
          { id: "b", optionText: "Hey guy, thanks for yesterday." },
          { id: "c", optionText: "Why didn't you write back?" },
          { id: "d", optionText: "Give me the document now." }
        ]
      },
      {
        id: 1021,
        content: "Chọn câu diễn đạt lịch sự khi gửi tệp đính kèm trong email:",
        questionType: "MULTIPLE_CHOICE",
        points: 33,
        options: [
          { id: "a", optionText: "Please find attached the project proposal for your review.", isCorrect: true },
          { id: "b", optionText: "Look at the file here." },
          { id: "c", optionText: "I send file, open it." },
          { id: "d", optionText: "Attachment inside." }
        ]
      },
      {
        id: 1022,
        content: "Câu kết thúc email nào trang trọng nhất trước khi ký tên?",
        questionType: "MULTIPLE_CHOICE",
        points: 34,
        options: [
          { id: "a", optionText: "Sincerely yours, / Best regards,", isCorrect: true },
          { id: "b", optionText: "Bye bye!" },
          { id: "c", optionText: "See ya later!" },
          { id: "d", optionText: "Ok thanks." }
        ]
      }
    ]
  },
  {
    id: 107,
    targetId: 107,
    type: "SPEAKING",
    title: "💬 Luyện Nói: IELTS Speaking Part 1 Topics",
    description: "Thực hành các mẫu câu trả lời nói tự nhiên về bản thân, sở thích và định hướng nghề nghiệp.",
    durationMinutes: 10,
    maxAttempts: 5,
    questions: [
      {
        id: 1023,
        content: "Khi giám khảo hỏi 'What do you do in your free time?', mẫu câu trả lời nào ghi điểm cao hơn?",
        questionType: "MULTIPLE_CHOICE",
        points: 33,
        options: [
          { id: "a", optionText: "In my leisure time, I am really passionate about reading technology books and practicing IELTS.", isCorrect: true },
          { id: "b", optionText: "I sleep." },
          { id: "c", optionText: "Nothing, I am lazy." },
          { id: "d", optionText: "Free time is good." }
        ]
      },
      {
        id: 1024,
        content: "Cấu trúc nối câu nào giúp bài nói tự nhiên hơn khi đưa ra lý do?",
        questionType: "MULTIPLE_CHOICE",
        points: 33,
        options: [
          { id: "a", optionText: "The main reason why I enjoy this is because...", isCorrect: true },
          { id: "b", optionText: "Because because because." },
          { id: "c", optionText: "No reason." },
          { id: "d", optionText: "I don't know." }
        ]
      },
      {
        id: 1025,
        content: "Từ nào đồng nghĩa nâng cao với 'Interesting' khi mô tả công việc?",
        questionType: "MULTIPLE_CHOICE",
        points: 34,
        options: [
          { id: "a", optionText: "Fascinating / Rewarding (Hấp dẫn / Đáng giá)", isCorrect: true },
          { id: "b", optionText: "Boring" },
          { id: "c", optionText: "Tiring" },
          { id: "d", optionText: "Useless" }
        ]
      }
    ]
  },
  {
    id: 108,
    targetId: 108,
    type: "GRAMMAR",
    title: "⚡ Luyện Ngữ Pháp: Câu Bị Động & Điều Kiện",
    description: "Luyện chuyển đổi câu sang dạng bị động Passive Voice và hoàn thiện câu điều kiện loại 1 & 2.",
    durationMinutes: 15,
    maxAttempts: 10,
    questions: [
      {
        id: 1026,
        content: "Chuyển câu sau sang câu Bị động: 'Alexander Graham Bell invented the telephone.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "The telephone was invented by Alexander Graham Bell.", isCorrect: true },
          { id: "b", optionText: "The telephone is invented by Alexander Graham Bell." },
          { id: "c", optionText: "Alexander Graham Bell was invented telephone." },
          { id: "d", optionText: "The telephone has been invent." }
        ]
      },
      {
        id: 1027,
        content: "Chọn dạng đúng cho câu điều kiện Loại 2: 'If I _____ (be) you, I would buy that online course.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "were", isCorrect: true },
          { id: "b", optionText: "am" },
          { id: "c", optionText: "will be" },
          { id: "d", optionText: "have been" }
        ]
      },
      {
        id: 1028,
        content: "Chọn dạng đúng cho câu điều kiện Loại 1: 'If it _____ (rain) tomorrow, we will stay at home.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "rains", isCorrect: true },
          { id: "b", optionText: "rained" },
          { id: "c", optionText: "will rain" },
          { id: "d", optionText: "would rain" }
        ]
      },
      {
        id: 1029,
        content: "Chọn câu bị động đúng: 'They are building a new school in our town.'",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "A new school is being built in our town.", isCorrect: true },
          { id: "b", optionText: "A new school was built in our town." },
          { id: "c", optionText: "A new school is builded in our town." },
          { id: "d", optionText: "A new school has built." }
        ]
      }
    ]
  },
  {
    id: 109,
    targetId: 109,
    type: "VOCABULARY",
    title: "✈️ Luyện Từ Vựng Du Lịch & Văn Hóa Quốc Tế",
    description: "Học từ vựng đặt vé máy bay, làm thủ tục hải quan và phương tiện di chuyển ở nước ngoài.",
    durationMinutes: 12,
    maxAttempts: 5,
    questions: [
      {
        id: 1030,
        content: "Từ 'Itinerary' trong chuyến du lịch có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Lịch trình chi tiết chuyến đi", isCorrect: true },
          { id: "b", optionText: "Thẻ hành lý ký gửi" },
          { id: "c", optionText: "Hộ chiếu cá nhân" },
          { id: "d", optionText: "Vé xem phim" }
        ]
      },
      {
        id: 1031,
        content: "Từ nào chỉ nơi bạn làm thủ tục nhận phòng tại sân bay hoặc khách sạn?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Check-in counter (Quầy làm thủ tục)", isCorrect: true },
          { id: "b", optionText: "Exit door" },
          { id: "c", optionText: "Restroom" },
          { id: "d", optionText: "Parking lot" }
        ]
      },
      {
        id: 1032,
        content: "Từ 'Souvenir' có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "Quà lưu niệm", isCorrect: true },
          { id: "b", optionText: "Vé xe buýt" },
          { id: "c", optionText: "Bản đồ du lịch" },
          { id: "d", optionText: "Khách sạn 5 sao" }
        ]
      },
      {
        id: 1033,
        content: "Chọn cụm từ đúng: 'Boarding _____' (Thẻ lên máy bay):",
        questionType: "MULTIPLE_CHOICE",
        points: 25,
        options: [
          { id: "a", optionText: "pass", isCorrect: true },
          { id: "b", optionText: "card" },
          { id: "c", optionText: "ticket" },
          { id: "d", optionText: "paper" }
        ]
      }
    ]
  },
  {
    id: 110,
    targetId: 110,
    type: "MIXED",
    title: "🌟 Luyện Tập Tổng Hợp Kỹ Năng CEFR B1",
    description: "Bài kiểm tra tổng hợp 4 kỹ năng Nghe, Đọc, Từ vựng và Ngữ pháp chuẩn hóa B1.",
    durationMinutes: 20,
    maxAttempts: 5,
    questions: [
      {
        id: 1034,
        content: "Chọn từ thích hợp điền vào chỗ trống: 'She has been working here _____ 2018.'",
        questionType: "MULTIPLE_CHOICE",
        points: 20,
        options: [
          { id: "a", optionText: "since", isCorrect: true },
          { id: "b", optionText: "for" },
          { id: "c", optionText: "ago" },
          { id: "d", optionText: "during" }
        ]
      },
      {
        id: 1035,
        content: "Từ nào KHÔNG thuộc nhóm từ chỉ phương tiện giao thông?",
        questionType: "MULTIPLE_CHOICE",
        points: 20,
        options: [
          { id: "a", optionText: "Algorithm (Thuật toán)", isCorrect: true },
          { id: "b", optionText: "Subway (Tàu điện ngầm)" },
          { id: "c", optionText: "Airplane (Máy bay)" },
          { id: "d", optionText: "Bicycle (Xe đạp)" }
        ]
      },
      {
        id: 1036,
        content: "Đoạn văn: 'If you practice English for 30 minutes every day, your vocabulary will improve significantly.' Kết luận nào đúng?",
        questionType: "MULTIPLE_CHOICE",
        points: 20,
        options: [
          { id: "a", optionText: "Luyện tập 30 phút mỗi ngày giúp tăng đáng kể từ vựng", isCorrect: true },
          { id: "b", optionText: "Học 30 phút là quá nhiều" },
          { id: "c", optionText: "Không nên học tiếng Anh hàng ngày" },
          { id: "d", optionText: "Từ vựng không thể tự cải thiện" }
        ]
      },
      {
        id: 1037,
        content: "Chọn câu bị động đúng: 'Shakespeare wrote Hamlet.'",
        questionType: "MULTIPLE_CHOICE",
        points: 20,
        options: [
          { id: "a", optionText: "Hamlet was written by Shakespeare.", isCorrect: true },
          { id: "b", optionText: "Hamlet is written by Shakespeare." },
          { id: "c", optionText: "Shakespeare was written by Hamlet." },
          { id: "d", optionText: "Hamlet has written by Shakespeare." }
        ]
      },
      {
        id: 1038,
        content: "Chọn câu trả lời lịch sự nhất khi được khen: 'Your presentation was outstanding!'",
        questionType: "MULTIPLE_CHOICE",
        points: 20,
        options: [
          { id: "a", optionText: "Thank you so much! I appreciate your kind words.", isCorrect: true },
          { id: "b", optionText: "I know I am the best." },
          { id: "c", optionText: "No, it was terrible." },
          { id: "d", optionText: "Don't talk to me." }
        ]
      }
    ]
  }
];

function answered(answer) {
  return Boolean(
    answer &&
      (answer.selectedOptionId ||
        (answer.selectedOptionIds && answer.selectedOptionIds !== "[]") ||
        answer.answerText?.trim() ||
        answer.answerJson)
  );
}

export default function ExercisePage() {
  const [items, setItems] = useState(DEFAULT_EXERCISES);
  const [attempt, setAttempt] = useState(null);
  const [current, setCurrent] = useState(0);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [localAnswers, setLocalAnswers] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    getExercises({ size: 20 })
      .then((data) => {
        if (data?.items && data.items.length > 0) {
          setItems(data.items);
        } else {
          setItems(DEFAULT_EXERCISES);
        }
      })
      .catch(() => setItems(DEFAULT_EXERCISES));
  }, []);

  useEffect(() => {
    const warn = (event) => {
      if (attempt?.status === "IN_PROGRESS") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [attempt?.status]);

  const answers = useMemo(() => {
    const map = new Map();
    (attempt?.answers ?? []).forEach((a) => {
      if (a.questionId) {
        map.set(a.questionId, a);
        map.set(String(a.questionId), a);
      }
    });
    Object.entries(localAnswers).forEach(([qId, val]) => {
      map.set(Number(qId), val);
      map.set(String(qId), val);
    });
    return map;
  }, [attempt?.answers, localAnswers]);

  const questions = attempt?.questions ?? [];
  const question = questions[current];
  const answeredCount = questions.filter((item) => answered(answers.get(item.id))).length;

  async function begin(id) {
    try {
      setError("");
      setCurrent(0);
      setLocalAnswers({});
      setShowConfirmModal(false);
      const apiAttempt = await startExercise(id);
      setAttempt(apiAttempt);
    } catch {
      // Local fallback attempt
      const targetEx = DEFAULT_EXERCISES.find((e) => e.id === id) || DEFAULT_EXERCISES[0];
      setAttempt({
        id: targetEx.id,
        targetId: targetEx.id,
        title: targetEx.title,
        description: targetEx.description,
        status: "IN_PROGRESS",
        questions: targetEx.questions,
        answers: []
      });
    }
  }

  async function answer(payload) {
    if (!question) return;
    setSavingId(question.id);
    try {
      if (attempt?.id && !String(attempt.id).startsWith("10")) {
        setAttempt(await saveAnswer(attempt.id, question.id, payload));
      } else {
        setLocalAnswers((prev) => ({
          ...prev,
          [question.id]: { questionId: question.id, ...payload }
        }));
      }
    } catch {
      setLocalAnswers((prev) => ({
        ...prev,
        [question.id]: { questionId: question.id, ...payload }
      }));
    } finally {
      setSavingId(null);
    }
  }

  function submit() {
    setShowConfirmModal(true);
  }

  async function executeSubmit() {
    setShowConfirmModal(false);
    try {
      if (attempt?.id && !String(attempt.id).startsWith("10")) {
        setAttempt(await submitAttempt(attempt.id));
      } else {
        // Calculate local score
        let correct = 0;
        questions.forEach((q) => {
          const userAns = localAnswers[q.id];
          const correctOpt = q.options?.find((o) => o.isCorrect);
          if (userAns && correctOpt && userAns.selectedOptionId === correctOpt.id) {
            correct++;
          }
        });
        const total = questions.length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 100;
        setAttempt((prev) => ({
          ...prev,
          status: "COMPLETED",
          score: correct * 25,
          totalPoints: total * 25,
          scorePercent: percent,
          correctAnswers: correct,
          incorrectAnswers: total - correct,
          passed: percent >= 50
        }));
      }
      setCurrent(0);
    } catch {
      let correct = 0;
      questions.forEach((q) => {
        const userAns = localAnswers[q.id];
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (userAns && correctOpt && userAns.selectedOptionId === correctOpt.id) {
          correct++;
        }
      });
      const total = questions.length;
      const percent = total > 0 ? Math.round((correct / total) * 100) : 100;
      setAttempt((prev) => ({
        ...prev,
        status: "COMPLETED",
        score: correct * 25,
        totalPoints: total * 25,
        scorePercent: percent,
        correctAnswers: correct,
        incorrectAnswers: total - correct,
        passed: percent >= 50
      }));
      setCurrent(0);
    }
  }

  if (!attempt)
    return (
      <div className="assessment-page">
        <section className="assessment-hero">
          <span className="page-badge">Luyện tập</span>
          <h2>Bài tập theo kỹ năng (10 Bộ bài tập chuẩn)</h2>
          <p>Luyện từng kỹ năng Nghe, Nói, Đọc, Viết, Phát âm và Ngữ pháp. Tiến độ được lưu tự động.</p>
        </section>

        {error && <p className="auth-error">{error}</p>}

        <section className="assessment-library">
          {items.map((item) => (
            <article key={item.id}>
              <span>{item.type || "EXERCISE"}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <small>
                {item.durationMinutes || 15} phút · {item.questions?.length || 4} câu hỏi
              </small>
              <button type="button" onClick={() => begin(item.id)}>
                Bắt đầu luyện tập
              </button>
            </article>
          ))}
        </section>
      </div>
    );

  const submitted = attempt.status !== "IN_PROGRESS";
  const percent = Number(attempt.scorePercent || 0);

  const [showExitModal, setShowExitModal] = useState(false);

  function handleBackClick() {
    if (attempt?.status === "IN_PROGRESS") {
      setShowExitModal(true);
    } else {
      setAttempt(null);
    }
  }

  function confirmExit() {
    setShowExitModal(false);
    setAttempt(null);
  }

  return (
    <div className="assessment-page focused-assessment">
      <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleBackClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "0.88rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
            transition: "all 0.15s ease"
          }}
        >
          ← Quay lại danh sách bài tập
        </button>
      </div>

      <header className="assessment-run-header">
        <div>
          <span className="page-badge">Bài tập</span>
          <h2>{attempt.title}</h2>
          <p>{attempt.description}</p>
        </div>
        <div className="assessment-run-progress">
          <strong>
            {submitted ? `${percent.toFixed(0)}%` : `${answeredCount}/${questions.length}`}
          </strong>
          <span>
            <i
              style={{
                width: `${
                  submitted
                    ? percent
                    : questions.length
                    ? (answeredCount / questions.length) * 100
                    : 0
                }%`
              }}
            />
          </span>
          <small>{submitted ? "Kết quả" : "Đã trả lời"}</small>
        </div>
      </header>

      {error && <p className="auth-error">{error}</p>}

      {submitted && (
        <section className={`assessment-result-banner ${attempt.passed ? "is-pass" : "is-fail"}`}>
          <span aria-hidden="true">{attempt.passed ? "✓" : "↻"}</span>
          <div>
            <h3>{attempt.passed ? "Hoàn thành tốt!" : "Cùng ôn lại nhé"}</h3>
            <p>
              Điểm {attempt.score}/{attempt.totalPoints} ({percent.toFixed(0)}%) · Đúng{" "}
              {attempt.correctAnswers} · Sai {attempt.incorrectAnswers}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={() => begin(attempt.targetId)}>
              Làm lại
            </button>
            <button
              type="button"
              onClick={() => setAttempt(null)}
              style={{
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                padding: "0.6rem 1rem",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Chọn bài tập khác
            </button>
          </div>
        </section>
      )}

      <div className="assessment-workspace">
        <main>
          <div className="assessment-counter">
            Câu {current + 1} / {questions.length}
          </div>
          {question && (
            <AssessmentQuestion
              question={question}
              answer={answers.get(question.id)}
              disabled={submitted}
              onAnswer={answer}
              saving={savingId === question.id}
            />
          )}
          <div className="assessment-nav">
            <button type="button" disabled={current === 0} onClick={() => setCurrent((v) => v - 1)}>
              Câu trước
            </button>
            {current < questions.length - 1 ? (
              <button type="button" onClick={() => setCurrent((v) => v + 1)}>
                Câu tiếp theo
              </button>
            ) : (
              !submitted && (
                <button className="primary" type="button" onClick={submit}>
                  Nộp bài
                </button>
              )
            )}
          </div>
        </main>
        <aside className="assessment-question-map">
          <h3>Danh sách câu</h3>
          <div>
            {questions.map((item, index) => (
              <button
                type="button"
                className={`${index === current ? "is-current" : ""} ${
                  answered(answers.get(item.id)) ? "is-answered" : ""
                }`}
                onClick={() => setCurrent(index)}
                key={item.id}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {!submitted && (
            <button className="assessment-submit" type="button" onClick={submit}>
              Nộp bài
            </button>
          )}
        </aside>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        title="Xác nhận nộp bài tập"
        icon="📝"
        message={
          questions.length - answeredCount > 0
            ? `Bạn vẫn còn ${questions.length - answeredCount} câu chưa hoàn thành. Bạn có chắc chắn muốn nộp bài tập ngay bây giờ?`
            : "Tuyệt vời! Bạn đã trả lời tất cả các câu hỏi. Bạn có muốn nộp bài tập để xem điểm số ngay bây giờ?"
        }
        confirmText="Nộp bài ngay"
        cancelText="Tiếp tục làm bài"
        variant="primary"
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmModal
        open={showExitModal}
        title="Rời khỏi bài tập?"
        icon="⚠️"
        message="Bạn đang làm dở bài tập này. Nếu quay lại danh sách bây giờ, tiến độ làm bài chưa nộp sẽ bị hủy. Bạn có chắc chắn muốn rời khỏi?"
        confirmText="Rời khỏi bài tập"
        cancelText="Tiếp tục làm bài"
        variant="warning"
        onConfirm={confirmExit}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
