# Prompt 3 - Checklist kiem tra

Tai lieu nay dung de doi chieu nhanh Prompt 3 voi cac file da tao.

## Ket luan

Prompt 3 da duoc dap ung o muc thiet ke database va SQL thuc thi:

- Co du 41 bang theo de bai, va them `password_reset_tokens` de ho tro Prompt 5 reset mat khau.
- Co file SQL tao database: `database/migrations/001_create_schema.sql`.
- Co file SQL seed data: `database/seed/001_seed_sample_data.sql`.
- Co file SQL drop dung thu tu: `database/migrations/999_drop_all.sql`.
- Co tai lieu thiet ke va ERD: `docs/database/01-database-design.md`.

## Checklist theo yeu cau

| Yeu cau | Trang thai | Noi dung |
|---|---|---|
| 1. Mo ta tung bang | Da co | `01-database-design.md` mo ta theo nhom bang; cac bang user/course mo ta chi tiet, cac bang con mo ta ngan. |
| 2. Cot va kieu du lieu | Da co | Chi tiet day du trong `001_create_schema.sql`. |
| 3. Primary key | Da co | Tat ca bang dung `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`. |
| 4. Foreign key | Da co | Co `CONSTRAINT fk_*` cho cac quan he chinh. |
| 5. Unique constraint | Da co | Email, slug, token, cart item, ownership, transaction, webhook, invoice, order code. |
| 6. Index | Da co | Co index cho FK, status va cac truy van hay dung. |
| 7. Enum | Da co | Dung MySQL `ENUM(...)` cho role/status/type can thiet. |
| 8. ERD Mermaid | Da co | Trong `01-database-design.md`. |
| 9. SQL tao database | Da co | `001_create_schema.sql`. |
| 10. SQL du lieu mau | Da co | `001_seed_sample_data.sql`. |
| 11. SQL drop table dung thu tu | Da co | `999_drop_all.sql`. |
| 12. Mau Admin/Teacher/Student | Da co | `admin@example.com`, `teacher@example.com`, `student@example.com`. |
| 13. Mau khoa FREE va PAID | Da co | `English Communication Starter`, `IELTS Foundation Paid Course`. |
| 14. Cach import MySQL Workbench | Da co | Muc 11 trong `01-database-design.md`. |

## Rule nghiep vu da the hien trong DB

| Rule | Cach thiet ke |
|---|---|
| User dang ky mac dinh la STUDENT | Seed co role `STUDENT`; backend khi register se gan `role_id` cua `STUDENT`. |
| Teacher do Admin tao/cap quyen | Quan ly bang `role_id`; backend/admin flow dam nhiem cap role. |
| Mot Student chi so huu mot khoa mot lan | `uk_course_ownerships_user_course`. |
| Mot khoa hoc chi co mot lan trong gio | `uk_cart_items_cart_course`. |
| `order_items` luu snapshot | Cac cot `course_title_snapshot`, `course_slug_snapshot`, `teacher_id_snapshot`, `original_price_snapshot`, `sale_price_snapshot`, `final_price`. |
| Tien dung DECIMAL | Cac cot tien dung `DECIMAL(12,2)`; AI cost dung `DECIMAL(12,6)`. |
| Khong xoa vat ly order/transaction | `orders`, `payments`, `payment_transactions` khong co `deleted_at`; xu ly bang `status`. |
| `transaction_code` unique | `uk_payment_transactions_code`. |
| `webhook_code` chong trung | `uk_payment_webhook_logs_code`. |
| Soft delete | Cac bang catalog/content/user co `deleted_at`. |
| Chuan hoa 3NF | Du lieu tach user, profile, course, chapter, lesson, order, payment, transaction, coupon, progress. |

## Ghi chu con lai

- Chua test import truc tiep vi may hien tai khong co lenh `mysql` CLI trong PATH.
- Neu MySQL Workbench dang dung MySQL 5.x cu, cot `JSON` va `CHECK` co the can dieu chinh; voi MySQL 8 thi on.
- Rule "Teacher do Admin cap quyen" nen de backend enforce, vi database khong nen hard-code viec `courses.teacher_id` bat buoc tro den user co role TEACHER bang trigger.

