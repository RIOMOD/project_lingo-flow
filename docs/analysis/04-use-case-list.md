# 4. Bang use case

| ID | Use case | Actor | Dieu kien tien quyet | Ket qua |
|---|---|---|---|---|
| UC01 | Xem trang chu | Guest, Student | Truy cap he thong | Xem thong tin gioi thieu va khoa hoc noi bat |
| UC02 | Xem danh sach khoa hoc | Guest, Student | Co du lieu khoa hoc da xuat ban | Xem catalog va bo loc |
| UC03 | Xem chi tiet khoa hoc | Guest, Student | Khoa hoc da xuat ban | Xem gia, giao vien, curriculum, bai preview |
| UC04 | Hoc thu bai preview | Guest, Student chua so huu | Bai hoc co `isPreview=true` | Xem duoc bai hoc thu |
| UC05 | Dang ky tai khoan | Guest | Chua co tai khoan | Tao tai khoan role `STUDENT` |
| UC06 | Dang nhap | Student, Teacher, Admin | Co tai khoan hop le | Dang nhap dung quyen |
| UC07 | Cap nhat ho so | Student, Teacher | Da dang nhap | Luu thong tin ca nhan |
| UC08 | Dang ky khoa hoc FREE | Student | Chua so huu khoa hoc | Tao enrollment va hoc ngay |
| UC09 | Them khoa hoc PAID vao gio | Student | Khoa hoc la `PAID`, chua so huu, chua co trong gio | Gio hang duoc cap nhat |
| UC10 | Ap ma giam gia | Student | Co gio hang hop le | Gia duoc tinh lai o backend |
| UC11 | Tao don hang | Student | Gio hang hop le | Tao order `PENDING_PAYMENT` |
| UC12 | Thanh toan khoa hoc | Student | Don hang ton tai | Chuyen huong sang payment gateway |
| UC13 | Xu ly webhook thanh toan | System | Gateway gui callback hop le | Cap nhat payment va order |
| UC14 | Cap quyen hoc sau thanh toan | System | Payment thanh cong | Tao enrollment `ACTIVE` |
| UC15 | Hoc bai va luu tien do | Student | Da co quyen hoc | Luu tien do hoc tap |
| UC16 | Lam bai tap va bai kiem tra | Student | Da co quyen hoc | Luu bai nop va diem |
| UC17 | Dung chatbot AI | Student | Da dang nhap | Tao phien hoi thoai AI |
| UC18 | Gui bai viet cho AI sua | Student | Da dang nhap | Nhan phan hoi sua bai |
| UC19 | Tao va sua khoa hoc | Teacher | Tai khoan Teacher hop le | Luu khoa hoc nhap cua chinh minh |
| UC20 | Gui khoa hoc duyet | Teacher | Khoa hoc dat muc toi thieu | Trang thai thanh `SUBMITTED` |
| UC21 | Duyet khoa hoc va gia | Admin | Khoa hoc da submit | Approved hoac rejected |
| UC22 | Xuat ban hoac an khoa hoc | Admin | Khoa hoc da duoc duyet | Khoa hoc hien hoac an tren catalog |
| UC23 | Quan ly user va role | Admin | Da dang nhap bang quyen Admin | User duoc cap role, khoa mo dung |
| UC24 | Quan ly hoan tien | Admin | Co giao dich hop le | Refund duoc ghi nhan va thu hoi quyen hoc neu can |
| UC25 | Xem bao cao va doanh thu | Teacher, Admin | Co du lieu phat sinh | Xem thong ke phu hop vai tro |
