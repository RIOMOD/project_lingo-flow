package com.example.englishlearning.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                log.info("Running Flyway repair...");
                flyway.repair();
            } catch (Exception e) {
                log.warn("Flyway repair encountered an error, proceeding to migrate: {}", e.getMessage());
            }
            log.info("Running Flyway migration...");
            flyway.migrate();
        };
    }
}
