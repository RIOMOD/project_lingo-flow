# 7. Kien truc muc cao de xuat

## 7.1 Mo hinh thanh phan

- `Web Client`: Giao dien cho Guest, Student, Teacher, Admin.
- `API Gateway or Backend App`: Dau moi xu ly request, auth, rate limit co ban.
- `Auth Module`: Xac thuc, role, session hoac token.
- `Course Module`: Catalog, chi tiet, preview, publishing.
- `Authoring Module`: Tao chuong, bai hoc, vocab, grammar, bai tap, test.
- `Learning Module`: Enrollment, lesson access, progress, score, submission.
- `Commerce Module`: Cart, coupon, order, payment, refund.
- `AI Module`: Chatbot va writing correction.
- `Reporting Module`: Thong ke cho Teacher va Admin.
- `Audit and Monitoring`: Luu vet giao dich va su kien he thong.

## 7.2 Nguyen tac thiet ke

- Backend la nguon su that duy nhat cho gia, quyen hoc va trang thai giao dich.
- Moi thay doi thanh toan phai di qua state machine ro rang.
- Moi quyen truy cap noi dung khoa hoc phai kiem tra qua enrollment va preview flag.
- Phe duyet khoa hoc va gia tach khoi thao tac soan noi dung cua Teacher.
- Tich hop AI phai co timeout, quota va ghi log toi thieu can thiet.

## 7.3 Rang buoc du lieu quan trong

- Mot `Student` khong duoc co hon mot enrollment hieu luc tren cung mot khoa hoc.
- Mot khoa hoc trong gio hang chi xuat hien mot lan.
- Khoa hoc `FREE` khong duoc di qua gio hang.
- Giao dich that bai hoac chua xac minh khong duoc cap quyen hoc.
- Teacher chi duoc sua noi dung do chinh minh tao.
