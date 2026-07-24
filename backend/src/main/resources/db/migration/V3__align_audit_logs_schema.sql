-- Align existing audit_logs tables created by the root SQL schema with the
-- JPA entity used by the Spring Boot application. Existing data is preserved.

SET @schema_name = DATABASE();

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE audit_logs ADD COLUMN admin_id BIGINT UNSIGNED NULL AFTER id',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name
      AND table_name = 'audit_logs'
      AND column_name = 'admin_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE audit_logs ADD COLUMN value_before TEXT NULL AFTER target_id',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name
      AND table_name = 'audit_logs'
      AND column_name = 'value_before'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE audit_logs ADD COLUMN value_after TEXT NULL AFTER value_before',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name
      AND table_name = 'audit_logs'
      AND column_name = 'value_after'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE audit_logs ADD COLUMN notes TEXT NULL AFTER value_after',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name
      AND table_name = 'audit_logs'
      AND column_name = 'notes'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) > 0,
        'UPDATE audit_logs SET admin_id = actor_user_id WHERE admin_id IS NULL AND actor_user_id IS NOT NULL',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name
      AND table_name = 'audit_logs'
      AND column_name = 'actor_user_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
