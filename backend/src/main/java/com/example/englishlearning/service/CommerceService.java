package com.example.englishlearning.service;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.payment.CartResponse;
import com.example.englishlearning.dto.payment.CouponResponse;
import com.example.englishlearning.dto.payment.OrderResponse;
import com.example.englishlearning.dto.payment.PaymentResponse;
import com.example.englishlearning.dto.payment.PaymentWebhookRequest;
import com.example.englishlearning.dto.payment.RefundResponse;
import com.example.englishlearning.dto.payment.TransactionResponse;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface CommerceService {

    CartResponse getCart(String email);

    CartResponse addCartItem(String email, Long courseId);

    CartResponse removeCartItem(String email, Long courseId);

    CartResponse clearCart(String email);

    CartResponse applyCoupon(String email, String code);

    CartResponse removeCoupon(String email);

    OrderResponse createOrderFromCart(String email);

    PageResponse<OrderResponse> getMyOrders(String email, Pageable pageable);

    OrderResponse getMyOrder(String email, String orderCode);

    OrderResponse cancelMyOrder(String email, String orderCode);

    PaymentResponse createPayment(String email, String orderCode);

    PaymentResponse handlePaymentReturn(Map<String, String> params);

    PaymentResponse handlePaymentWebhook(PaymentWebhookRequest request);

    PaymentResponse getPaymentStatus(String email, String orderCode);

    PageResponse<OrderResponse> getAdminOrders(Pageable pageable);

    PageResponse<TransactionResponse> getAdminTransactions(Pageable pageable);

    PageResponse<CouponResponse> getAdminCoupons(Pageable pageable);

    PageResponse<RefundResponse> getAdminRefunds(Pageable pageable);

    CouponResponse activateCoupon(Long id);

    CouponResponse deactivateCoupon(Long id);

    RefundResponse approveRefund(Long id, String note);

    RefundResponse rejectRefund(Long id, String note);
}
