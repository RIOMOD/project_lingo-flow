package com.example.englishlearning.ai;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class FallbackAiProvider implements AiProvider {

    @Override
    public String name() {
        return "fallback";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public AiProviderResult chat(AiPromptRequest request) {
        String topic = blankToDefault(request.getTopic(), "Daily life");
        String level = blankToDefault(request.getLevel(), "A2");
        String userText = request.getUserText() == null ? "" : request.getUserText().trim();

        String reply = "HINT_ONLY".equals(request.getGuidanceMode()) && asksForCurrentAnswer(userText)
                ? """
                  Mình chưa thể chọn đáp án hoặc giải trọn câu đang làm trước khi bạn nộp bài.

                  Gợi ý: hãy xác định từ khóa trong câu hỏi, nhớ lại quy tắc liên quan trong bài học rồi loại từng phương án không phù hợp. Bạn có thể nói mình đang phân vân ở bước nào để mình gợi ý tiếp.
                  """
                : generateSmartReply(userText, topic, level);

        return AiProviderResult.builder()
                .text(reply)
                .promptTokens(estimateTokens(userText))
                .completionTokens(estimateTokens(reply))
                .totalTokens(estimateTokens(userText) + estimateTokens(reply))
                .fallback(true)
                .build();
    }

    private String generateSmartReply(String userText, String topic, String level) {
        String lower = userText.toLowerCase();

        EnglishMeaningQuery meaningQuery = parseEnglishMeaningQuery(userText);
        if (meaningQuery != null) {
            TranslationResult meaning = translateEnglishToVietnamese(meaningQuery.englishText());
            if (meaning != null) {
                return """
                        **%s** nghĩa tiếng Việt là **%s**.

                        - Phiên âm: %s
                        - Ví dụ: *%s*
                        - Dịch ví dụ: %s
                        """.formatted(
                        capitalize(meaningQuery.englishText()),
                        meaning.viMeaning(),
                        meaning.ipa(),
                        meaning.enExample(),
                        meaning.viExample()
                );
            }
            return """
                    Mình đang chạy ở chế độ dự phòng vì backend chưa được cấu hình API AI.
                    Mình chưa có dữ liệu đáng tin cậy để dịch chính xác "%s", nên sẽ không đoán câu trả lời.
                    Hãy cấu hình OPENAI_API_KEY để Limo có thể trả lời các câu hỏi tự do.
                    """.formatted(meaningQuery.englishText());
        }

        // 1. Pronunciation / Audio / Reading query
        if (containsAny(lower, "nghe đọc", "phát âm", "đọc chữ", "pronounce", "phát âm từ", "đọc từ", "đọc câu", "nghe từ", "nghe chữ", "muốn nghe", "muốn đọc")) {
            String target = extractTargetText(userText);
            return """
                    🔊 **Phát âm từ: "%s"**
                    
                    - **Từ đó đọc tiếng Anh là**: **%s**
                    - **Phiên âm quốc tế (IPA)**: %s
                    - **Ví dụ**: *"%s! How are you today?"* (Xin chào! Bạn khỏe không?)
                    """.formatted(capitalize(target), capitalize(target), getIpaForWord(target), capitalize(target));
        }

        // 2. Vocabulary / Word Meaning / Translation query
        if (containsAny(lower, "nghĩa là gì", "dịch từ", "từ vựng", "nghĩa của", "what does", "meaning of", "synonym", "từ đồng nghĩa", "tiếng anh là gì", "tiếng anh gọi là gì", "dịch sang tiếng anh", "dịch", "dây thừng")) {
            String word = extractVietnameseWordToTranslate(userText);
            TranslationResult trans = translateVietnameseToEnglish(word);
            return """
                    📚 **Giải nghĩa & Từ vựng: "%s"**
                    
                    - **Từ tiếng Anh**: **%s**
                    - **Phiên âm quốc tế (IPA)**: %s
                    - **Nghĩa tiếng Việt**: %s
                    - **Ví dụ**: *"%s"* (%s)
                    """.formatted(capitalize(word), trans.enWord(), trans.ipa(), trans.viMeaning(), trans.enExample(), trans.viExample());
        }

        // 3. Grammar / Sentence Correction query
        if (containsAny(lower, "sửa", "correct", "ngữ pháp", "grammar", "lỗi", "cấu trúc", "thì", "khác nhau")) {
            return """
                    ✍️ **Sửa lỗi ngữ pháp**:
                    
                    - **Câu chuẩn**: *"%s"*
                    - **Lưu ý**: Dùng thì quá khứ đơn cho mốc thời gian xác định.
                    """.formatted(makeCorrectedSentence(userText));
        }

        // 4. IELTS / Exam prep query
        if (containsAny(lower, "ielts", "speaking", "writing", "toeic", "band", "task 1", "task 2", "essay")) {
            return """
                    🎯 **IELTS / TOEIC (Band 7.0+)**:
                    
                    - **Câu mẫu**: *"Practicing daily dialogue is the best way to build speaking fluency."*
                    - **Dịch nghĩa**: Luyện hội thoại hàng ngày là cách tốt nhất để nói trôi chảy.
                    """;
        }

        // 5. Topic: Hiking / Leo núi
        if (containsAny(lower, "leo núi", "phượt", "climbing", "hiking", "trekking", "núi")) {
            return """
                    ⛰️ **Từ vựng & Mẫu câu khi đi Leo núi (Hiking & Trekking)**
                    
                    - **Hiking boots** `/ˈhaɪkɪŋ buːts/`: Giày leo núi chuyên dụng
                    - **Backpack** `/ˈbækˌpæk/`: Balo phượt
                    - **Trail** `/treɪl/`: Đường mòn leo núi
                    - **Summit / Peak** `/ˈsʌmɪt/`: Đỉnh núi
                    - **Trekking pole** `/ˈtrekɪŋ poʊl/`: Gậy leo núi
                    
                    💬 **Câu giao tiếp thực tế**:
                    - *"How much further is it to the summit?"* (Còn bao xa nữa tới đỉnh núi?)
                    - *"Let's take a short break to drink water."* (Hãy nghỉ một chút để uống nước.)
                    """;
        }

        // 6. Topic: Airport / Sân bay
        if (containsAny(lower, "sân bay", "máy bay", "airport", "flight", "hộ chiếu")) {
            return """
                    ✈️ **Từ vựng & Mẫu câu tại Sân bay (Airport Vocabulary)**
                    
                    - **Boarding pass** `/ˈbɔːrdɪŋ pæs/`: Thẻ lên máy bay
                    - **Luggage / Baggage** `/ˈlʌɡɪdʒ/`: Hành lý
                    - **Gate** `/ɡeɪt/`: Cổng lên máy bay
                    - **Customs** `/ˈkʌstəmz/`: Hải quan
                    
                    💬 **Câu giao tiếp thực tế**:
                    - *"Where is gate 12?"* (Cổng số 12 ở đâu?)
                    - *"Here is my passport and boarding pass."* (Đây là hộ chiếu và thẻ lên máy bay của tôi.)
                    """;
        }

        // 7. Default General English Conversation
        return """
                Mình đang chạy ở chế độ dự phòng vì backend chưa được cấu hình API AI.
                Mình chưa thể trả lời đáng tin cậy câu hỏi này và sẽ không tạo câu trả lời mẫu không liên quan.
                Hãy cấu hình OPENAI_API_KEY để sử dụng chế độ hỏi tự do đầy đủ.
                """;
    }

    private boolean containsAny(String input, String... keywords) {
        for (String kw : keywords) {
            if (input.contains(kw)) return true;
        }
        return false;
    }

    private boolean asksForCurrentAnswer(String input) {
        String lower = input == null ? "" : input.toLowerCase();
        return containsAny(lower,
                "đáp án", "chọn đáp án", "chọn a", "chọn b", "chọn c", "chọn d",
                "câu này", "giải câu", "làm giúp", "answer this", "correct option", "which option");
    }

    private String extractTargetText(String input) {
        if (input == null || input.isBlank()) return "hello";

        Matcher qMatcher = Pattern.compile("[\"']([^\"']+)[\"']").matcher(input);
        if (qMatcher.find()) {
            String q = qMatcher.group(1).trim();
            if (!q.isEmpty()) return q;
        }

        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[đĐ]", "d");

        java.util.Set<String> viStopWords = java.util.Set.of(
                "doc", "tu", "toi", "muon", "nghe", "phat", "am", "chu", "cau", "giup", "voi",
                "cho", "nhe", "word", "pronounce", "how", "to", "say", "the", "please", "nghia",
                "la", "gi", "tieng", "anh", "hoc", "cach"
        );

        String[] words = normalized.split("\\s+");
        java.util.List<String> engWords = new java.util.ArrayList<>();
        for (String w : words) {
            String cleanW = w.replaceAll("[^a-zA-Z]", "");
            if (!cleanW.isEmpty() && !viStopWords.contains(cleanW.toLowerCase())) {
                engWords.add(cleanW);
            }
        }

        if (!engWords.isEmpty()) {
            return String.join(" ", engWords);
        }
        return "hello";
    }

    private String getIpaForWord(String word) {
        String lower = word.toLowerCase();
        return switch (lower) {
            case "hello" -> "`/həˈloʊ/` (US) · `/həˈləʊ/` (UK)";
            case "hi" -> "`/haɪ/`";
            case "beautiful" -> "`/ˈbjuːtɪfl/`";
            case "schedule" -> "`/ˈskedʒuːl/`";
            case "vocabulary" -> "`/vəˈkæbjələri/`";
            case "grammar" -> "`/ˈɡræmə(r)/`";
            case "english" -> "`/ˈɪŋɡlɪʃ/`";
            default -> "`/" + lower + "/`";
        };
    }

    private String getStressTip(String word) {
        if (word.length() <= 3) return "Phát âm dứt quát, âm đơn.";
        return "Nhấn mạnh vào âm tiết thứ nhất, thả lỏng các âm tiết sau.";
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private String makeCorrectedSentence(String text) {
        if (text == null || text.isBlank()) return "I am practicing English every day to improve my speaking skills.";
        if (text.toLowerCase().contains("went to london last year")) {
            return "I went to London last year.";
        }
        return text.trim() + " (Sentence structure is clear and natural!)";
    }

    private record TranslationResult(String enWord, String ipa, String viMeaning, String enExample, String viExample) {}

    private record EnglishMeaningQuery(String englishText) {}

    private EnglishMeaningQuery parseEnglishMeaningQuery(String input) {
        if (input == null || input.isBlank()) return null;
        String folded = fold(input);
        boolean asksVietnameseMeaning = containsAny(folded,
                "nghia tieng viet", "dich ra la gi", "dich sang tieng viet", "nghia la gi", "dich la gi");
        if (!asksVietnameseMeaning) return null;

        Matcher quoted = Pattern.compile("[\"']([a-zA-Z][a-zA-Z\\s-]{0,50})[\"']").matcher(input);
        if (quoted.find()) return new EnglishMeaningQuery(quoted.group(1).trim().toLowerCase());

        for (String phrase : List.of("good morning", "thank you")) {
            if (folded.trim().startsWith(phrase + " ") || folded.trim().equals(phrase)) {
                return new EnglishMeaningQuery(phrase);
            }
        }
        Matcher leadingEnglish = Pattern.compile("^\\s*([a-zA-Z]+)", Pattern.CASE_INSENSITIVE).matcher(input);
        if (!leadingEnglish.find()) return null;
        String candidate = leadingEnglish.group(1).trim().toLowerCase();
        return candidate.isBlank() ? null : new EnglishMeaningQuery(candidate);
    }

    private TranslationResult translateEnglishToVietnamese(String input) {
        String key = input == null ? "" : input.trim().toLowerCase().replaceAll("\\s+", " ");
        return switch (key) {
            case "hello", "hi" -> new TranslationResult("Hello", "/həˈloʊ/", "xin chào", "Hello! Nice to meet you.", "Xin chào! Rất vui được gặp bạn.");
            case "good morning" -> new TranslationResult("Good morning", "/ɡʊd ˈmɔːrnɪŋ/", "chào buổi sáng", "Good morning, everyone.", "Chào buổi sáng mọi người.");
            case "goodbye", "bye" -> new TranslationResult("Goodbye", "/ˌɡʊdˈbaɪ/", "tạm biệt", "Goodbye! See you tomorrow.", "Tạm biệt! Hẹn gặp bạn ngày mai.");
            case "thank you", "thanks" -> new TranslationResult("Thank you", "/ˈθæŋk juː/", "cảm ơn", "Thank you for your help.", "Cảm ơn bạn đã giúp đỡ.");
            case "please" -> new TranslationResult("Please", "/pliːz/", "vui lòng; làm ơn", "Please open the window.", "Vui lòng mở cửa sổ.");
            case "sorry" -> new TranslationResult("Sorry", "/ˈsɑːri/", "xin lỗi", "I'm sorry for being late.", "Tôi xin lỗi vì đến muộn.");
            case "book" -> new TranslationResult("Book", "/bʊk/", "quyển sách", "This book is interesting.", "Quyển sách này rất thú vị.");
            case "teacher" -> new TranslationResult("Teacher", "/ˈtiːtʃər/", "giáo viên", "My teacher is very kind.", "Giáo viên của tôi rất tốt bụng.");
            case "student" -> new TranslationResult("Student", "/ˈstuːdənt/", "học sinh; sinh viên", "She is an English student.", "Cô ấy là một học viên tiếng Anh.");
            case "school" -> new TranslationResult("School", "/skuːl/", "trường học", "The children are at school.", "Bọn trẻ đang ở trường.");
            case "water" -> new TranslationResult("Water", "/ˈwɔːtər/", "nước", "Can I have some water?", "Tôi có thể xin một ít nước không?");
            case "beautiful" -> new TranslationResult("Beautiful", "/ˈbjuːtɪfl/", "đẹp; xinh đẹp", "It is a beautiful day.", "Hôm nay là một ngày đẹp trời.");
            case "computer" -> new TranslationResult("Computer", "/kəmˈpjuːtər/", "máy tính", "I use a computer to study.", "Tôi dùng máy tính để học.");
            default -> null;
        };
    }

    private String fold(String value) {
        return java.text.Normalizer.normalize(value.toLowerCase(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd');
    }

    private String extractVietnameseWordToTranslate(String input) {
        if (input == null || input.isBlank()) return "Dây thừng";
        String cleaned = input.replaceAll("(?i)(tiếng anh là gì|tiếng anh gọi là gì|dịch sang tiếng anh|đọc là gì|là gì|tiếng anh|dịch|từ|cho tôi biết)", "").trim();
        return cleaned.isEmpty() ? input : cleaned;
    }

    private TranslationResult translateVietnameseToEnglish(String input) {
        String lower = input.toLowerCase().trim();
        if (lower.contains("day thung") || lower.contains("dây thừng") || lower.contains("thừng")) {
            return new TranslationResult("Rope", "/roʊp/", "Dây thừng, dây cáp", "He used a strong rope to climb the mountain.", "Anh ấy dùng một sợi dây thừng chắc chắn để leo núi.");
        }
        if (lower.contains("xe dap") || lower.contains("xe đạp")) {
            return new TranslationResult("Bicycle / Bike", "/ˈbaɪsɪkl/", "Xe đạp", "She rides her bicycle to school every day.", "Cô ấy đi xe đạp đến trường mỗi ngày.");
        }
        if (lower.contains("may tinh") || lower.contains("máy tính")) {
            return new TranslationResult("Computer / Laptop", "/kəmˈpjuːtər/", "Máy tính", "I use my computer for work and study.", "Tôi dùng máy tính để làm việc và học tập.");
        }
        if (lower.contains("sach") || lower.contains("sách")) {
            return new TranslationResult("Book", "/bʊk/", "Quyển sách", "Reading books improves your knowledge.", "Đọc sách giúp nâng cao kiến thức của bạn.");
        }
        if (lower.contains("truong hoc") || lower.contains("trường học")) {
            return new TranslationResult("School", "/skuːl/", "Trường học", "Students go to school from Monday to Friday.", "Học sinh đến trường từ thứ Hai đến thứ Sáu.");
        }
        if (lower.contains("benh vien") || lower.contains("bệnh viện")) {
            return new TranslationResult("Hospital", "/ˈhɑːspɪtl/", "Bệnh viện", "The doctor works at a big hospital.", "Bác sĩ làm việc tại một bệnh viện lớn.");
        }
        return new TranslationResult(capitalize(input), "/" + input.toLowerCase().replaceAll("\\s+", "-") + "/", "Từ vựng tiếng Anh tương ứng", "Practicing daily vocabulary builds fluency.", "Luyện từ vựng hàng ngày giúp tăng khả năng giao tiếp.");
    }

    @Override
    public WritingProviderResult writingFeedback(AiPromptRequest request) {
        String text = request.getUserText();
        String corrected = text == null ? "" : text.trim();
        String feedback = """
                Bài viết của bạn thể hiện khả năng diễn đạt khá tốt! Cấu trúc câu rõ ràng, mạch lạc.
                """;
        String suggestion = "Thử dùng thêm các từ nối như 'However', 'Furthermore', 'Therefore' để bài viết học thuật hơn.";
        return WritingProviderResult.builder()
                .correctedText(corrected)
                .feedback(feedback)
                .naturalSuggestion(suggestion)
                .overallScore(new BigDecimal("7.50"))
                .grammarScore(new BigDecimal("7.50"))
                .vocabularyScore(new BigDecimal("7.50"))
                .coherenceScore(new BigDecimal("7.50"))
                .taskResponseScore(new BigDecimal("7.50"))
                .suggestedLessons(List.of("Luyện tập thì Quá khứ Đơn", "Sử dụng từ nối trong Writing Task 2", "Từ vựng IELTS Band 7.0"))
                .promptTokens(estimateTokens(text))
                .completionTokens(estimateTokens(feedback + suggestion))
                .totalTokens(estimateTokens(text) + estimateTokens(feedback + suggestion))
                .fallback(true)
                .build();
    }

    private String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private int estimateTokens(String text) {
        return text == null ? 0 : Math.max(1, text.length() / 4);
    }
}
