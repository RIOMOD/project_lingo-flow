# Backend scaffold

Thu muc nay la bo khung backend cho du an `He thong ho tro hoc tieng Anh thong minh`.

Kien truc backend hien tai dung kieu `layer-first`, de nhom nho de nhin va de code:

- `controller`: dat cac file nhu `CourseController`, `OrderController`
- `service`: dat cac interface/use case nhu `CourseService`, `OrderCalculationService`
- `service/impl`: dat cac class hien thuc service
- `repository`: dat cac file nhu `CourseRepository`, `UserRepository`
- `entity`: dat cac entity nhu `Course`, `User`, `Order`
- `dto`: dat request/response DTO, co the chia tiep theo nhom `auth`, `course`, `payment`
- `mapper`: dat cac mapper nhu `CourseMapper`, `UserMapper`
- `payment`, `event`, `listener`, `scheduler` cho thanh toan va xu ly bat dong bo

Huong dan khoi tao va chay backend xem:

- `docs/backend/01-spring-boot-initialization.md`

Chi tiet thiet ke xem:

- `docs/architecture/01-system-architecture.md`

## Bien moi truong

Backend doc cau hinh tu bien moi truong trong `application.yml`. Copy file mau:

```powershell
Copy-Item backend\.env.example backend\.env
```

Backend tu nap `.env` khi chay tu thu muc goc du an hoac thu muc `backend`.
Them OpenAI API key vao `backend\.env` neu muon dung AI that:

```powershell
OPENAI_API_KEY=sk-...
```

Khong commit `backend\.env`; file nay da duoc bo qua trong `.gitignore`. Neu chua co
API key, che do AI du phong van hoat dong de giao dien khong bi loi.

Chay backend on dinh tren Windows:

```powershell
cd backend
.\mvnw.cmd -DskipTests package
java -jar target\english-learning-backend-0.0.1-SNAPSHOT.jar
```
