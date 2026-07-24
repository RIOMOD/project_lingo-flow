# Lingo Flow - Hướng dẫn Triển khai (Deployment Guide)

Tài liệu hướng dẫn triển khai ứng dụng **Lingo Flow** bằng Docker và Nginx trên môi trường sản xuất (Production / Server / VPS).

---

## 1. Yêu cầu hệ thống (Prerequisites)

- **Docker**: phiên bản 20.10+ 
- **Docker Compose**: phiên bản 2.0+
- Port khả dụng: `80` (HTTP Proxy), `8080` (Backend API), `3306` (MySQL DB)

---

## 2. Triển khai bằng Docker Compose (Khuyên dùng)

### Bước 1: Di chuyển tới thư mục deployment

```bash
cd deployment/docker
```

### Bước 2: Thiết lập biến môi trường (Tùy chọn)

Tạo file `.env` tại `deployment/docker/.env` với các giá trị cấu hình thực tế:

```env
DB_PASSWORD=your_secure_db_password
JWT_ACCESS_SECRET=your_32_char_access_secret_key_here
JWT_REFRESH_SECRET=your_32_char_refresh_secret_key_here
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=gpt-5.6-sol
```

### Bước 3: Đóng gói và Khởi chạy toàn bộ hệ thống

Chạy lệnh sau để build Docker Images và khởi chạy 4 containers (MySQL, Backend, Frontend, Nginx Proxy):

```bash
docker compose up -d --build
```

### Bước 4: Kiểm tra trạng thái dịch vụ

```bash
docker compose ps
```

Toàn bộ dịch vụ sẽ sẵn sàng tại:
- **Trang chủ Web App**: `http://localhost/`
- **Backend Swagger UI**: `http://localhost/swagger-ui.html`
- **API Endpoint**: `http://localhost/api/`

---

## 3. Dừng và Quản lý Dịch vụ

- **Dừng các container**:
  ```bash
  docker compose down
  ```

- **Dừng và Xóa toàn bộ dữ liệu (Volumes)**:
  ```bash
  docker compose down -v
  ```

- **Xem nhật ký hoạt động (Logs)**:
  ```bash
  docker compose logs -f backend
  ```
