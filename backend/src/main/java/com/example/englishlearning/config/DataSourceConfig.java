package com.example.englishlearning.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
@Profile("prod")
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);
    private static final Pattern USER_PASS_PATTERN = Pattern.compile("^(?:jdbc:)?postgresql://(?:([^:]+):([^@]+)@)?([^/]+/[^?]+)(?:\\?(.*))?$");

    @Value("${DB_URL:jdbc:postgresql://ep-jolly-math-a77g7ay6-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require}")
    private String rawUrl;

    @Value("${DB_USERNAME:neondb_owner}")
    private String defaultUsername;

    @Value("${DB_PASSWORD:npg_6wX3zMdHuLrt}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String cleanUrl = rawUrl != null ? rawUrl.trim() : "";
        if ((cleanUrl.startsWith("\"") && cleanUrl.endsWith("\"")) || (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))) {
            cleanUrl = cleanUrl.substring(1, cleanUrl.length() - 1).trim();
        }

        String username = defaultUsername;
        String password = defaultPassword;

        Matcher matcher = USER_PASS_PATTERN.matcher(cleanUrl);
        if (matcher.find()) {
            String embeddedUser = matcher.group(1);
            String embeddedPass = matcher.group(2);
            String hostAndDb = matcher.group(3);
            String params = matcher.group(4);

            cleanUrl = "jdbc:postgresql://" + hostAndDb + (params != null && !params.isBlank() ? "?" + params : "");

            if (embeddedUser != null && !embeddedUser.isBlank()) {
                username = embeddedUser;
            }
            if (embeddedPass != null && !embeddedPass.isBlank()) {
                password = embeddedPass;
            }
        }

        log.info("DataSourceConfig: Initializing HikariDataSource with URL='{}', Username='{}'", cleanUrl, username);

        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setJdbcUrl(cleanUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setMaximumPoolSize(5);
        ds.setMinimumIdle(2);
        ds.setConnectionTimeout(30000);
        ds.setIdleTimeout(600000);
        ds.setMaxLifetime(1800000);
        ds.setConnectionTestQuery("SELECT 1");

        return ds;
    }
}
