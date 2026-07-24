# 6. Rui ro va thu tu trien khai

## 6.1 Rui ro ky thuat

| Rui ro | Tac dong | Huong giam thieu |
|---|---|---|
| Webhook gui lap | Co the cap quyen hoc sai | Dung idempotency key va unique transaction reference |
| Race condition khi mua khoa hoc | Co the mua trung hoac tao enrollment trung | Dat unique constraint va transaction o backend |
| Dung luong media lon | Toc do tai cham | Tach object storage va dung CDN |
| AI tra loi cham hoac loi | Anh huong trai nghiem | Timeout, retry hop ly, fallback message |
| Bao cao doanh thu sai do async payment va refund | Mat do tin cay du lieu | Tinh tren state machine chuan va co reconciliation job |

## 6.2 Rui ro bao mat

| Rui ro | Tac dong | Huong giam thieu |
|---|---|---|
| Broken access control | Xem hoac sua du lieu trai phep | Kiem tra quyen o backend cho moi API |
| Gia mao webhook | Cap quyen hoc khong dung | Xac minh chu ky va nguon callback |
| Can thiep tong tien o client | That thoat doanh thu | Backend tinh lai toan bo gia va giam gia |
| Brute force dang nhap | Chiem doat tai khoan | Rate limit, khoa tam thoi, MFA cho Admin |
| XSS va upload doc hai | Tan cong nguoi dung khac | Sanitize input, validate tep, CSP |
| Lo thong tin nhay cam qua AI va log | Rui ro rieng tu | Mask du lieu nhay cam va giam pham vi log |

## 6.3 Thu tu trien khai de xuat

1. Xac thuc, phan quyen, user profile, khoa mo tai khoan.
2. Catalog khoa hoc, chi tiet, preview, dashboard role co ban.
3. CMS cho Teacher va phe duyet cho Admin.
4. Enrollment khoa hoc FREE va hoc bai co luu tien do.
5. Commerce: gio hang, coupon, order, payment, webhook, cap quyen hoc.
6. Bai tap, bai kiem tra, question bank, score.
7. Bao cao, refund, monitoring, audit log.
8. Chatbot AI va AI sua bai viet.
