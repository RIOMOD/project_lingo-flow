-- Schema for a fresh MySQL 8 database.

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_roles_code UNIQUE (code)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  avatar_url VARCHAR(500) NULL,
  status ENUM('ACTIVE','INACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
  email_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE user_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  date_of_birth DATE NULL,
  gender ENUM('MALE','FEMALE','OTHER') NULL,
  english_level ENUM('BEGINNER','ELEMENTARY','INTERMEDIATE','ADVANCED') NULL,
  learning_goal VARCHAR(255) NULL,
  bio TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_user_profiles_user UNIQUE (user_id),
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_refresh_tokens_hash UNIQUE (token_hash),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_password_reset_tokens_hash UNIQUE (token_hash),
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE course_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description VARCHAR(255) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_course_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

CREATE TABLE courses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NULL,
  teacher_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  short_description VARCHAR(500) NULL,
  description TEXT NULL,
  thumbnail_url VARCHAR(500) NULL,
  level ENUM('BEGINNER','ELEMENTARY','INTERMEDIATE','ADVANCED') NOT NULL,
  course_type ENUM('FREE','PAID') NOT NULL DEFAULT 'FREE',
  original_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(12,2) NULL,
  sale_start_at DATETIME NULL,
  sale_end_at DATETIME NULL,
  status ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','PUBLISHED','HIDDEN','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_courses_slug UNIQUE (slug),
  CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES course_categories(id),
  CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id),
  CONSTRAINT ck_courses_price CHECK (original_price >= 0 AND (sale_price IS NULL OR sale_price >= 0))
) ENGINE=InnoDB;

CREATE TABLE chapters (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  position INT NOT NULL,
  status ENUM('DRAFT','PUBLISHED','HIDDEN') NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_chapters_course_position UNIQUE (course_id, position),
  CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE lessons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chapter_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  lesson_type ENUM('VIDEO','AUDIO','TEXT','MIXED') NOT NULL DEFAULT 'TEXT',
  content LONGTEXT NULL,
  audio_url VARCHAR(500) NULL,
  video_url VARCHAR(500) NULL,
  position INT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('DRAFT','PUBLISHED','HIDDEN') NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_lessons_chapter_position UNIQUE (chapter_id, position),
  CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  CONSTRAINT ck_lessons_duration CHECK (duration_minutes >= 0)
) ENGINE=InnoDB;

CREATE TABLE lesson_contents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lesson_id BIGINT UNSIGNED NOT NULL,
  content_type ENUM('TEXT','IMAGE','AUDIO','VIDEO','FILE') NOT NULL,
  title VARCHAR(200) NULL,
  body LONGTEXT NULL,
  resource_url VARCHAR(500) NULL,
  position INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_lesson_contents_lesson_position UNIQUE (lesson_id, position),
  CONSTRAINT fk_lesson_contents_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
) ENGINE=InnoDB;

CREATE TABLE course_enrollments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  status ENUM('ACTIVE','COMPLETED','CANCELED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_course_enrollments_user_course UNIQUE (user_id, course_id),
  CONSTRAINT fk_course_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_course_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE course_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_course_reviews_user_course UNIQUE (user_id, course_id),
  CONSTRAINT fk_course_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_course_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT ck_course_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE course_review_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_review_history_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_course_review_history_admin FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE TABLE vocabularies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NULL,
  word VARCHAR(120) NOT NULL,
  ipa VARCHAR(120) NULL,
  meaning VARCHAR(500) NOT NULL,
  part_of_speech ENUM('NOUN','VERB','ADJECTIVE','ADVERB','PREPOSITION','CONJUNCTION','PRONOUN','PHRASE','IDIOM','OTHER') NOT NULL DEFAULT 'OTHER',
  example_sentence VARCHAR(500) NULL,
  example_meaning VARCHAR(500) NULL,
  audio_url VARCHAR(500) NULL,
  image_url VARCHAR(500) NULL,
  level ENUM('BEGINNER','ELEMENTARY','INTERMEDIATE','ADVANCED') NOT NULL DEFAULT 'BEGINNER',
  topic VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_vocabularies_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_vocabularies_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
) ENGINE=InnoDB;

