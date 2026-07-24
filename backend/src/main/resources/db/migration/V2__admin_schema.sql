-- V2: Admin schema enhancements

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id BIGINT,
    value_before TEXT,
    value_after TEXT,
    notes TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Course Review History Table
CREATE TABLE IF NOT EXISTS course_review_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Coupon Courses Many-to-Many
CREATE TABLE IF NOT EXISTS coupon_courses (
    coupon_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    PRIMARY KEY (coupon_id, course_id)
);
