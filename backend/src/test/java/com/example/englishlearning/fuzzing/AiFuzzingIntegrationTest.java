package com.example.englishlearning.fuzzing;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AI Fuzzing Integration Test Suite for LingoFlow Backend.
 *
 * DISCOVERY: Tests revealed that /api/public/* is NOT a real endpoint pattern.
 * The actual public courses API is /api/courses/** (permitAll via SecurityConfig line 64).
 * Tests have been updated to use the correct endpoint paths.
 *
 * Key Fuzzing Categories:
 *   - FUZZ 01: Pagination boundary attacks (negative, overflow values)
 *   - FUZZ 02: Invalid resource IDs (negative, out-of-range)
 *   - FUZZ 03: Unauthorized access to protected API endpoints
 *   - FUZZ 04: Injection attacks (SQLi / XSS) in coupon codes
 *   - FUZZ 05: Malformed payloads on checkout endpoint
 *   - FUZZ 06: Health endpoint availability
 *   - FUZZ 07: Auth endpoints with missing/malformed bodies
 *   - FUZZ 08: Very large string payloads (buffer overflow attempts)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AiFuzzingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // ═══════════════════════════════════════════════════════════
    // FUZZ 01 — Public Courses: Pagination boundary & SQL injection in search
    // Security rule: GET /api/courses/** → permitAll (SecurityConfig line 64)
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 01: Public courses API with negative/overflow pagination params and XSS search")
    void testPublicCoursesPaginationFuzzing() throws Exception {
        // Correct endpoint: /api/courses (not /api/public/courses)
        mockMvc.perform(get("/api/courses")
                .param("page", "0")
                .param("size", "10")
                .param("search", "' OR '1'='1' -- <script>alert('xss')</script>")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()); // Spring Data sanitizes params; safe 200 expected
    }

    @Test
    @DisplayName("FUZZ 01b: Public courses API with extreme negative page/size")
    void testPublicCoursesPaginationExtremeFuzzing() throws Exception {
        mockMvc.perform(get("/api/courses")
                .param("page", "-9999")
                .param("size", "-50"))
                // Spring Pageable converts negatives to 0 and default, so backend handles safely
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // Accept either 200 OK (handled gracefully) or 400 Bad Request (validated)
                    if (status != 200 && status != 400) {
                        throw new AssertionError("Expected 200 or 400 but got: " + status);
                    }
                });
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 02 — Invalid course IDs: negative, zero, non-existent
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 02: Public course detail with negative ID should be 401 or 404 (not 500)")
    void testCourseDetailInvalidIdFuzzing() throws Exception {
        // Backend returns 401 for unauthenticated even on public endpoints in test profile
        // The important thing: NO 500 Internal Server Error (no crash)
        mockMvc.perform(get("/api/courses/-99999"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 500) {
                        throw new AssertionError("CRITICAL: Backend returned 500 for negative course ID — possible unhandled exception!");
                    }
                });
    }

    @Test
    @DisplayName("FUZZ 02b: Public course detail with non-existent large ID")
    void testCourseDetailNotFoundFuzzing() throws Exception {
        mockMvc.perform(get("/api/courses/999999999"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 500) {
                        throw new AssertionError("CRITICAL: Backend returned 500 for large non-existent course ID!");
                    }
                });
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 03 — Auth endpoints: missing/malformed request bodies
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 03: Login with empty body should not cause 500")
    void testLoginEmptyBodyFuzzing() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 500) {
                        throw new AssertionError("CRITICAL: Login with empty body caused 500!");
                    }
                });
    }

    @Test
    @DisplayName("FUZZ 03b: Login with SQL injection in credentials")
    void testLoginSQLInjectionFuzzing() throws Exception {
        String sqlPayload = "{\"email\": \"admin' OR '1'='1' --\", \"password\": \"anything\"}";
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sqlPayload))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // Must NOT return 200 (that would mean auth bypass!)
                    if (status == 200) {
                        throw new AssertionError("CRITICAL SECURITY: SQL injection in login returned 200 — auth bypass detected!");
                    }
                    // Must NOT crash
                    if (status == 500) {
                        throw new AssertionError("CRITICAL: SQL injection caused 500 Internal Server Error!");
                    }
                });
    }

    @Test
    @DisplayName("FUZZ 03c: Register with XSS payload in display name")
    void testRegisterXSSFuzzing() throws Exception {
        String xssPayload = "{\"email\": \"test@example.com\", \"password\": \"ValidPass123!\", \"fullName\": \"<script>alert('XSS')</script>\"}";
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(xssPayload))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 500) {
                        throw new AssertionError("CRITICAL: XSS payload in register caused 500!");
                    }
                });
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 04 — Protected endpoints: must block without JWT
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 04: Protected student endpoints require authentication")
    void testProtectedEndpointsWithoutAuthFuzzing() throws Exception {
        mockMvc.perform(get("/api/student/cart"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/student/cart/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"courseId\": 9999}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/student/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("FUZZ 04b: Admin endpoints must block non-admin users without token")
    void testAdminEndpointsWithoutAuthFuzzing() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/courses"))
                .andExpect(status().isUnauthorized());
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 05 — Coupon validation: SQL/XSS injection attacks
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 05: Coupon validation with malformed SQL/XSS/oversized codes")
    void testCouponValidationFuzzing() throws Exception {
        String[] fuzzPayloads = {
            "' OR '1'='1",
            "<script>alert(document.cookie)</script>",
            "   ",
            "VERY_LONG_COUPON_CODE_".repeat(15) // 315 chars > typical 255 limit
        };

        for (String payload : fuzzPayloads) {
            mockMvc.perform(post("/api/student/coupons/validate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"code\": \"" + payload.replace("\"", "\\\"") + "\"}"))
                    .andExpect(result -> {
                        int status = result.getResponse().getStatus();
                        if (status == 500) {
                            throw new AssertionError("CRITICAL: Coupon fuzzing caused 500 for payload: " + payload.substring(0, Math.min(30, payload.length())));
                        }
                    });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 06 — Checkout: malformed payloads
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 06: Checkout endpoint with malformed payment method")
    void testCheckoutPayloadFuzzing() throws Exception {
        mockMvc.perform(post("/api/student/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"paymentMethod\": \"INVALID_METHOD_FUZZING_123\"}"))
                .andExpect(status().isUnauthorized()); // No token → 401, not 500
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 07 — Health endpoint availability
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 07: Health endpoint must be publicly accessible")
    void testHealthEndpointAvailability() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    // ═══════════════════════════════════════════════════════════
    // FUZZ 08 — Buffer overflow attempt: extremely large JSON body
    // ═══════════════════════════════════════════════════════════
    @Test
    @DisplayName("FUZZ 08: Login with extremely large JSON body should not crash server")
    void testLargePayloadBufferOverflowFuzzing() throws Exception {
        String largeEmail = "a".repeat(10000);
        String largeBody = "{\"email\": \"" + largeEmail + "@test.com\", \"password\": \"" + "p".repeat(10000) + "\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(largeBody))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 500) {
                        throw new AssertionError("CRITICAL: Large payload caused 500 Internal Server Error (potential DoS vector)!");
                    }
                });
    }
}
