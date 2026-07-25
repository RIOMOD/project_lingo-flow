# Backend scaffold

Thu muc nay la bo khung backend cho du an `He thong ho tro hoc tieng Anh thong minh`.

Kien truc backend hien tai dung kieu `layer-first`, de nhom nho de nhin va de code:

- `controller`: dat cac file nhu `CourseController`, `OrderController`
- `service`: dat cac interface/use case nhu `CourseService`, `OrderCalculationService`
- `service/impl`: dat cac class hien thuc service
- `repository`: dat cac file nhu `CourseRepository`, `UserRepository`
- `entity`: dat cac entity nhu `Course`, `User`, `Order`
- `dto`: dat request/response DTO, co the chia tiep theo nhom `auth`, `course`, `payment`

Chi tiet thiet ke xem:

- `docs/architecture/01-system-architecture.md`

## Chay sau khi clone

Yeu cau may:

- Java 21
- Node.js
- Docker Desktop

Chay backend:

```powershell
cd backend
npm run dev
```

Script dev se tu tao `backend\.env` neu thieu, chay MySQL 8 bang Docker Compose,
cho MySQL healthy, roi chay Spring Boot bang Maven Wrapper. Flyway tu tao schema
va du lieu mau tu database rong; khong can chay SQL migration thu cong.

Them OpenAI API key vao `backend\.env` neu muon dung AI that:

```powershell
OPENAI_API_KEY=sk-...
```

Khong commit `backend\.env`; file nay da duoc bo qua trong `.gitignore`.

Tai khoan demo sau khi Flyway chay xong:

- `admin@example.com` / `Password123!`
- `teacher@example.com` / `Password123!`
- `teacher2@example.com` / `Password123!`
- `student@example.com` / `Password123!`
- `student2@example.com` / `Password123!`
