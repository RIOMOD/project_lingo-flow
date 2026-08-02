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
    description: "Luyện nghe 10 hội thoại tiếng Anh thực tế về hỏi đường, đặt phòng khách sạn, giao tiếp sân bay và mua sắm.",
    durationMinutes: 15,
    maxAttempts: 5,
    questions: [
      {
        id: 1001,
        content: "Nghe đoạn hội thoại và chọn địa điểm được nhắc tới: 'Excuse me, could you tell me how to get to the nearest subway station?'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Trạm xe buýt (Bus stop)" },
          { id: "b", optionText: "Ga tàu điện ngầm (Subway station)", isCorrect: true },
          { id: "c", optionText: "Sân bay (Airport)" },
          { id: "d", optionText: "Bến xe khách (Coach station)" }
        ]
      },
      {
        id: 1002,
        content: "Người nói muốn làm gì trong câu sau: 'I would like to book a double room for two nights, please.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
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
        points: 10,
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
        points: 10,
        options: [
          { id: "a", optionText: "That sounds great! I'm starving.", isCorrect: true },
          { id: "b", optionText: "I'm sorry, I hate food." },
          { id: "c", optionText: "Where are you going tomorrow?" },
          { id: "d", optionText: "Never mind." }
        ]
      },
      {
        id: 1005,
        content: "Thông báo 'Passengers for Flight VN123 please proceed to Gate 5' có ý nghĩa gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Hành khách chuyến bay VN123 di chuyển đến Cổng số 5", isCorrect: true },
          { id: "b", optionText: "Chuyến bay VN123 bị hủy" },
          { id: "c", optionText: "Hành khách lấy lại hành lý tại cổng 5" },
          { id: "d", optionText: "Chuyến bay hạ cánh chậm 5 tiếng" }
        ]
      },
      {
        id: 1006,
        content: "Khi người nói nhắc 'Mind the gap', họ đang cảnh báo điều gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Chú ý khoảng trống giữa tàu và sân ga", isCorrect: true },
          { id: "b", optionText: "Cẩn thận trộm cắp" },
          { id: "c", optionText: "Không được mang thức ăn" },
          { id: "d", optionText: "Vui lòng giữ trật tự" }
        ]
      },
      {
        id: 1007,
        content: "Đáp lại lời cảm ơn 'Thank you so much for your assistance!' thế nào là phù hợp nhất?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "You are very welcome! It was my pleasure.", isCorrect: true },
          { id: "b", optionText: "No, thanks." },
          { id: "c", optionText: "I don't care." },
          { id: "d", optionText: "Why are you thanking me?" }
        ]
      },
      {
        id: 1008,
        content: "Từ 'Boarding Pass' chỉ loại giấy tờ nào khi đi máy bay?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Thẻ lên máy bay", isCorrect: true },
          { id: "b", optionText: "Hộ chiếu cá nhân" },
          { id: "c", optionText: "Tờ khai y tế" },
          { id: "d", optionText: "Hóa đơn mua quà" }
        ]
      },
      {
        id: 1009,
        content: "Khi nhân viên cửa hàng hỏi 'How would you like to pay?', câu trả lời nào chuẩn nhất?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "By credit card, please.", isCorrect: true },
          { id: "b", optionText: "I like shopping very much." },
          { id: "c", optionText: "The price is too high." },
          { id: "d", optionText: "Yes, I am paying." }
        ]
      },
      {
        id: 1010,
        content: "Cụm từ 'Round-trip ticket' khi mua vé máy bay có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Vé khứ hồi (Cả lượt đi và lượt về)", isCorrect: true },
          { id: "b", optionText: "Vé một chiều" },
          { id: "c", optionText: "Vé xe buýt nội thành" },
          { id: "d", optionText: "Vé miễn phí" }
        ]
      }
    ]
  },
  {
    id: 102,
    targetId: 102,
    type: "GRAMMAR",
    title: "📐 Luyện Ngữ Pháp: Các Thì Tiếng Anh Thông Dụng",
    description: "Thực hành 10 câu chia động từ đúng cho thì Hiện tại đơn, Quá khứ đơn, Hiện tại tiếp diễn và Hiện tại hoàn thành.",
    durationMinutes: 15,
    maxAttempts: 10,
    questions: [
      {
        id: 1011,
        content: "Chọn dạng đúng của động từ: 'She _____ (walk) to the office every morning.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "walks", isCorrect: true },
          { id: "b", optionText: "is walking" },
          { id: "c", optionText: "walked" },
          { id: "d", optionText: "has walked" }
        ]
      },
      {
        id: 1012,
        content: "Chọn đáp án đúng cho thì Quá khứ đơn: 'They _____ (visit) Hoi An Ancient Town last summer.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "visited", isCorrect: true },
          { id: "b", optionText: "visits" },
          { id: "c", optionText: "have visited" },
          { id: "d", optionText: "visiting" }
        ]
      },
      {
        id: 1013,
        content: "Chọn đáp án đúng cho thì Hiện tại hoàn thành: 'I _____ (live) in Hanoi for five years.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "have lived", isCorrect: true },
          { id: "b", optionText: "lived" },
          { id: "c", optionText: "am living" },
          { id: "d", optionText: "live" }
        ]
      },
      {
        id: 1014,
        content: "Chọn từ nối thời gian phù hợp: 'Have you _____ tried Japanese sushi?'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "ever", isCorrect: true },
          { id: "b", optionText: "yet" },
          { id: "c", optionText: "ago" },
          { id: "d", optionText: "since" }
        ]
      },
      {
        id: 1015,
        content: "Chọn dạng động từ đúng ở thì Hiện tại tiếp diễn: 'Listen! Someone _____ (sing) in the garden.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "is singing", isCorrect: true },
          { id: "b", optionText: "sings" },
          { id: "c", optionText: "sang" },
          { id: "d", optionText: "has sung" }
        ]
      },
      {
        id: 1016,
        content: "Điền dạng đúng của động từ: 'By the time we arrived, the movie _____ (already / start).'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "had already started", isCorrect: true },
          { id: "b", optionText: "has started" },
          { id: "c", optionText: "starts" },
          { id: "d", optionText: "is starting" }
        ]
      },
      {
        id: 1017,
        content: "Chọn từ đúng điền vào câu: 'He has been working on this code _____ 8 AM.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "since", isCorrect: true },
          { id: "b", optionText: "for" },
          { id: "c", optionText: "in" },
          { id: "d", optionText: "during" }
        ]
      },
      {
        id: 1018,
        content: "Chọn dạng đúng của Tương lai đơn: 'I think it _____ (rain) tomorrow.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "will rain", isCorrect: true },
          { id: "b", optionText: "is raining" },
          { id: "c", optionText: "rained" },
          { id: "d", optionText: "has rained" }
        ]
      },
      {
        id: 1019,
        content: "Chọn trợ động từ phủ định phù hợp: 'He _____ like playing football.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "doesn't", isCorrect: true },
          { id: "b", optionText: "don't" },
          { id: "c", optionText: "isn't" },
          { id: "d", optionText: "hasn't" }
        ]
      },
      {
        id: 1020,
        content: "Hoàn thiện câu thì Quá khứ tiếp diễn: 'While I _____ (read) a book, the phone rang.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "was reading", isCorrect: true },
          { id: "b", optionText: "read" },
          { id: "c", optionText: "am reading" },
          { id: "d", optionText: "have read" }
        ]
      }
    ]
  },
  {
    id: 103,
    targetId: 103,
    type: "VOCABULARY",
    title: "💼 Luyện Từ Vựng: Tiếng Anh Công Sở & Business",
    description: "Củng cố 10 thuật ngữ thương mại về hợp đồng, doanh thu, đàm phán, ngân sách và báo cáo tài chính.",
    durationMinutes: 15,
    maxAttempts: 5,
    questions: [
      {
        id: 1021,
        content: "Từ nào đồng nghĩa với 'Revenue' trong doanh nghiệp?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Income / Earnings (Thu nhập / Doanh thu)", isCorrect: true },
          { id: "b", optionText: "Expense (Chi phí)" },
          { id: "c", optionText: "Debt (Nợ)" },
          { id: "d", optionText: "Tax (Thực thuế)" }
        ]
      },
      {
        id: 1022,
        content: "Chọn từ phù hợp hoàn thành câu: 'We need to sign the official _____ before launching the project.'",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "contract (Hợp đồng)", isCorrect: true },
          { id: "b", optionText: "vacation" },
          { id: "c", optionText: "compliment" },
          { id: "d", optionText: "hobby" }
        ]
      },
      {
        id: 1023,
        content: "Thuật ngữ 'Deadline' trong môi trường làm việc có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Hạn chót hoàn thành công việc", isCorrect: true },
          { id: "b", optionText: "Thời gian bắt đầu ca làm" },
          { id: "c", optionText: "Lịch nghỉ phép năm" },
          { id: "d", optionText: "Giờ giải lao giữa giờ" }
        ]
      },
      {
        id: 1024,
        content: "Từ 'Negotiation' dịch sang tiếng Việt có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Quá trình đàm phán / thương lượng", isCorrect: true },
          { id: "b", optionText: "Việc phỏng vấn xin việc" },
          { id: "c", optionText: "Sự hủy bỏ họp" },
          { id: "d", optionText: "Báo cáo tài chính" }
        ]
      },
      {
        id: 1025,
        content: "Từ 'Budget' chỉ khái niệm nào trong tài chính công ty?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Ngân sách tài chính được dự trù", isCorrect: true },
          { id: "b", optionText: "Tài khoản cá nhân" },
          { id: "c", optionText: "Hóa đơn tiền điện" },
          { id: "d", optionText: "Lương thưởng tháng 13" }
        ]
      },
      {
        id: 1026,
        content: "Cụm 'Minutes of the meeting' có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Biên bản ghi chép cuộc họp", isCorrect: true },
          { id: "b", optionText: "Số phút kéo dài cuộc họp" },
          { id: "c", optionText: "Đồng hồ treo tường" },
          { id: "d", optionText: "Danh sách khách mời" }
        ]
      },
      {
        id: 1027,
        content: "Từ 'Promotion' trong thăng tiến nghề nghiệp nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Thăng chức / Thăng tiến công việc", isCorrect: true },
          { id: "b", optionText: "Giảm lương" },
          { id: "c", optionText: "Thất nghiệp" },
          { id: "d", optionText: "Nghỉ ốm" }
        ]
      },
      {
        id: 1028,
        content: "Nghĩa của từ 'Colleague' là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Đồng nghiệp cùng cơ quan", isCorrect: true },
          { id: "b", optionText: "Trường đại học" },
          { id: "c", optionText: "Khách hàng cá nhân" },
          { id: "d", optionText: "Người phỏng vấn" }
        ]
      },
      {
        id: 1029,
        content: "Nghĩa của từ 'Proposal' trong môi trường kinh doanh là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Bản đề xuất / Dự án đề xuất", isCorrect: true },
          { id: "b", optionText: "Lời tỏ tình" },
          { id: "c", optionText: "Đơn xin nghỉ việc" },
          { id: "d", optionText: "Thẻ nhân viên" }
        ]
      },
      {
        id: 1030,
        content: "Từ nào mô tả việc 'Mở rộng thị trường' sang quốc tế?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Market Expansion", isCorrect: true },
          { id: "b", optionText: "Market Shrinkage" },
          { id: "c", optionText: "Product Cancellation" },
          { id: "d", optionText: "Bankruptcy" }
        ]
      }
    ]
  },
  {
    id: 104,
    targetId: 104,
    type: "READING",
    title: "📖 Luyện Đọc Hiểu: Xu Hướng Công Nghệ AI",
    description: "Đọc phân tích bài viết về Trí tuệ nhân tạo và hoàn thành 10 câu hỏi đọc hiểu chuyên sâu.",
    durationMinutes: 20,
    maxAttempts: 5,
    questions: [
      {
        id: 1031,
        content: "Đoạn văn: 'Artificial Intelligence (AI) is transforming global education by providing personalized learning experiences.' Ý chính của câu là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "AI đang thay đổi giáo dục bằng cá nhân hóa trải nghiệm học", isCorrect: true },
          { id: "b", optionText: "AI sẽ thay thế toàn bộ giáo viên" },
          { id: "c", optionText: "Học sinh không cần dùng máy tính" },
          { id: "d", optionText: "Công nghệ làm giảm chất lượng giáo dục" }
        ]
      },
      {
        id: 1032,
        content: "Từ 'Personalized' trong đoạn văn trên có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Được tùy chỉnh phù hợp nhu cầu cá nhân", isCorrect: true },
          { id: "b", optionText: "Dành cho số đông đại chúng" },
          { id: "c", optionText: "Mang tính bắt buộc" },
          { id: "d", optionText: "Rất đắt đỏ" }
        ]
      },
      {
        id: 1033,
        content: "Theo bài đọc, lợi ích cốt lõi của ứng dụng AI trong học tập là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Giúp học viên nhận phản hồi và chữa lỗi tức thì", isCorrect: true },
          { id: "b", optionText: "Tăng chi phí mua sách vở" },
          { id: "c", optionText: "Kéo dài thời gian làm bài thi" },
          { id: "d", optionText: "Bắt buộc đi học trực tiếp" }
        ]
      },
      {
        id: 1034,
        content: "Từ 'Automation' trong bối cảnh công nghệ có nghĩa là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Sự tự động hóa quy trình", isCorrect: true },
          { id: "b", optionText: "Thao tác thủ công bằng tay" },
          { id: "c", optionText: "Sự gián đoạn mạng" },
          { id: "d", optionText: "Tắt máy tính" }
        ]
      },
      {
        id: 1035,
        content: "Ý nào sau đây KHÔNG được nhắc tới trong bài đọc về AI?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "AI cấm con người sử dụng internet", isCorrect: true },
          { id: "b", optionText: "AI hỗ trợ xử lý dữ liệu lớn" },
          { id: "c", optionText: "AI nâng cao năng suất làm việc" },
          { id: "d", optionText: "AI ứng dụng trong y tế và giáo dục" }
        ]
      },
      {
        id: 1036,
        content: "Từ 'Efficiency' được hiểu là chỉ số nào?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Hiệu quả và năng suất", isCorrect: true },
          { id: "b", optionText: "Tốc độ chậm chạp" },
          { id: "c", optionText: "Lỗi phần mềm" },
          { id: "d", optionText: "Sự thiếu hụt nguồn lực" }
        ]
      },
      {
        id: 1037,
        content: "Kỹ thuật đọc lướt để lấy thông tin cụ thể (ngày tháng, tên riêng) gọi là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Scanning", isCorrect: true },
          { id: "b", optionText: "Skimming" },
          { id: "c", optionText: "Translating" },
          { id: "d", optionText: "Memorizing" }
        ]
      },
      {
        id: 1038,
        content: "Tác giả thể hiện thái độ như thế nào đối với sự phát triển của công nghệ mới?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Tích cực và đầy triển vọng (Optimistic)", isCorrect: true },
          { id: "b", optionText: "Phản đối gay gắt" },
          { id: "c", optionText: "Thờ ơ không quan tâm" },
          { id: "d", optionText: "Sợ hãi hoàn toàn" }
        ]
      },
      {
        id: 1039,
        content: "Từ 'Crucial' đồng nghĩa với từ nào sau đây?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Extremely important / Vital (Rất quan trọng)", isCorrect: true },
          { id: "b", optionText: "Unnecessary" },
          { id: "c", optionText: "Small" },
          { id: "d", optionText: "Easy" }
        ]
      },
      {
        id: 1040,
        content: "Kết luận chính của bài đọc hướng đến điều gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Con người cần học cách làm chủ và ứng dụng AI thông minh", isCorrect: true },
          { id: "b", optionText: "Hủy bỏ toàn bộ máy tính" },
          { id: "c", optionText: "Dừng phát triển công nghệ" },
          { id: "d", optionText: "Chỉ cho robot làm việc" }
        ]
      }
    ]
  },
  {
    id: 105,
    targetId: 105,
    type: "PRONUNCIATION",
    title: "🗣️ Luyện Phát Âm & Trọng Âm Tiếng Anh",
    description: "Nhận biết 10 quy tắc trọng âm từ và phân biệt âm đuôi -ed, -s/es chuẩn xác.",
    durationMinutes: 12,
    maxAttempts: 10,
    questions: [
      {
        id: 1041,
        content: "Trọng âm của từ 'PRESENT' (Danh từ: Món quà) rơi vào âm tiết mấy?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Âm tiết 1 ('PRE-sent)", isCorrect: true },
          { id: "b", optionText: "Âm tiết 2 (pre-'SENT)" }
        ]
      },
      {
        id: 1042,
        content: "Trọng âm của từ 'PRESENT' (Động từ: Thuyết trình) rơi vào âm tiết mấy?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "Âm tiết 2 (pre-'SENT)", isCorrect: true },
          { id: "b", optionText: "Âm tiết 1 ('PRE-sent)" }
        ]
      },
      {
        id: 1043,
        content: "Từ nào dưới đây có trọng âm rơi vào âm tiết thứ nhất?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "'ALGORITHM", isCorrect: true },
          { id: "b", optionText: "com'PUTER" },
          { id: "c", optionText: "cre'ATE" },
          { id: "d", optionText: "i'MAGINE" }
        ]
      },
      {
        id: 1044,
        content: "Chọn từ có cách phát âm đuôi '-ed' khác với các từ còn lại:",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "wanted (/id/)", isCorrect: true },
          { id: "b", optionText: "walked (/t/)" },
          { id: "c", optionText: "stopped (/t/)" },
          { id: "d", optionText: "looked (/t/)" }
        ]
      },
      {
        id: 1045,
        content: "Đuôi '-ed' trong từ 'decided' được phát âm là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "/id/", isCorrect: true },
          { id: "b", optionText: "/t/" },
          { id: "c", optionText: "/d/" },
          { id: "d", optionText: "không phát âm" }
        ]
      },
      {
        id: 1046,
        content: "Từ nào có âm 'th' phát âm hữu thanh (/ð/)?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "THIS (/ðis/)", isCorrect: true },
          { id: "b", optionText: "THANK (/θæŋk/)" },
          { id: "c", optionText: "THIN (/θin/)" },
          { id: "d", optionText: "THINK (/θiŋk/)" }
        ]
      },
      {
        id: 1047,
        content: "Từ nào có trọng âm rơi vào âm tiết thứ 3?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "engi'NEER", isCorrect: true },
          { id: "b", optionText: "'TEACHER" },
          { id: "c", optionText: "doc'TOR" },
          { id: "d", optionText: "'STUDENT" }
        ]
      },
      {
        id: 1048,
        content: "Đuôi '-s' trong từ 'cats' được phát âm là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "/s/", isCorrect: true },
          { id: "b", optionText: "/z/" },
          { id: "c", optionText: "/iz/" },
          { id: "d", optionText: "không âm" }
        ]
      },
      {
        id: 1049,
        content: "Đuôi '-es' trong từ 'watches' được phát âm là gì?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "/iz/", isCorrect: true },
          { id: "b", optionText: "/s/" },
          { id: "c", optionText: "/z/" },
          { id: "d", optionText: "/t/" }
        ]
      },
      {
        id: 1050,
        content: "Từ nào có âm câm (Silent letter)?",
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        options: [
          { id: "a", optionText: "HONEST (âm H câm)", isCorrect: true },
          { id: "b", optionText: "HOUSE" },
          { id: "c", optionText: "HAPPY" },
          { id: "d", optionText: "HOTEL" }
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
  const [showExitModal, setShowExitModal] = useState(false);
  const requestedExerciseId = new URLSearchParams(window.location.search).get("exerciseId");
  const requestedSkill = new URLSearchParams(window.location.search).get("skill");

  useEffect(() => {
    getExercises({ size: 20 })
      .then((data) => {
        if (data?.items && data.items.length > 0) {
          setItems(data.items);
        } else {
          setItems(DEFAULT_EXERCISES);
        }
        if (requestedExerciseId) begin(Number(requestedExerciseId));
      })
      .catch(() => {
        setItems(DEFAULT_EXERCISES);
        if (requestedExerciseId) begin(Number(requestedExerciseId));
      });
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

  const targetExFallback = DEFAULT_EXERCISES.find((e) => e.id === Number(attempt?.id || attempt?.targetId) || e.targetId === Number(attempt?.id || attempt?.targetId)) || DEFAULT_EXERCISES[0];
  const rawQuestions = attempt?.questions;
  const questions = (rawQuestions && rawQuestions.length > 0) ? rawQuestions : targetExFallback.questions;
  const question = questions[current];
  const answeredCount = questions.filter((item) => answered(answers.get(item.id))).length;
  const skillItems = requestedSkill
    ? items.filter((item) => (item.exerciseType || item.type) === requestedSkill)
    : items;
  const displayedItems = skillItems.length > 0 ? skillItems : items;

  async function begin(id) {
    try {
      setError("");
      setCurrent(0);
      setLocalAnswers({});
      setShowConfirmModal(false);
      const apiAttempt = await startExercise(id);
      const targetEx = DEFAULT_EXERCISES.find((e) => e.id === Number(id) || e.targetId === Number(id)) || DEFAULT_EXERCISES[0];
      const safeQuestions = (apiAttempt?.questions && apiAttempt.questions.length > 0) 
        ? apiAttempt.questions 
        : targetEx.questions;

      setAttempt({
        ...apiAttempt,
        questions: safeQuestions
      });
    } catch {
      // Local fallback attempt
      const targetEx = DEFAULT_EXERCISES.find((e) => e.id === Number(id) || e.targetId === Number(id)) || DEFAULT_EXERCISES[0];
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
          score: correct * 10,
          totalPoints: total * 10,
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
        score: correct * 10,
        totalPoints: total * 10,
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
          <h2>Bài tập theo kỹ năng (Mỗi bộ 10 câu hỏi chuẩn)</h2>
          <p>Luyện từng kỹ năng Nghe, Nói, Đọc, Viết, Phát âm và Ngữ pháp. Tiến độ được lưu tự động.</p>
        </section>

        {error && <p className="auth-error">{error}</p>}

        <section className="assessment-library">
          {displayedItems.map((item) => (
            <article key={item.id}>
              <span>{item.exerciseType || item.type || "EXERCISE"}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <small>
                {item.durationMinutes || 15} phút · {item.questions?.length || 10} câu hỏi
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

  function handleBackClick() {
    if (attempt?.status === "IN_PROGRESS") {
      setShowExitModal(true);
    } else {
      setAttempt(null);
    }
  }

  return (
    <div className="assessment-page focused-assessment" style={{ padding: "0.5rem 1rem" }}>
      <header 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          background: "#ffffff", 
          padding: "0.65rem 1.1rem", 
          borderRadius: "14px", 
          border: "1px solid #e2e8f0", 
          marginBottom: "0.75rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <button
            type="button"
            onClick={handleBackClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            ← Quay lại
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", background: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
              Bài tập
            </span>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              {attempt.title}
            </h2>
          </div>
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d9488", background: "#f0fdfa", border: "1px solid #ccfbf1", padding: "0.35rem 0.8rem", borderRadius: "8px" }}>
          {submitted ? "Đã nộp bài" : `Tiến độ: ${answeredCount}/${questions.length} câu`}
        </div>
      </header>

      {submitted && (
        <section className={`assessment-result-banner ${attempt.passed ? "is-pass" : "is-fail"}`} style={{ marginBottom: "0.75rem", padding: "0.75rem 1rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>{attempt.passed ? "🎉 Đạt kết quả xuất sắc!" : "⚠️ Bạn chưa đạt điểm yêu cầu"}</h3>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem" }}>
              Điểm: {attempt.score}/{attempt.totalPoints || 100} ({percent.toFixed(0)}%) · Đúng {attempt.correctAnswers}/{questions.length} câu.
            </p>
          </div>
          <button type="button" onClick={() => begin(attempt.targetId || attempt.id)} style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
            Làm lại bài tập
          </button>
        </section>
      )}

      <div className="assessment-workspace" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1rem", alignItems: "stretch", width: "100%", boxSizing: "border-box", height: "480px" }}>
        <main style={{ display: "flex", flexDirection: "column", gap: "0.5rem", height: "480px", boxSizing: "border-box", justifyContent: "space-between", padding: "1rem 1.25rem", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)", overflow: "hidden" }}>
          <div className="assessment-counter" style={{ marginBottom: "0.5rem", fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
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

          <div className="assessment-nav" style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", flexShrink: 0 }}>
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((v) => v - 1)}
              style={{ padding: "0.55rem 1.2rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", cursor: current === 0 ? "not-allowed" : "pointer" }}
            >
              Câu trước
            </button>

            {current < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrent((v) => v + 1)}
                style={{ padding: "0.55rem 1.4rem", borderRadius: "10px", border: "none", background: "#0d9488", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(13, 148, 136, 0.2)" }}
              >
                Câu tiếp theo
              </button>
            ) : (
              !submitted && (
                <button
                  type="button"
                  onClick={submit}
                  style={{ padding: "0.55rem 1.4rem", borderRadius: "10px", border: "none", background: "#0d9488", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(13, 148, 136, 0.2)" }}
                >
                  Nộp bài ngay
                </button>
              )
            )}
          </div>
        </main>

        <aside className="assessment-question-map" style={{ background: "#fff", padding: "1rem 1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", height: "480px", boxSizing: "border-box", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Danh sách {questions.length} câu hỏi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              {questions.map((item, index) => {
                const isCurrent = index === current;
                const isAns = answered(answers.get(item.id));
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setCurrent(index)}
                    style={{
                      height: "38px",
                      borderRadius: "8px",
                      border: isCurrent ? "2px solid #0d9488" : "1px solid #e2e8f0",
                      background: isCurrent ? "#ccfbf1" : isAns ? "#f0fdfa" : "#ffffff",
                      color: isCurrent ? "#0d9488" : "#334155",
                      fontWeight: isCurrent || isAns ? "700" : "500",
                      cursor: "pointer"
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {!submitted && (
            <button
              type="button"
              onClick={submit}
              style={{ width: "100%", marginTop: "1rem", padding: "0.65rem", borderRadius: "10px", background: "#0d9488", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              Nộp bài
            </button>
          )}
        </aside>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        title="Xác nhận nộp bài tập?"
        icon="📋"
        message={`Bạn đã hoàn thành ${answeredCount}/${questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
        confirmText="Nộp bài ngay"
        cancelText="Tiếp tục làm bài"
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmModal
        open={showExitModal}
        title="Rời khỏi bài tập?"
        icon="⚠️"
        message="Bài tập đang diễn ra. Nếu rời khỏi bây giờ, câu trả lời sẽ không được tính điểm."
        confirmText="Rời khỏi"
        cancelText="Ở lại làm bài"
        onConfirm={() => {
          setShowExitModal(false);
          setAttempt(null);
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