CREATE TABLE grammar_topics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  formula TEXT NULL,
  usage_text TEXT NULL,
  example TEXT NULL,
  note TEXT NULL,
  level ENUM('BEGINNER','ELEMENTARY','INTERMEDIATE','ADVANCED') NOT NULL DEFAULT 'BEGINNER',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_grammar_topics_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_grammar_topics_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
) ENGINE=InnoDB;

CREATE TABLE exercises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  exercise_type ENUM('VOCABULARY','GRAMMAR','LISTENING','READING','WRITING','MIXED') NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  status ENUM('DRAFT','PUBLISHED','HIDDEN') NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_exercises_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_exercises_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
) ENGINE=InnoDB;

CREATE TABLE questions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id BIGINT UNSIGNED NULL,
  exercise_id BIGINT UNSIGNED NULL,
  question_type ENUM('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','FILL_IN_THE_BLANK','SENTENCE_ORDERING','MATCHING','LISTENING_MULTIPLE_CHOICE','WRITING') NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT NULL,
  points DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  correct_answer TEXT NULL,
  position INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_questions_owner FOREIGN KEY (owner_user_id) REFERENCES users(id),
  CONSTRAINT fk_questions_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id),
  CONSTRAINT ck_questions_points CHECK (points >= 0)
) ENGINE=InnoDB;

CREATE TABLE answer_options (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT UNSIGNED NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  position INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_answer_options_question_position UNIQUE (question_id, position),
  CONSTRAINT fk_answer_options_question FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB;

CREATE TABLE tests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  max_attempts INT NOT NULL DEFAULT 1,
  pass_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  status ENUM('DRAFT','PUBLISHED','HIDDEN') NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_tests_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE test_questions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  test_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  position INT NOT NULL,
  points DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  CONSTRAINT uk_test_questions_test_question UNIQUE (test_id, question_id),
  CONSTRAINT uk_test_questions_test_position UNIQUE (test_id, position),
  CONSTRAINT fk_test_questions_test FOREIGN KEY (test_id) REFERENCES tests(id),
  CONSTRAINT fk_test_questions_question FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB;

CREATE TABLE test_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  test_id BIGINT UNSIGNED NULL,
  exercise_id BIGINT UNSIGNED NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at DATETIME NULL,
  submitted_at DATETIME NULL,
  score DECIMAL(6,2) NULL,
  status ENUM('IN_PROGRESS','SUBMITTED','GRADED') NOT NULL DEFAULT 'IN_PROGRESS',
  CONSTRAINT fk_test_attempts_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_test_attempts_test FOREIGN KEY (test_id) REFERENCES tests(id),
  CONSTRAINT fk_test_attempts_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id),
  CONSTRAINT ck_test_attempts_target CHECK (
    (test_id IS NOT NULL AND exercise_id IS NULL)
    OR (test_id IS NULL AND exercise_id IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE TABLE user_answers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attempt_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  selected_option_id BIGINT UNSIGNED NULL,
  selected_option_ids JSON NULL,
  answer_text TEXT NULL,
  answer_json JSON NULL,
  is_correct BOOLEAN NULL,
  points_earned DECIMAL(5,2) NULL,
  answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_user_answers_attempt_question UNIQUE (attempt_id, question_id),
  CONSTRAINT fk_user_answers_attempt FOREIGN KEY (attempt_id) REFERENCES test_attempts(id),
  CONSTRAINT fk_user_answers_question FOREIGN KEY (question_id) REFERENCES questions(id),
  CONSTRAINT fk_user_answers_option FOREIGN KEY (selected_option_id) REFERENCES answer_options(id)
) ENGINE=InnoDB;

CREATE TABLE learning_progress (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NOT NULL,
  status ENUM('NOT_STARTED','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'NOT_STARTED',
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  score DECIMAL(6,2) NULL,
  study_time_minutes INT NOT NULL DEFAULT 0,
  study_time_seconds INT NOT NULL DEFAULT 0,
  media_position_seconds DECIMAL(10,2) NOT NULL DEFAULT 0,
  media_duration_seconds DECIMAL(10,2) NOT NULL DEFAULT 0,
  content_progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  checkpoint_score DECIMAL(5,2) NULL,
  checkpoint_passed BOOLEAN NOT NULL DEFAULT FALSE,
  checkpoint_attempts INT NOT NULL DEFAULT 0,
  preview_only BOOLEAN NOT NULL DEFAULT FALSE,
  started_at DATETIME NULL,
  last_accessed_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_learning_progress_user_lesson UNIQUE (user_id, lesson_id),
  CONSTRAINT fk_learning_progress_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_learning_progress_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_learning_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  CONSTRAINT ck_learning_progress_percent CHECK (progress_percent BETWEEN 0 AND 100),
  CONSTRAINT ck_learning_content_progress CHECK (content_progress_percent BETWEEN 0 AND 100),
  CONSTRAINT ck_learning_media_position CHECK (media_position_seconds >= 0),
  CONSTRAINT ck_learning_study_seconds CHECK (study_time_seconds >= 0)
) ENGINE=InnoDB;

CREATE TABLE vocabulary_progress (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  vocabulary_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  mastery_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  correct_count INT NOT NULL DEFAULT 0,
  incorrect_count INT NOT NULL DEFAULT 0,
  consecutive_correct INT NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  average_response_time BIGINT NULL DEFAULT 0,
  mastery_level TINYINT NOT NULL DEFAULT 0,
  remembered BOOLEAN NOT NULL DEFAULT FALSE,
  difficult BOOLEAN NOT NULL DEFAULT FALSE,
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_at DATETIME NULL,
  next_review_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_vocabulary_progress_user_vocab UNIQUE (user_id, vocabulary_id),
  CONSTRAINT fk_vocabulary_progress_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_vocabulary_progress_vocab FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id),
  CONSTRAINT ck_vocabulary_progress_mastery CHECK (mastery_level BETWEEN 0 AND 5)
) ENGINE=InnoDB;

CREATE TABLE vocabulary_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  topic_name VARCHAR(255) NULL,
  session_type VARCHAR(30) NOT NULL DEFAULT 'LEARNING',
  status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
  words_to_learn INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  incorrect_answers INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_vocabulary_sessions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT ck_vocabulary_sessions_counts CHECK (
    words_to_learn >= 0
    AND correct_answers >= 0
    AND incorrect_answers >= 0
    AND xp_earned >= 0
  )
) ENGINE=InnoDB;

