# Prompt 4 - Checklist kiem tra

Tai lieu nay doi chieu nhanh yeu cau Prompt 4 voi backend hien tai.

## Ket luan

Backend Spring Boot da duoc khoi tao dung muc tieu Prompt 4. Tai thoi diem Prompt 4 chua trien khai JWT; JWT da duoc bo sung o Prompt 5.

## Checklist theo yeu cau

| Yeu cau | Trang thai | File/ghi chu |
|---|---|---|
| 1. Huong dan tao project | Da co | `docs/backend/01-spring-boot-initialization.md` |
| 2. Tao `pom.xml` | Da co | `backend/pom.xml` |
| 3. Cau hinh `application.yml` | Da co | `backend/src/main/resources/application.yml` |
| 4. Ket noi MySQL | Da co | `spring.datasource.*`, DB `english_learning` |
| 5. Tao package chuan | Da co | `config`, `controller`, `dto`, `entity`, `exception`, `repository`, `security`, `service`, ... |
| 6. Tao `BaseEntity` | Da co | `entity/BaseEntity.java` |
| 7. Tao `ApiResponse` | Da co | `dto/common/ApiResponse.java` |
| 8. Tao `ErrorResponse` | Da co | `dto/common/ErrorResponse.java` |
| 9. Tao `GlobalExceptionHandler` | Da co | `exception/GlobalExceptionHandler.java` |
| 10. Tao `ResourceNotFoundException` | Da co | `exception/ResourceNotFoundException.java` |
| 11. Tao `BadRequestException` | Da co | `exception/BadRequestException.java` |
| 12. Tao `UnauthorizedException` | Da co | `exception/UnauthorizedException.java` |
| 13. Cau hinh Swagger | Da co | `config/OpenApiConfig.java`, `/swagger-ui.html`, `/api-docs` |
| 14. Cau hinh CORS | Da co | `config/CorsConfig.java` |
| 15. Tao `GET /api/health` | Da co | `controller/HealthController.java` |
| 16. Huong dan chay bang VS Code | Da co | `docs/backend/01-spring-boot-initialization.md` |
| 17. Huong dan test Swagger/Postman | Da co | `docs/backend/01-spring-boot-initialization.md` |
| Khong trien khai JWT trong Prompt 4 | Dung tai thoi diem Prompt 4 | JWT filter/provider da duoc bo sung rieng trong Prompt 5. |

## Doi chieu voi Prompt 3

| Hang muc | Trang thai |
|---|---|
| Backend ket noi dung database Prompt 3 | `jdbc:mysql://localhost:3306/english_learning` |
| Backend khong de JPA tu sinh schema | `spring.jpa.hibernate.ddl-auto: none` |
| Schema van do SQL Prompt 3 quan ly | `database/migrations/001_create_schema.sql` |
| Seed data van do SQL Prompt 3 quan ly | `database/seed/001_seed_sample_data.sql` |

## Ghi chu con lai

- May hien tai co Java 21, project cau hinh compile Java 17 trong `pom.xml`.
- May hien tai chua co `mvn` trong PATH nen chua build/run truc tiep duoc.
- Neu muon chay ngay trong VS Code, can cai Maven hoac dung Maven wrapper sau nay.
