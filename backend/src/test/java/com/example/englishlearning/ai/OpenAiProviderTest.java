package com.example.englishlearning.ai;

import com.example.englishlearning.exception.BadRequestException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class OpenAiProviderTest {
    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) server.stop(0);
    }

    @Test
    void usesResponsesApiAndParsesTextAndUsage() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        server = server(exchange -> {
            calls.incrementAndGet();
            assertEquals("/responses", exchange.getRequestURI().getPath());
            String request = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(request.contains("\"model\":\"test-model\""));
            assertTrue(request.contains("\"store\":false"));
            respond(exchange, 200, "{\"output\":[{\"content\":[{\"type\":\"output_text\",\"text\":\"Live response\"}]}],\"usage\":{\"input_tokens\":7,\"output_tokens\":3,\"total_tokens\":10}}");
        });

        AiProviderResult result = provider(0).chat(prompt());

        assertEquals("Live response", result.getText());
        assertEquals(7, result.getPromptTokens());
        assertEquals(3, result.getCompletionTokens());
        assertEquals(10, result.getTotalTokens());
        assertFalse(result.isFallback());
        assertEquals(1, calls.get());
    }

    @Test
    void doesNotRetryAuthenticationFailure() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        server = server(exchange -> {
            calls.incrementAndGet();
            respond(exchange, 401, "{\"error\":{\"message\":\"bad key\"}}");
        });

        BadRequestException error = assertThrows(BadRequestException.class, () -> provider(2).chat(prompt()));

        assertEquals("OpenAI API key is invalid", error.getMessage());
        assertEquals(1, calls.get());
    }

    @Test
    void retriesRateLimitWithBackoff() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        server = server(exchange -> {
            if (calls.incrementAndGet() == 1) respond(exchange, 429, "{}");
            else respond(exchange, 200, "{\"output_text\":\"Recovered\",\"usage\":{\"total_tokens\":1}}");
        });

        assertEquals("Recovered", provider(2).chat(prompt()).getText());
        assertEquals(2, calls.get());
    }

    @Test
    void rejectsStructurallyEmptyResponse() throws Exception {
        server = server(exchange -> respond(exchange, 200, "{\"output\":[]}"));
        assertThrows(BadRequestException.class, () -> provider(0).chat(prompt()));
    }

    @Test
    void reportsMissingApiKeyClearly() {
        OpenAiProvider provider = new OpenAiProvider(
                new ObjectMapper(), "", "https://api.openai.com/v1", "test-model", 2, 0);

        assertFalse(provider.isAvailable());
        assertEquals(
                "OpenAI chưa được cấu hình: backend đang thiếu OPENAI_API_KEY",
                provider.configurationError());
    }

    private OpenAiProvider provider(int retries) {
        return new OpenAiProvider(new ObjectMapper(), "test-key", baseUrl(), "test-model", 2, retries);
    }

    private AiPromptRequest prompt() {
        return AiPromptRequest.builder().systemInstruction("Help").topic("grammar").level("A2").userText("Hello").build();
    }

    private HttpServer server(com.sun.net.httpserver.HttpHandler handler) throws IOException {
        HttpServer result = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        result.createContext("/responses", handler);
        result.start();
        return result;
    }

    private String baseUrl() {
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
