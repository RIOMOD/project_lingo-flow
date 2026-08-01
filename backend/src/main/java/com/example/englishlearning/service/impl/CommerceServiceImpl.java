package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.payment.CartItemResponse;
import com.example.englishlearning.dto.payment.CartResponse;
import com.example.englishlearning.dto.payment.CouponResponse;
import com.example.englishlearning.dto.payment.InvoiceResponse;
import com.example.englishlearning.dto.payment.OrderItemResponse;
import com.example.englishlearning.dto.payment.OrderResponse;
import com.example.englishlearning.dto.payment.PaymentResponse;
import com.example.englishlearning.dto.payment.PaymentWebhookRequest;
import com.example.englishlearning.dto.payment.RefundResponse;
import com.example.englishlearning.dto.payment.TransactionResponse;
import com.example.englishlearning.entity.Cart;
import com.example.englishlearning.entity.CartItem;
import com.example.englishlearning.entity.Coupon;
import com.example.englishlearning.entity.CouponUsage;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseEnrollment;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.Invoice;
import com.example.englishlearning.entity.Notification;
import com.example.englishlearning.entity.Order;
import com.example.englishlearning.entity.OrderItem;
import com.example.englishlearning.entity.Payment;
import com.example.englishlearning.entity.PaymentTransaction;
import com.example.englishlearning.entity.PaymentWebhookLog;
import com.example.englishlearning.entity.RefundRequest;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.repository.CartItemRepository;
import com.example.englishlearning.repository.CartRepository;
import com.example.englishlearning.repository.CouponRepository;
import com.example.englishlearning.repository.CouponUsageRepository;
import com.example.englishlearning.repository.CourseEnrollmentRepository;
import com.example.englishlearning.repository.CourseOwnershipRepository;
import com.example.englishlearning.repository.CourseRepository;
import com.example.englishlearning.repository.InvoiceRepository;
import com.example.englishlearning.repository.NotificationRepository;
import com.example.englishlearning.repository.OrderItemRepository;
import com.example.englishlearning.repository.OrderRepository;
import com.example.englishlearning.repository.PaymentRepository;
import com.example.englishlearning.repository.PaymentTransactionRepository;
import com.example.englishlearning.repository.PaymentWebhookLogRepository;
import com.example.englishlearning.repository.RefundRequestRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.service.AuditLogService;
import com.example.englishlearning.service.CommerceService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class CommerceServiceImpl implements CommerceService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final CourseRepository courseRepository;
    private final CourseOwnershipRepository courseOwnershipRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final PaymentWebhookLogRepository webhookLogRepository;
    private final InvoiceRepository invoiceRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final NotificationRepository notificationRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @org.springframework.beans.factory.annotation.Value("${app.payment.webhook-secret:}")
    private String webhookSecret;

    @org.springframework.beans.factory.annotation.Value("${app.payment.webhook-max-age-seconds:300}")
    private long webhookMaxAgeSeconds = 300;

    private final com.example.englishlearning.util.TokenHashUtil tokenHashUtil = new com.example.englishlearning.util.TokenHashUtil();

    public CommerceServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            CouponRepository couponRepository,
            CourseRepository courseRepository,
            CourseOwnershipRepository courseOwnershipRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository,
            PaymentTransactionRepository transactionRepository,
            PaymentWebhookLogRepository webhookLogRepository,
            InvoiceRepository invoiceRepository,
            CouponUsageRepository couponUsageRepository,
            NotificationRepository notificationRepository,
            RefundRequestRepository refundRequestRepository,
            UserRepository userRepository,
            AuditLogService auditLogService
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.couponRepository = couponRepository;
        this.courseRepository = courseRepository;
        this.courseOwnershipRepository = courseOwnershipRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.webhookLogRepository = webhookLogRepository;
        this.invoiceRepository = invoiceRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.notificationRepository = notificationRepository;
        this.refundRequestRepository = refundRequestRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        return toCartResponse(getOrCreateCart(getUser(email)));
    }

    @Override
    public CartResponse addCartItem(String email, Long courseId) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        Course course = getCourse(courseId);
        if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new BadRequestException("Only published courses can be added to cart");
        }
        if (course.getCourseType() == Course.CourseType.FREE) {
            throw new BadRequestException("Free courses cannot be added to cart");
        }
        if (courseOwnershipRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), courseId, CourseOwnership.OwnershipStatus.ACTIVE)) {
            throw new BadRequestException("You already own this course");
        }
        if (cartItemRepository.existsByCartIdAndCourseId(cart.getId(), courseId)) {
            return toCartResponse(cart);
        }
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setCourse(course);
        cartItemRepository.save(item);
        return toCartResponse(cart);
    }

    @Override
    public CartResponse removeCartItem(String email, Long courseId) {
        Cart cart = getOrCreateCart(getUser(email));
        cartItemRepository.findByCartIdAndCourseId(cart.getId(), courseId).ifPresent(cartItemRepository::delete);
        return toCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(String email) {
        Cart cart = getOrCreateCart(getUser(email));
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setCoupon(null);
        cartRepository.save(cart);
        return toCartResponse(cart);
    }

    @Override
    public CartResponse applyCoupon(String email, String code) {
        Cart cart = getOrCreateCart(getUser(email));
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        validateCoupon(coupon, calculateSubtotal(cart));
        cart.setCoupon(coupon);
        return toCartResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse removeCoupon(String email) {
        Cart cart = getOrCreateCart(getUser(email));
        cart.setCoupon(null);
        return toCartResponse(cartRepository.save(cart));
    }

    @Override
    public OrderResponse createOrderFromCart(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        List<CartItem> items = cartItemRepository.findByCartIdOrderByAddedAtDesc(cart.getId());
        if (items.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        BigDecimal subtotal = calculateSubtotal(items);
        BigDecimal discount = calculateDiscount(cart.getCoupon(), subtotal);
        Order order = new Order();
        order.setUser(user);
        order.setCoupon(cart.getCoupon());
        order.setOrderCode(generateCode("ORD"));
        order.setSubtotalAmount(subtotal);
        order.setDiscountAmount(discount);
        order.setTotalAmount(subtotal.subtract(discount).max(BigDecimal.ZERO));
        order.setStatus(Order.OrderStatus.PENDING_PAYMENT);
        order = orderRepository.save(order);

        for (CartItem cartItem : items) {
            Course course = cartItem.getCourse();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setCourse(course);
            orderItem.setCourseTitleSnapshot(course.getTitle());
            orderItem.setCourseSlugSnapshot(course.getSlug());
            orderItem.setTeacherIdSnapshot(course.getTeacher() != null ? course.getTeacher().getId() : null);
            orderItem.setOriginalPriceSnapshot(zero(course.getOriginalPrice()));
            orderItem.setSalePriceSnapshot(course.getSalePrice());
            orderItem.setFinalPrice(currentPrice(course));
            orderItemRepository.save(orderItem);
        }

        if (cart.getCoupon() != null) {
            Coupon coupon = cart.getCoupon();
            coupon.setUsedCount((coupon.getUsedCount() == null ? 0 : coupon.getUsedCount()) + 1);
            couponRepository.save(coupon);
            CouponUsage usage = new CouponUsage();
            usage.setCoupon(coupon);
            usage.setUser(user);
            usage.setOrder(order);
            usage.setDiscountAmount(discount);
            couponUsageRepository.save(usage);
        }

        cartItemRepository.deleteByCartId(cart.getId());
        cart.setCoupon(null);
        cart.setStatus(Cart.CartStatus.CHECKED_OUT);
        cartRepository.save(cart);
        return toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(String email, Pageable pageable) {
        User user = getUser(email);
        return PageResponse.from(orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable).map(this::toOrderResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String email, String orderCode) {
        User user = getUser(email);
        return toOrderResponse(orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Override
    public OrderResponse cancelMyOrder(String email, String orderCode) {
        User user = getUser(email);
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() != Order.OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Only unpaid orders can be canceled");
        }
        order.setStatus(Order.OrderStatus.CANCELED);
        order.setCanceledAt(LocalDateTime.now());
        return toOrderResponse(orderRepository.save(order));
    }

    @Override
    public PaymentResponse createPayment(String email, String orderCode) {
        User user = getUser(email);
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() != Order.OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Only unpaid orders can be paid");
        }
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .filter(existing -> existing.getStatus() == Payment.PaymentStatus.INITIATED)
                .orElseGet(() -> {
                    Payment created = new Payment();
                    created.setOrder(order);
                    created.setPaymentCode(generateCode("PAY"));
                    created.setProvider(Payment.PaymentProvider.MOCK);
                    created.setAmount(order.getTotalAmount());
                    created.setStatus(Payment.PaymentStatus.INITIATED);
                    return created;
                });
        payment.setPaymentUrl("http://localhost:5173/student/payment/pending?orderCode="
                + order.getOrderCode() + "&paymentCode=" + payment.getPaymentCode());
        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse handlePaymentReturn(Map<String, String> params) {
        String paymentCode = params.get("paymentCode");
        String status = params.getOrDefault("status", "SUCCESS");
        return completePayment(paymentCode, "RETURN-" + paymentCode, status, mapToJson(params));
    }

    @Override
    public PaymentResponse handlePaymentWebhook(PaymentWebhookRequest request) {
        var existingLog = webhookLogRepository.findByWebhookCode(request.getWebhookCode());
        if (existingLog.isPresent()) {
            return toPaymentResponse(existingLog.get().getPayment());
        }

        Payment payment = paymentRepository.findByPaymentCode(request.getPaymentCode())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (request.getTimestamp() != null && webhookMaxAgeSeconds > 0) {
            long currentTimestamp = java.time.Instant.now().getEpochSecond();
            if (Math.abs(currentTimestamp - request.getTimestamp()) > webhookMaxAgeSeconds) {
                throw new BadRequestException("Webhook timestamp expired");
            }
        }

        if (request.getAmount() == null || payment.getAmount() == null || payment.getAmount().compareTo(request.getAmount()) != 0) {
            throw new BadRequestException("Payment amount mismatch");
        }

        verifyMockWebhookSignature(request);

        PaymentWebhookLog log = new PaymentWebhookLog();
        log.setPayment(payment);
        log.setProvider(payment.getProvider());
        log.setWebhookCode(request.getWebhookCode());
        log.setPayload("{\"paymentCode\":\"" + request.getPaymentCode() + "\",\"status\":\"" + request.getStatus() + "\"}");
        log.setSignature(request.getSignature());
        log.setStatus(PaymentWebhookLog.WebhookStatus.PROCESSED);
        log.setProcessedAt(LocalDateTime.now());
        webhookLogRepository.save(log);

        return completePayment(
                request.getPaymentCode(),
                request.getGatewayTransactionCode() == null ? request.getWebhookCode() : request.getGatewayTransactionCode(),
                request.getStatus(),
                log.getPayload()
        );
    }

    private void verifyMockWebhookSignature(PaymentWebhookRequest request) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            String expectedMock = "MOCK-" + request.getPaymentCode() + "-" + request.getWebhookCode();
            if (request.getSignature() == null || !expectedMock.equals(request.getSignature())) {
                throw new BadRequestException("Invalid webhook signature");
            }
            return;
        }

        String payload = String.join("|",
                request.getPaymentCode() != null ? request.getPaymentCode() : "",
                request.getWebhookCode() != null ? request.getWebhookCode() : "",
                request.getOrderCode() != null ? request.getOrderCode() : "",
                request.getAmount() != null ? request.getAmount().stripTrailingZeros().toPlainString() : "",
                request.getGatewayTransactionCode() != null ? request.getGatewayTransactionCode() : "",
                request.getStatus() != null ? request.getStatus().toUpperCase(Locale.ROOT) : "",
                request.getTimestamp() != null ? String.valueOf(request.getTimestamp()) : ""
        );
        String expectedSignature = tokenHashUtil.hmacSha256(payload, webhookSecret);
        if (request.getSignature() == null || !expectedSignature.equalsIgnoreCase(request.getSignature())) {
            throw new BadRequestException("Invalid webhook signature");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(String email, String orderCode) {
        User user = getUser(email);
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Payment payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAdminOrders(Pageable pageable) {
        return PageResponse.from(orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toOrderResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getAdminTransactions(Pageable pageable) {
        return PageResponse.from(transactionRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toTransactionResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CouponResponse> getAdminCoupons(Pageable pageable) {
        return PageResponse.from(couponRepository.findAll(pageable).map(this::toCouponResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RefundResponse> getAdminRefunds(Pageable pageable) {
        return PageResponse.from(refundRequestRepository.findAllByOrderByRequestedAtDesc(pageable).map(this::toRefundResponse));
    }

    @Override
    public CouponResponse activateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setStatus(Coupon.CouponStatus.ACTIVE);
        coupon = couponRepository.save(coupon);
        auditLogService.logAction("ACTIVATE_COUPON", "COUPON", coupon.getId(), null, "ACTIVE", "Admin activated coupon");
        return toCouponResponse(coupon);
    }

    @Override
    public CouponResponse deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setStatus(Coupon.CouponStatus.INACTIVE);
        coupon = couponRepository.save(coupon);
        auditLogService.logAction("DEACTIVATE_COUPON", "COUPON", coupon.getId(), null, "INACTIVE", "Admin deactivated coupon");
        return toCouponResponse(coupon);
    }

    @Override
    public RefundResponse approveRefund(Long id, String note) {
        RefundRequest refund = refundRequestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        if (refund.getStatus() != RefundRequest.RefundStatus.REQUESTED) {
            throw new BadRequestException("Refund is already processed");
        }
        refund.setStatus(RefundRequest.RefundStatus.APPROVED);
        refund.setAdminNote(note);
        refund.setProcessedAt(LocalDateTime.now());
        refund = refundRequestRepository.save(refund);

        List<CourseOwnership> ownerships = courseOwnershipRepository.findByOrderItemOrderId(refund.getOrder().getId());
        for (CourseOwnership ownership : ownerships) {
            ownership.setStatus(CourseOwnership.OwnershipStatus.REVOKED);
            courseOwnershipRepository.save(ownership);
        }

        auditLogService.logAction("APPROVE_REFUND", "REFUND", refund.getId(), "REQUESTED", "APPROVED", note);
        return toRefundResponse(refund);
    }

    @Override
    public RefundResponse rejectRefund(Long id, String note) {
        RefundRequest refund = refundRequestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        if (refund.getStatus() != RefundRequest.RefundStatus.REQUESTED) {
            throw new BadRequestException("Refund is already processed");
        }
        refund.setStatus(RefundRequest.RefundStatus.REJECTED);
        refund.setAdminNote(note);
        refund.setProcessedAt(LocalDateTime.now());
        refund = refundRequestRepository.save(refund);

        auditLogService.logAction("REJECT_REFUND", "REFUND", refund.getId(), "REQUESTED", "REJECTED", note);
        return toRefundResponse(refund);
    }

    private PaymentResponse completePayment(String paymentCode, String transactionCode, String status, String rawResponse) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseGet(() -> {
                    Payment created = new Payment();
                    created.setPaymentCode(paymentCode != null ? paymentCode : generateCode("PAY"));
                    created.setProvider(Payment.PaymentProvider.MOCK);
                    created.setAmount(new BigDecimal("100000.00"));
                    created.setStatus(Payment.PaymentStatus.INITIATED);
                    return paymentRepository.save(created);
                });
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            return toPaymentResponse(payment);
        }
        boolean success = "SUCCESS".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status);
        payment.setStatus(success ? Payment.PaymentStatus.SUCCESS : Payment.PaymentStatus.FAILED);
        payment.setPaidAt(success ? LocalDateTime.now() : null);
        if (!success) {
            payment.setFailedReason("Gateway returned " + status);
        }
        payment = paymentRepository.save(payment);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPayment(payment);
        transaction.setTransactionCode(uniqueTransactionCode(transactionCode));
        transaction.setGatewayTransactionCode(transactionCode);
        transaction.setAmount(payment.getAmount() == null ? new BigDecimal("100000.00") : payment.getAmount());
        transaction.setStatus(success ? PaymentTransaction.TransactionStatus.SUCCESS : PaymentTransaction.TransactionStatus.FAILED);
        transaction.setRawResponse(rawResponse);
        transactionRepository.save(transaction);

        if (success && payment.getOrder() != null) {
            markOrderPaid(payment.getOrder());
        }
        return toPaymentResponse(payment);
    }

    private void markOrderPaid(Order order) {
        if (order.getStatus() == Order.OrderStatus.PAID) {
            return;
        }
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);
        User user = order.getUser();
        for (OrderItem item : orderItemRepository.findByOrderId(order.getId())) {
            if (!courseOwnershipRepository.existsByUserIdAndCourseId(user.getId(), item.getCourse().getId())) {
                CourseOwnership ownership = new CourseOwnership();
                ownership.setUser(user);
                ownership.setCourse(item.getCourse());
                ownership.setOrderItem(item);
                ownership.setOwnershipType(CourseOwnership.OwnershipType.PURCHASED);
                ownership.setStatus(CourseOwnership.OwnershipStatus.ACTIVE);
                courseOwnershipRepository.save(ownership);
            }
            if (!courseEnrollmentRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), item.getCourse().getId(), CourseEnrollment.EnrollmentStatus.ACTIVE)) {
                CourseEnrollment enrollment = new CourseEnrollment();
                enrollment.setUser(user);
                enrollment.setCourse(item.getCourse());
                enrollment.setEnrolledAt(LocalDateTime.now());
                enrollment.setStatus(CourseEnrollment.EnrollmentStatus.ACTIVE);
                courseEnrollmentRepository.save(enrollment);
            }
        }
        invoiceRepository.findByOrderId(order.getId()).orElseGet(() -> {
            Invoice invoice = new Invoice();
            invoice.setOrder(order);
            invoice.setInvoiceCode(generateCode("INV"));
            invoice.setTotalAmount(order.getTotalAmount());
            invoice.setBillingName(user.getFullName());
            invoice.setBillingEmail(user.getEmail());
            return invoiceRepository.save(invoice);
        });
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(Notification.NotificationType.PAYMENT);
        notification.setTitle("Payment successful");
        notification.setMessage("Order " + order.getOrderCode() + " has been paid successfully.");
        notificationRepository.save(notification);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId()).map(cart -> {
            if (cart.getStatus() != Cart.CartStatus.ACTIVE) {
                cart.setStatus(Cart.CartStatus.ACTIVE);
                return cartRepository.save(cart);
            }
            return cart;
        }).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setStatus(Cart.CartStatus.ACTIVE);
            return cartRepository.save(cart);
        });
    }

    private User getUser(String email) {
        if (email == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
    }

    private Course getCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Course not found");
        }
        return course;
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartIdOrderByAddedAtDesc(cart.getId());
        BigDecimal subtotal = calculateSubtotal(items);
        BigDecimal discount = calculateDiscount(cart.getCoupon(), subtotal);
        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items.stream().map(item -> toCartItemResponse(item.getCourse())).toList())
                .couponCode(cart.getCoupon() == null ? null : cart.getCoupon().getCode())
                .subtotalAmount(subtotal)
                .discountAmount(discount)
                .totalAmount(subtotal.subtract(discount).max(BigDecimal.ZERO))
                .build();
    }

    private CartItemResponse toCartItemResponse(Course course) {
        return CartItemResponse.builder()
                .courseId(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .thumbnailUrl(course.getThumbnailUrl())
                .originalPrice(zero(course.getOriginalPrice()))
                .salePrice(course.getSalePrice())
                .finalPrice(currentPrice(course))
                .build();
    }

    private OrderResponse toOrderResponse(Order order) {
        InvoiceResponse invoice = invoiceRepository.findByOrderId(order.getId()).map(this::toInvoiceResponse).orElse(null);
        return OrderResponse.builder()
                .orderCode(order.getOrderCode())
                .subtotalAmount(order.getSubtotalAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .couponCode(order.getCoupon() == null ? null : order.getCoupon().getCode())
                .paidAt(order.getPaidAt())
                .canceledAt(order.getCanceledAt())
                .createdAt(order.getCreatedAt())
                .items(orderItemRepository.findByOrderId(order.getId()).stream().map(this::toOrderItemResponse).toList())
                .invoice(invoice)
                .build();
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .courseId(item.getCourse().getId())
                .title(item.getCourseTitleSnapshot())
                .slug(item.getCourseSlugSnapshot())
                .originalPrice(item.getOriginalPriceSnapshot())
                .salePrice(item.getSalePriceSnapshot())
                .finalPrice(item.getFinalPrice())
                .build();
    }

    private InvoiceResponse toInvoiceResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .invoiceCode(invoice.getInvoiceCode())
                .totalAmount(invoice.getTotalAmount())
                .billingName(invoice.getBillingName())
                .billingEmail(invoice.getBillingEmail())
                .issuedAt(invoice.getIssuedAt())
                .build();
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .orderCode(payment.getOrder().getOrderCode())
                .paymentCode(payment.getPaymentCode())
                .provider(payment.getProvider())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .paymentUrl(payment.getPaymentUrl())
                .build();
    }

    private TransactionResponse toTransactionResponse(PaymentTransaction transaction) {
        return TransactionResponse.builder()
                .transactionCode(transaction.getTransactionCode())
                .paymentCode(transaction.getPayment().getPaymentCode())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .transactedAt(transaction.getTransactedAt())
                .build();
    }

    private CouponResponse toCouponResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .status(coupon.getStatus())
                .usedCount(coupon.getUsedCount())
                .build();
    }

    private RefundResponse toRefundResponse(RefundRequest refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .orderCode(refund.getOrder().getOrderCode())
                .userEmail(refund.getUser().getEmail())
                .reason(refund.getReason())
                .amount(refund.getAmount())
                .status(refund.getStatus())
                .adminNote(refund.getAdminNote())
                .requestedAt(refund.getRequestedAt())
                .processedAt(refund.getProcessedAt())
                .build();
    }

    private BigDecimal calculateSubtotal(Cart cart) {
        return calculateSubtotal(cartItemRepository.findByCartIdOrderByAddedAtDesc(cart.getId()));
    }

    private BigDecimal calculateSubtotal(List<CartItem> items) {
        return items.stream().map(item -> currentPrice(item.getCourse())).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null) {
            return BigDecimal.ZERO;
        }
        validateCoupon(coupon, subtotal);
        BigDecimal discount = coupon.getDiscountType() == Coupon.DiscountType.PERCENT
                ? subtotal.multiply(coupon.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : coupon.getDiscountValue();
        if (coupon.getMaxDiscountAmount() != null) {
            discount = discount.min(coupon.getMaxDiscountAmount());
        }
        return discount.min(subtotal).max(BigDecimal.ZERO);
    }

    private void validateCoupon(Coupon coupon, BigDecimal subtotal) {
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStatus() != Coupon.CouponStatus.ACTIVE) {
            throw new BadRequestException("Coupon is not active");
        }
        if (coupon.getStartAt() != null && coupon.getStartAt().isAfter(now)) {
            throw new BadRequestException("Coupon is not started");
        }
        if (coupon.getEndAt() != null && coupon.getEndAt().isBefore(now)) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
        if (subtotal.compareTo(zero(coupon.getMinOrderAmount())) < 0) {
            throw new BadRequestException("Order does not meet coupon minimum amount");
        }
    }

    private BigDecimal currentPrice(Course course) {
        LocalDateTime now = LocalDateTime.now();
        boolean saleActive = course.getSalePrice() != null
                && (course.getSaleStartAt() == null || !course.getSaleStartAt().isAfter(now))
                && (course.getSaleEndAt() == null || !course.getSaleEndAt().isBefore(now));
        return saleActive ? course.getSalePrice() : zero(course.getOriginalPrice());
    }

    private BigDecimal zero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String generateCode(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }

    private String uniqueTransactionCode(String candidate) {
        String base = candidate == null ? generateCode("TXN") : candidate;
        if (!transactionRepository.existsByTransactionCode(base)) {
            return base;
        }
        return generateCode("TXN");
    }

    private String mapToJson(Map<String, String> params) {
        return "{\"paymentCode\":\"" + params.getOrDefault("paymentCode", "") + "\",\"status\":\""
                + params.getOrDefault("status", "") + "\"}";
    }
}
