package com.example.englishlearning.service;

import com.example.englishlearning.dto.payment.PaymentResponse;
import com.example.englishlearning.dto.payment.PaymentWebhookRequest;
import com.example.englishlearning.entity.Order;
import com.example.englishlearning.entity.Payment;
import com.example.englishlearning.entity.PaymentWebhookLog;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.impl.CommerceServiceImpl;
import com.example.englishlearning.util.TokenHashUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommerceServiceImplWebhookTest {
    @Mock CartRepository cartRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock CouponRepository couponRepository;
    @Mock CourseRepository courseRepository;
    @Mock CourseOwnershipRepository ownershipRepository;
    @Mock CourseEnrollmentRepository enrollmentRepository;
    @Mock OrderRepository orderRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock PaymentRepository paymentRepository;
    @Mock PaymentTransactionRepository transactionRepository;
    @Mock PaymentWebhookLogRepository webhookLogRepository;
    @Mock InvoiceRepository invoiceRepository;
    @Mock CouponUsageRepository couponUsageRepository;
    @Mock NotificationRepository notificationRepository;
    @Mock RefundRequestRepository refundRequestRepository;
    @Mock UserRepository userRepository;
    @Mock AuditLogService auditLogService;

    private final TokenHashUtil hashes = new TokenHashUtil();
    private CommerceServiceImpl service;
    private Payment payment;

    @BeforeEach
    void setUp() {
        service = new CommerceServiceImpl(cartRepository, cartItemRepository, couponRepository, courseRepository,
                ownershipRepository, enrollmentRepository, orderRepository, orderItemRepository, paymentRepository,
                transactionRepository, webhookLogRepository, invoiceRepository, couponUsageRepository,
                notificationRepository, refundRequestRepository, userRepository, auditLogService);
        ReflectionTestUtils.setField(service, "webhookSecret", "test-secret-at-least-32-characters");
        ReflectionTestUtils.setField(service, "webhookMaxAgeSeconds", 300L);
        Order order = new Order();
        order.setOrderCode("ORD-1");
        order.setStatus(Order.OrderStatus.PENDING_PAYMENT);
        payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentCode("PAY-1");
        payment.setAmount(new BigDecimal("100.00"));
        payment.setStatus(Payment.PaymentStatus.INITIATED);
    }

    @Test
    void rejectsInvalidSignatureBeforeChangingPayment() {
        PaymentWebhookRequest request = request();
        request.setSignature("00");
        when(webhookLogRepository.findByWebhookCode("WH-1")).thenReturn(Optional.empty());
        when(paymentRepository.findByPaymentCode("PAY-1")).thenReturn(Optional.of(payment));

        assertThrows(BadRequestException.class, () -> service.handlePaymentWebhook(request));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void rejectsExpiredTimestamp() {
        PaymentWebhookRequest request = request();
        request.setTimestamp(Instant.now().minusSeconds(301).getEpochSecond());
        request.setSignature(sign(request));
        when(webhookLogRepository.findByWebhookCode("WH-1")).thenReturn(Optional.empty());
        when(paymentRepository.findByPaymentCode("PAY-1")).thenReturn(Optional.of(payment));

        assertThrows(BadRequestException.class, () -> service.handlePaymentWebhook(request));
    }

    @Test
    void rejectsAmountMismatch() {
        PaymentWebhookRequest request = request();
        request.setAmount(new BigDecimal("99.00"));
        request.setSignature(sign(request));
        when(webhookLogRepository.findByWebhookCode("WH-1")).thenReturn(Optional.empty());
        when(paymentRepository.findByPaymentCode("PAY-1")).thenReturn(Optional.of(payment));

        assertThrows(BadRequestException.class, () -> service.handlePaymentWebhook(request));
    }

    @Test
    void duplicateWebhookIsIdempotent() {
        PaymentWebhookLog log = new PaymentWebhookLog();
        log.setPayment(payment);
        when(webhookLogRepository.findByWebhookCode("WH-1")).thenReturn(Optional.of(log));

        PaymentResponse response = service.handlePaymentWebhook(request());

        assertEquals("PAY-1", response.getPaymentCode());
        verifyNoInteractions(paymentRepository, transactionRepository);
    }

    private PaymentWebhookRequest request() {
        PaymentWebhookRequest request = new PaymentWebhookRequest();
        request.setPaymentCode("PAY-1");
        request.setWebhookCode("WH-1");
        request.setOrderCode("ORD-1");
        request.setAmount(new BigDecimal("100.00"));
        request.setGatewayTransactionCode("GW-1");
        request.setStatus("SUCCESS");
        request.setTimestamp(Instant.now().getEpochSecond());
        request.setSignature(sign(request));
        return request;
    }

    private String sign(PaymentWebhookRequest request) {
        String payload = String.join("|", request.getPaymentCode(), request.getWebhookCode(), request.getOrderCode(),
                request.getAmount().stripTrailingZeros().toPlainString(), request.getGatewayTransactionCode(),
                request.getStatus().toUpperCase(Locale.ROOT), String.valueOf(request.getTimestamp()));
        return hashes.hmacSha256(payload, "test-secret-at-least-32-characters");
    }
}
