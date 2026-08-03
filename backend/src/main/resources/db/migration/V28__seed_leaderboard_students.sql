-- V28: Seed real student users and learning history to populate the leaderboard dynamically
-- Standard ANSI SQL compatible with PostgreSQL, H2, and MySQL

-- 1. Upsert new students (Clean existing test IDs first to prevent duplicate key errors)
DELETE FROM vocabulary_progress WHERE user_id IN (6, 7, 8, 9, 10, 11);
DELETE FROM learning_progress WHERE user_id IN (6, 7, 8, 9, 10, 11);
DELETE FROM user_profiles WHERE user_id IN (6, 7, 8, 9, 10, 11);
DELETE FROM users WHERE id IN (6, 7, 8, 9, 10, 11);

INSERT INTO users (id, role_id, email, password_hash, full_name, phone, avatar_url, status, email_verified_at, created_at, updated_at)
VALUES
  (6, 3, 'anh.tran@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Trần Thị Ánh', '0900000006', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 3, 'tuan.le@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Lê Minh Tuấn', '0900000007', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 3, 'dang.pham@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Phạm Hải Đăng', '0900000008', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 3, 'huong.vu@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Vũ Thị Hương', '0900000009', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 3, 'nam.hoang@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Hoàng Văn Nam', '0900000010', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 3, 'bao.nguyen@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Nguyễn Văn Bảo', '0900000011', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Insert profiles
INSERT INTO user_profiles (user_id, gender, english_level, learning_goal, bio, created_at, updated_at)
VALUES
  (6, 'FEMALE', 'ELEMENTARY', 'Giao tiếp hàng ngày trôi chảy', 'Rất vui được học cùng mọi người.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'MALE', 'INTERMEDIATE', 'Đạt IELTS 6.5 để du học', 'Quyết tâm cao độ!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 'MALE', 'ELEMENTARY', 'Cải thiện kỹ năng nghe nói', 'Học chậm mà chắc.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 'FEMALE', 'INTERMEDIATE', 'Đọc hiểu tài liệu chuyên ngành', 'Chúc mọi người học tốt!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 'MALE', 'ADVANCED', 'Thuyết trình trước đối tác nước ngoài', 'Bận rộn nhưng vẫn cố gắng học đều.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 'MALE', 'BEGINNER', 'Bắt đầu từ số 0', 'Cố gắng mỗi ngày.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Seed lesson progress records (100 XP per completed lesson)
INSERT INTO learning_progress (user_id, course_id, lesson_id, status, progress_percent, score, study_time_minutes, checkpoint_passed, preview_only, created_at, updated_at, completed_at, last_accessed_at)
VALUES
  (6, 1, 1, 'COMPLETED', 100.00, 100.00, 15, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 1, 2, 'COMPLETED', 100.00, 100.00, 20, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 1, 1, 'COMPLETED', 100.00, 100.00, 18, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 1, 2, 'COMPLETED', 100.00, 100.00, 22, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 1, 1, 'COMPLETED', 100.00, 100.00, 25, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 1, 1, 'COMPLETED', 100.00, 100.00, 12, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 1, 1, 'COMPLETED', 100.00, 100.00, 30, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 1, 1, 'COMPLETED', 100.00, 100.00, 15, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Seed Vocabulary progress (15 XP per correct vocabulary answer)
INSERT INTO vocabulary_progress (user_id, vocabulary_id, status, mastery_score, correct_count, incorrect_count, consecutive_correct, review_count, favorite, created_at, updated_at, reviewed_at)
VALUES
  (6, 1, 'MASTERED', 100.00, 35, 1, 5, 36, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 2, 'MASTERED', 100.00, 40, 2, 8, 42, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 3, 'MASTERED', 100.00, 25, 0, 12, 25, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 1, 'MASTERED', 100.00, 20, 0, 6, 20, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 2, 'MASTERED', 100.00, 30, 2, 4, 32, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 1, 'MASTERED', 100.00, 18, 1, 5, 19, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 2, 'MASTERED', 100.00, 22, 0, 10, 22, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 1, 'MASTERED', 100.00, 15, 0, 8, 15, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 2, 'MASTERED', 100.00, 12, 1, 4, 13, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 1, 'MASTERED', 100.00, 50, 4, 15, 54, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 2, 'MASTERED', 100.00, 45, 0, 20, 45, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 1, 'MASTERED', 100.00, 10, 0, 5, 10, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
