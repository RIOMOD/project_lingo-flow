# Prompt 4 - Khoi tao backend Spring Boot

Cong nghe:

- Java 17
- Spring Boot 3
- Maven
- MySQL
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security
- Lombok
- Swagger/OpenAPI

## 1. Huong dan tao project

Co 2 cach:

1. Tao bang Spring Initializr:
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.x
   - Java: 17
   - Group: `com.example`
   - Artifact: `english-learning-backend`
   - Package name: `com.example.englishlearning`
   - Dependencies: Spring Web, Spring Data JPA, Validation, Spring Security, Lombok, MySQL Driver

2. Dung project da tao san trong repo:
   - Thu muc backend: `backend/`
   - File Maven: `backend/pom.xml`
   - Main class: `EnglishLearningApplication`

## 2. pom.xml

File da tao tai:

- `backend/pom.xml`

Dependencies chinh:

- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-security`
- `mysql-connector-j`
- `lombok`
- `springdoc-openapi-starter-webmvc-ui`

## 3. application.yml

File da tao tai:

- `backend/src/main/resources/application.yml`

Cau hinh chinh:

- Port mac dinh: `8080`
- Database mac dinh: `english_learning`
- Swagger UI: `/swagger-ui.html`
- OpenAPI JSON: `/api-docs`
- CORS cho frontend Vite: `http://localhost:5173`

## 4. Ket noi MySQL

Mac dinh backend doc cac bien moi truong:

```env
DB_URL=jdbc:mysql://localhost:3306/english_learning?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh
DB_USERNAME=root
DB_PASSWORD=
```

Neu chua co database, import:

1. Chay `database/migrations/001_create_schema.sql`.
2. Chay `database/seed/001_seed_sample_data.sql` neu can du lieu mau.

## 5. Package chuan

```text
com.example.englishlearning
  config/
  controller/
  dto/
    common/
  entity/
  exception/
  mapper/
  repository/
  security/
  service/
    impl/
  util/
  validator/
  payment/
  event/
  listener/
  scheduler/
```

## 6. BaseEntity

File:

- `backend/src/main/java/com/example/englishlearning/entity/BaseEntity.java`

Dung cho entity sau nay, gom:

- `id`
- `createdAt`
- `updatedAt`
- `deletedAt`

## 7. ApiResponse

File:

- `backend/src/main/java/com/example/englishlearning/dto/common/ApiResponse.java`

Format:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": {},
  "timestamp": "2026-07-11T00:00:00Z"
}
```

## 8. ErrorResponse

File:

- `backend/src/main/java/com/example/englishlearning/dto/common/ErrorResponse.java`

Format:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "timestamp": "2026-07-11T00:00:00Z",
  "path": "/api/example"
}
```

## 9. GlobalExceptionHandler

File:

- `backend/src/main/java/com/example/englishlearning/exception/GlobalExceptionHandler.java`

Dang xu ly:

- `ResourceNotFoundException` -> 404
- `BadRequestException` -> 400
- `UnauthorizedException` -> 401
- `MethodArgumentNotValidException` -> 400
- `ConstraintViolationException` -> 400
- `Exception` -> 500

## 10. Custom exceptions

Da tao:

- `ResourceNotFoundException`
- `BadRequestException`
- `UnauthorizedException`

## 11. Swagger/OpenAPI

File config:

- `backend/src/main/java/com/example/englishlearning/config/OpenApiConfig.java`

URL:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI docs: `http://localhost:8080/api-docs`

## 12. CORS

File config:

- `backend/src/main/java/com/example/englishlearning/config/CorsConfig.java`

Mac dinh cho phep:

- `http://localhost:5173`
- `http://localhost:3000`

## 13. Security

File:

- `backend/src/main/java/com/example/englishlearning/security/SecurityConfig.java`

Tai thoi diem Prompt 4 chua trien khai JWT. Sau Prompt 5, backend da co JWT auth. Phan khoi tao ban dau gom:

- Tat CSRF cho API.
- Stateless session.
- Cho phep `/api/health`, Swagger va OpenAPI.
- Cac endpoint khac dang `permitAll` de tien phat trien ban dau.

## 14. Health API

Endpoint:

```http
GET /api/health
```

Response mau:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": {
    "status": "UP",
    "service": "english-learning-backend",
    "time": "2026-07-11T00:00:00Z"
  },
  "timestamp": "2026-07-11T00:00:00Z"
}
```

## 15. Huong dan chay bang VS Code

Can cai:

- JDK 17
- Maven
- Extension Pack for Java
- Spring Boot Extension Pack
- MySQL dang chay local

Cach chay:

1. Mo VS Code tai root project.
2. Mo terminal.
3. Di vao backend:

```bash
cd backend
```

4. Chay app:

```bash
mvn spring-boot:run
```

Hoac trong VS Code:

1. Mo file `EnglishLearningApplication.java`.
2. Bam `Run` tren main method.

## 16. Test bang Swagger

1. Chay backend.
2. Mo trinh duyet:

```text
http://localhost:8080/swagger-ui.html
```

3. Mo tag `Health`.
4. Chay `GET /api/health`.
5. Kiem tra response `success=true`, `status=UP`.

## 17. Test bang Postman

Tao request:

```http
GET http://localhost:8080/api/health
```

Header:

```text
Accept: application/json
```

Ket qua mong doi:

- HTTP status: `200 OK`
- Body co `success: true`
- Body co `data.status: "UP"`