CREATE TABLE vocabulary_session_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  vocabulary_id BIGINT UNSIGNED NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  incorrect_attempts INT NOT NULL DEFAULT 0,
  CONSTRAINT uk_vocabulary_session_items_session_vocab UNIQUE (session_id, vocabulary_id),
  CONSTRAINT fk_vocabulary_session_items_session FOREIGN KEY (session_id) REFERENCES vocabulary_sessions(id),
  CONSTRAINT fk_vocabulary_session_items_vocab FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id),
  CONSTRAINT ck_vocabulary_session_items_attempts CHECK (incorrect_attempts >= 0)
) ENGINE=InnoDB;

CREATE TABLE vocabulary_topic_progress (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  topic_name VARCHAR(255) NOT NULL,
  total_words INT NOT NULL DEFAULT 0,
  mastered_words INT NOT NULL DEFAULT 0,
  unlocked_session_index INT NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_vocabulary_topic_progress_user_topic UNIQUE (user_id, topic_name),
  CONSTRAINT fk_vocabulary_topic_progress_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT ck_vocabulary_topic_progress_counts CHECK (
    total_words >= 0
    AND mastered_words >= 0
    AND mastered_words <= total_words
    AND unlocked_session_index >= 1
  )
) ENGINE=InnoDB;

CREATE TABLE study_schedules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  reminder_at DATETIME NULL,
  status ENUM('PLANNED','DONE','CANCELED') NOT NULL DEFAULT 'PLANNED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_study_schedules_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_study_schedules_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE ai_conversations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NULL,
  conversation_type ENUM('CHATBOT','WRITING_ASSISTANT') NOT NULL DEFAULT 'CHATBOT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_ai_conversations_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE ai_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender ENUM('USER','AI','SYSTEM') NOT NULL,
  message LONGTEXT NOT NULL,
  token_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_messages_conversation FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id)
) ENGINE=InnoDB;

