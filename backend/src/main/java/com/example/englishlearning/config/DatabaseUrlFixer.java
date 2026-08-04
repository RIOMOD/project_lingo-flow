package com.example.englishlearning.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DatabaseUrlFixer implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlFixer.class);
    private static final Pattern USER_PASS_PATTERN = Pattern.compile("^(?:jdbc:)?postgresql://(?:([^:]+):([^@]+)@)?([^/]+/[^?]+)(?:\\?(.*))?$");

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DB_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = environment.getProperty("spring.datasource.url");
        }

        if (dbUrl != null && !dbUrl.isBlank()) {
            dbUrl = dbUrl.trim();
            if ((dbUrl.startsWith("\"") && dbUrl.endsWith("\"")) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
                dbUrl = dbUrl.substring(1, dbUrl.length() - 1).trim();
            }

            Matcher matcher = USER_PASS_PATTERN.matcher(dbUrl);
            if (matcher.find()) {
                String user = matcher.group(1);
                String pass = matcher.group(2);
                String hostAndDb = matcher.group(3);
                String params = matcher.group(4);

                String cleanJdbcUrl = "jdbc:postgresql://" + hostAndDb + (params != null && !params.isBlank() ? "?" + params : "");

                Map<String, Object> props = new HashMap<>();
                props.put("spring.datasource.url", cleanJdbcUrl);
                if (user != null && !user.isBlank()) {
                    props.put("spring.datasource.username", user);
                }
                if (pass != null && !pass.isBlank()) {
                    props.put("spring.datasource.password", pass);
                }

                environment.getPropertySources().addFirst(new MapPropertySource("fixedDatabaseProps", props));
                log.info("DatabaseUrlFixer: Sanitized PostgreSQL JDBC URL to '{}'", cleanJdbcUrl);
            }
        }
    }
}
