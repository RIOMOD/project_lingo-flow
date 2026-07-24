package com.example.englishlearning.service;

import com.example.englishlearning.dto.admin.AdminDashboardDto;
import com.example.englishlearning.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final RefundRequestRepository refundRepository;
    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardStats() {
        AdminDashboardDto dto = new AdminDashboardDto();
        
        dto.setTotalUsers(userRepository.count());
        // In a real scenario, you'd filter by role for Students/Teachers
        dto.setTotalStudents(userRepository.count()); 
        dto.setTotalTeachers(0); 
        dto.setNewUsers7Days(0);
        dto.setNewUsers30Days(0);

        dto.setTotalCourses(courseRepository.count());
        dto.setPendingCourses(0);
        dto.setPublishedCourses(courseRepository.count());

        dto.setTotalOrders(orderRepository.count());
        dto.setSuccessfulOrders(0);
        dto.setFailedOrders(0);

        dto.setRevenueToday(BigDecimal.ZERO);
        dto.setRevenueThisMonth(BigDecimal.ZERO);

        dto.setPendingRefunds(refundRepository.count());
        dto.setActiveCoupons(couponRepository.count());

        dto.setRevenue30Days(new ArrayList<>());
        dto.setRegistrations30Days(new ArrayList<>());
        dto.setOrderStatusStats(new ArrayList<>());
        dto.setTopCoursesByStudents(new ArrayList<>());
        dto.setTopCoursesByRevenue(new ArrayList<>());

        return dto;
    }
}