CREATE TABLE writing_submissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NULL,
  original_text LONGTEXT NOT NULL,
  corrected_text LONGTEXT NULL,
  feedback LONGTEXT NULL,
  score DECIMAL(5,2) NULL,
  grammar_score DECIMAL(5,2) NULL,
  vocabulary_score DECIMAL(5,2) NULL,
  coherence_score DECIMAL(5,2) NULL,
  task_response_score DECIMAL(5,2) NULL,
  natural_suggestion LONGTEXT NULL,
  suggested_lessons LONGTEXT NULL,
  status ENUM('PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_writing_submissions_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE ai_usage_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  feature VARCHAR(80) NOT NULL,
  provider VARCHAR(80) NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(12,6) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_usage_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE coupons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(150) NOT NULL,
  discount_type ENUM('PERCENT','FIXED') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  max_discount_amount DECIMAL(12,2) NULL,
  min_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  status ENUM('ACTIVE','INACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT uk_coupons_code UNIQUE (code),
  CONSTRAINT ck_coupons_discount CHECK (discount_value >= 0)
) ENGINE=InnoDB;

CREATE TABLE coupon_courses (
  coupon_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (coupon_id, course_id),
  CONSTRAINT fk_coupon_courses_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT fk_coupon_courses_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE carts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  coupon_id BIGINT UNSIGNED NULL,
  status ENUM('ACTIVE','CHECKED_OUT','ABANDONED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_carts_user UNIQUE (user_id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_carts_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_cart_items_cart_course UNIQUE (cart_id, course_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id),
  CONSTRAINT fk_cart_items_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  coupon_id BIGINT UNSIGNED NULL,
  order_code VARCHAR(80) NOT NULL,
  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PENDING_PAYMENT','PAID','CANCELED','REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  note VARCHAR(500) NULL,
  paid_at DATETIME NULL,
  canceled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_orders_code UNIQUE (order_code),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT ck_orders_amount CHECK (subtotal_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  course_title_snapshot VARCHAR(200) NOT NULL,
  course_slug_snapshot VARCHAR(220) NOT NULL,
  teacher_id_snapshot BIGINT UNSIGNED NOT NULL,
  original_price_snapshot DECIMAL(12,2) NOT NULL DEFAULT 0,
  sale_price_snapshot DECIMAL(12,2) NULL,
  final_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_order_items_order_course UNIQUE (order_id, course_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  provider ENUM('MOCK','VNPAY') NOT NULL DEFAULT 'MOCK',
  payment_code VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('INITIATED','SUCCESS','FAILED','CANCELED') NOT NULL DEFAULT 'INITIATED',
  payment_url VARCHAR(1000) NULL,
  paid_at DATETIME NULL,
  failed_reason VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_payments_code UNIQUE (payment_code),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE payment_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  transaction_code VARCHAR(120) NOT NULL,
  gateway_transaction_code VARCHAR(120) NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('SUCCESS','FAILED','PENDING') NOT NULL,
  raw_response JSON NULL,
  transacted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_payment_transactions_code UNIQUE (transaction_code),
  CONSTRAINT uk_payment_transactions_gateway_code UNIQUE (gateway_transaction_code),
  CONSTRAINT fk_payment_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE TABLE payment_webhook_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NULL,
  provider ENUM('MOCK','VNPAY') NOT NULL,
  webhook_code VARCHAR(150) NOT NULL,
  payload JSON NOT NULL,
  signature VARCHAR(500) NULL,
  status ENUM('RECEIVED','PROCESSED','FAILED','DUPLICATED') NOT NULL DEFAULT 'RECEIVED',
  error_message VARCHAR(500) NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  CONSTRAINT uk_payment_webhook_logs_code UNIQUE (webhook_code),
  CONSTRAINT fk_payment_webhook_logs_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE TABLE course_ownerships (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  order_item_id BIGINT UNSIGNED NULL,
  ownership_type ENUM('FREE','PURCHASED','ADMIN_GRANTED') NOT NULL,
  status ENUM('ACTIVE','REVOKED') NOT NULL DEFAULT 'ACTIVE',
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_course_ownerships_user_course UNIQUE (user_id, course_id),
  CONSTRAINT fk_course_ownerships_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_course_ownerships_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_course_ownerships_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id)
) ENGINE=InnoDB;

CREATE TABLE coupon_usages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_coupon_usages_coupon_order UNIQUE (coupon_id, order_id),
  CONSTRAINT fk_coupon_usages_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT fk_coupon_usages_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_coupon_usages_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  invoice_code VARCHAR(100) NOT NULL,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12,2) NOT NULL,
  billing_name VARCHAR(150) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_invoices_code UNIQUE (invoice_code),
  CONSTRAINT uk_invoices_order UNIQUE (order_id),
  CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE refund_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(500) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('REQUESTED','APPROVED','REJECTED','REFUNDED') NOT NULL DEFAULT 'REQUESTED',
  admin_note VARCHAR(500) NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_refund_requests_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_refund_requests_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('SYSTEM','COURSE','PAYMENT','AI') NOT NULL DEFAULT 'SYSTEM',
  title VARCHAR(200) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NULL,
  target_id BIGINT UNSIGNED NULL,
  value_before TEXT NULL,
  value_after TEXT NULL,
  notes TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_course_type ON courses(course_type);
CREATE INDEX idx_chapters_course_id ON chapters(course_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX idx_lessons_status ON lessons(status);
CREATE INDEX idx_lessons_is_preview ON lessons(is_preview);
CREATE INDEX idx_lesson_contents_lesson_id ON lesson_contents(lesson_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_review_history_course_id ON course_review_history(course_id);
CREATE INDEX idx_course_review_history_admin_id ON course_review_history(admin_id);
CREATE INDEX idx_vocabularies_course_id ON vocabularies(course_id);
CREATE INDEX idx_vocabularies_lesson_id ON vocabularies(lesson_id);
CREATE INDEX idx_vocabularies_level ON vocabularies(level);
CREATE INDEX idx_vocabularies_topic ON vocabularies(topic);
CREATE INDEX idx_vocabularies_word ON vocabularies(word);
CREATE INDEX idx_grammar_topics_course_id ON grammar_topics(course_id);
CREATE INDEX idx_grammar_topics_lesson_id ON grammar_topics(lesson_id);
CREATE INDEX idx_grammar_topics_level ON grammar_topics(level);
CREATE INDEX idx_exercises_course_id ON exercises(course_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_exercises_status ON exercises(status);
CREATE INDEX idx_questions_exercise_id ON questions(exercise_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_owner_user_id ON questions(owner_user_id);
CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX idx_tests_course_id ON tests(course_id);
CREATE INDEX idx_tests_status ON tests(status);
CREATE INDEX idx_test_attempts_user_test ON test_attempts(user_id, test_id);
CREATE INDEX idx_test_attempts_user_exercise ON test_attempts(user_id, exercise_id);
CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX idx_learning_progress_user_course ON learning_progress(user_id, course_id);
CREATE INDEX idx_learning_progress_user_accessed ON learning_progress(user_id, last_accessed_at);
CREATE INDEX idx_vocabulary_progress_user_id ON vocabulary_progress(user_id);
CREATE INDEX idx_vocabulary_progress_review ON vocabulary_progress(user_id, next_review_at);
CREATE INDEX idx_vocabulary_sessions_user_topic ON vocabulary_sessions(user_id, topic_name);
CREATE INDEX idx_vocabulary_session_items_session_id ON vocabulary_session_items(session_id);
CREATE INDEX idx_vocabulary_session_items_vocab_id ON vocabulary_session_items(vocabulary_id);
CREATE INDEX idx_vocabulary_topic_progress_user_id ON vocabulary_topic_progress(user_id);
CREATE INDEX idx_study_schedules_user_time ON study_schedules(user_id, scheduled_at);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_writing_submissions_user_id ON writing_submissions(user_id);
CREATE INDEX idx_ai_usage_logs_user_created ON ai_usage_logs(user_id, created_at);
CREATE INDEX idx_cart_items_course_id ON cart_items(course_id);
CREATE INDEX idx_carts_coupon_id ON carts(coupon_id);
CREATE INDEX idx_coupon_courses_course_id ON coupon_courses(course_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_coupon_id ON orders(coupon_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_course_id ON order_items(course_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX idx_payment_webhook_logs_payment_id ON payment_webhook_logs(payment_id);
CREATE INDEX idx_course_ownerships_user_id ON course_ownerships(user_id);
CREATE INDEX idx_course_ownerships_course_id ON course_ownerships(course_id);
CREATE INDEX idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_admin_created ON audit_logs(admin_id, created_at);


