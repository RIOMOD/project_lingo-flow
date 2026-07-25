# Prompt 5 - Authentication va Authorization

Module auth da duoc trien khai trong backend Spring Boot.

## Role

- `ADMIN`
- `TEACHER`
- `STUDENT`

Guest khong luu trong database. Guest chi la request chua dang nhap va duoc truy cap cac endpoint public.

## API

| Method | Endpoint | Quyen |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh-token` | Public |
| POST | `/api/auth/logout` | Public, can refresh token |
| GET | `/api/auth/me` | Authenticated |
| PUT | `/api/auth/change-password` | Authenticated |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| PUT | `/api/admin/users/{userId}/lock` | ADMIN |

## Thanh phan da tao

- Entity: `Role`, `User`, `UserProfile`, `RefreshToken`, `PasswordResetToken`.
- DTO: request/response trong `dto/auth`.
- Repository: `RoleRepository`, `UserRepository`, `UserProfileRepository`, `RefreshTokenRepository`, `PasswordResetTokenRepository`.
- Service: `AuthService`, `AuthServiceImpl`, `JwtService`, `JwtServiceImpl`.
- Security: `JwtAuthenticationFilter`, `CustomUserDetailsService`, `SecurityConfig`.
- Swagger JWT: `OpenApiConfig` co security scheme `bearerAuth`.

## Quy tac da xu ly

- Dang ky luon gan role `STUDENT`.
- Khong co API public nao tao `TEACHER`.
- Teacher se do Admin tao/cap quyen trong module admin sau.
- Password ma hoa bang BCrypt.
- Access token va refresh token co secret/han rieng.
- Refresh token luu database dang hash SHA-256.
- Reset password token luu database dang hash SHA-256.
- Khong tra `passwordHash` trong response.
- Tai khoan `LOCKED` hoac khong `ACTIVE` khong dang nhap duoc.
- Access token het han duoc filter tra `AUTH_TOKEN_EXPIRED`.

## Cau hinh JWT

Trong `application.yml`:

```yaml
app:
  jwt:
    access-token-secret: ${JWT_ACCESS_SECRET:change-this-access-secret-key-to-at-least-32-characters}
    refresh-token-secret: ${JWT_REFRESH_SECRET:change-this-refresh-secret-key-to-at-least-32-characters}
    access-token-expiration-minutes: ${JWT_ACCESS_EXPIRATION_MINUTES:30}
    refresh-token-expiration-days: ${JWT_REFRESH_EXPIRATION_DAYS:14}
    reset-password-token-expiration-minutes: ${RESET_PASSWORD_EXPIRATION_MINUTES:15}
```

## Phan quyen endpoint

Trong `SecurityConfig`:

- Public: health, Swagger, register, login, refresh-token, logout, forgot/reset password.
- `/api/admin/**`: `ADMIN`.
- `/api/teacher/**`: `ADMIN` hoac `TEACHER`.
- `/api/student/**`: `ADMIN` hoac `STUDENT`.
- Con lai: authenticated.

## Postman test nhanh

### 1. Register Student

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json
```

```json
{
  "fullName": "New Student",
  "email": "new.student@example.com",
  "password": "12345678",
  "phone": "0900000009"
}
```

### 2. Login

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "student@example.com",
  "password": "password"
}
```

Lay `accessToken` va gan vao Authorization:

```text
Authorization: Bearer <accessToken>
```

### 3. Current User

```http
GET http://localhost:8080/api/auth/me
Authorization: Bearer <accessToken>
```

### 4. Refresh Token

```http
POST http://localhost:8080/api/auth/refresh-token
Content-Type: application/json
```

```json
{
  "refreshToken": "<refreshToken>"
}
```

### 5. Change Password

```http
PUT http://localhost:8080/api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "currentPassword": "password",
  "newPassword": "newPassword123"
}
```

### 6. Forgot Password

```http
POST http://localhost:8080/api/auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "student@example.com"
}
```

Trong demo mode, response tra `resetToken` de test tiep.

### 7. Reset Password

```http
POST http://localhost:8080/api/auth/reset-password
Content-Type: application/json
```

```json
{
  "resetToken": "<resetToken>",
  "newPassword": "newPassword123"
}
```

### 8. Lock Account

```http
PUT http://localhost:8080/api/admin/users/3/lock
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

```json
{
  "locked": true
}
```

## Swagger test

1. Mo `http://localhost:8080/swagger-ui.html`.
2. Goi `/api/auth/login`.
3. Copy access token.
4. Bam `Authorize`.
5. Nhap `Bearer <accessToken>`.
6. Test `/api/auth/me` hoac endpoint admin.
