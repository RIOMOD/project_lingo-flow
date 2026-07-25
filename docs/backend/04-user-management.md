# Prompt 6 - Quan ly nguoi dung

Module nay cung cap API quan ly user cho Admin va API ho so ca nhan cho Teacher/Student.

## API

| Method | Endpoint | Quyen |
|---|---|---|
| GET | `/api/admin/users` | ADMIN |
| GET | `/api/admin/users/{id}` | ADMIN |
| POST | `/api/admin/users/teachers` | ADMIN |
| PUT | `/api/admin/users/{id}` | ADMIN |
| PATCH | `/api/admin/users/{id}/status` | ADMIN |
| PATCH | `/api/admin/users/{id}/role` | ADMIN |
| GET | `/api/admin/users/{id}/orders` | ADMIN |
| GET | `/api/admin/users/{id}/courses` | ADMIN |
| GET | `/api/users/profile` | Authenticated |
| PUT | `/api/users/profile` | Authenticated |
| GET | `/api/users/me/orders` | STUDENT, ADMIN |
| GET | `/api/users/me/courses` | STUDENT, ADMIN |

## Quy tac

- User thuong khong co API tu nang role.
- Teacher chi do Admin tao qua `/api/admin/users/teachers` hoac doi role qua endpoint Admin.
- Khong khoa Admin cuoi cung.
- Khoa tai khoan khong xoa order/course ownership.
- Order response khong tra thong tin payment nhay cam.
- API list co pagination, search, filter role va status.

## Test Postman nhanh

Dung access token cua Admin:

```http
GET http://localhost:8080/api/admin/users?page=0&size=10&search=student&role=STUDENT&status=ACTIVE
Authorization: Bearer <adminAccessToken>
```

Dung access token cua user bat ky:

```http
GET http://localhost:8080/api/users/profile
Authorization: Bearer <accessToken>
```
