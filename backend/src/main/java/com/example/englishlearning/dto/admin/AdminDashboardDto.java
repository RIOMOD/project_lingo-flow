package com.example.englishlearning.dto.admin;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AdminDashboardDto {
    private long totalUsers;
    private long totalStudents;
    private long totalTeachers;
    private long newUsers7Days;
    private long newUsers30Days;

    private long totalCourses;
    private long pendingCourses;
    private long publishedCourses;

    private long totalOrders;
    private long successfulOrders;
    private long failedOrders;

    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;

    private long pendingRefunds;
    private long activeCoupons;

    // Charts data
    private List<DailyRevenueDto> revenue30Days;
    private List<DailyRegistrationDto> registrations30Days;
    private List<OrderStatusStatDto> orderStatusStats;
    private List<CourseStatDto> topCoursesByStudents;
    private List<CourseStatDto> topCoursesByRevenue;

    @Data
    public static class DailyRevenueDto {
        private String date;
        private BigDecimal revenue;
    }

    @Data
    public static class DailyRegistrationDto {
        private String date;
        private long count;
    }

    @Data
    public static class OrderStatusStatDto {
        private String status;
        private long count;
    }

    @Data
    public static class CourseStatDto {
        private Long id;
        private String title;
        private long students;
        private BigDecimal revenue;
    }
}
