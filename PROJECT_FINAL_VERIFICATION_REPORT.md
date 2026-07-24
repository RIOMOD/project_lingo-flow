# PROJECT FINAL VERIFICATION REPORT

Verification date: 2026-07-22 (Asia/Saigon)

Status meanings used in this report:

- `VERIFIED`: exercised by a real build, application-context/runtime smoke test, or a focused test at the relevant boundary. A mocked OpenAI server is never treated as live OpenAI verification.
- `IMPLEMENTED BUT NOT VERIFIED`: source is present and compiles, but the required real provider/database/browser flow was unavailable.
- `NOT IMPLEMENTED`: required external integration or UI/API is absent.
- `FAILED`: an attempted command or flow did not work.

## 1. Build Results

| Command | Result | Evidence | Status |
| --- | --- | --- | --- |
| `backend\\mvnw.cmd clean test` | Build success | 200 main sources and 6 test sources compiled; 14 tests, 0 failures/errors/skips | `VERIFIED` |
| `frontend\\npm.cmd install` | Success | 66 packages installed; audit reported 1 moderate and 1 high vulnerability | `VERIFIED` |
| `frontend\\npm.cmd run build` | Success | Vite 5.4.21; 114 modules; JS 315.12 kB (87.76 kB gzip) | `VERIFIED` |
| Vite dev-server smoke | HTTP 200 | `http://127.0.0.1:5173/` returned HTML containing `id="root"` | `VERIFIED` |
| `backend\\mvnw.cmd spring-boot:run` | Main class not found in fork | Maven's forked classpath is corrupted by the Unicode workspace path; the class exists and compiles | `FAILED` |
| Direct Java main with Maven test classpath and `test` profile | Started | `GET /api/health` returned HTTP 200 and `status=UP` | `VERIFIED` |
| Default-profile application startup | MySQL authentication unavailable | No `DB_PASSWORD` was configured; an earlier default context attempt received MySQL 1045 for `root` | `FAILED` |

Important warnings: npm reports two dependency vulnerabilities. Java 21 reports dynamic Byte Buddy agent loading will be disabled by default in a future release. Spring Security warns that the explicit `AuthenticationProvider` means `UserDetailsService` beans are not auto-used for form login; this is informational for the current JWT setup.

## 2. Test Results

| Suite | Tests | Pass | Fail | What it proves |
| --- | ---: | ---: | ---: | --- |
| `OpenAiProviderTest` | 4 | 4 | 0 | `/responses` payload/parse, usage parse, no retry on 401, retry on 429, empty-structure rejection |
| `EnglishLearningApplicationTests` | 1 | 1 | 0 | Spring context and 107 request mappings load on H2 test profile |
| `AiServiceImplTest` | 2 | 2 | 0 | provider metadata, persistence calls, explicit fallback behavior |
| `AssessmentServiceImplSnapshotTest` | 1 | 1 | 0 | multiple-choice set grading uses start snapshot even after live question changes |
| `AuthServiceImplPasswordResetTest` | 2 | 2 | 0 | identical public response, no token in JSON, hash-only persistence, mail boundary |
| `CommerceServiceImplWebhookTest` | 4 | 4 | 0 | invalid HMAC, expired timestamp and amount mismatch rejection; duplicate webhook idempotency |
| **Total** | **14** | **14** | **0** | No skipped tests |

These tests do not prove a live OpenAI request, live SMTP delivery, the MySQL migration, real payment settlement, browser E2E, or database concurrency behavior.

## 3. Verified Fixes

| Task | Evidence | Status |
| --- | --- | --- |
| Backend clean compile and automated tests | `mvnw.cmd clean test`, 14/14 | `VERIFIED` |
| Frontend production build | Vite build, 114 modules | `VERIFIED` |
| Frontend dev runtime | Local HTTP 200 smoke | `VERIFIED` |
| Backend test-profile runtime | `/api/health` HTTP 200 | `VERIFIED` |
| OpenAI Responses API request/response handling | Official API shape plus mock HTTP boundary test | `VERIFIED` |
| OpenAI 401 non-retry and 429 retry | Call-count assertions | `VERIFIED` |
| Password-reset response contains no raw token | Serialization assertion | `VERIFIED` |
| Password reset stores SHA-256 hash, expiry, one-time field | Unit assertions and entity logic | `VERIFIED` |
| Webhook uses `HmacSHA256` and constant-time comparison | Focused unit tests and `TokenHashUtil` | `VERIFIED` |
| Webhook timestamp and amount validation | Focused unit tests | `VERIFIED` |
| Duplicate webhook returns existing payment | Focused idempotency test | `VERIFIED` |
| Multiple-choice uses exact set equality | Snapshot test with two correct answers | `VERIFIED` |
| Old attempt score is based on immutable snapshot | Live question deliberately differs in snapshot test | `VERIFIED` |

## 4. Implemented but Not Verified

| Task | Missing verification | Status |
| --- | --- | --- |
| Live OpenAI chatbot | `OPENAI_API_KEY` and `AI_MODEL` are absent | `IMPLEMENTED BUT NOT VERIFIED` |
| User/assistant persistence and reload | Repository code and UI exist; no authenticated MySQL/browser E2E | `IMPLEMENTED BUT NOT VERIFIED` |
| Cross-user conversation isolation | Queries include `userId`; no two-user integration test | `IMPLEMENTED BUT NOT VERIFIED` |
| SMTP reset email | Real `JavaMailSender` implementation exists; no mail credentials/server | `IMPLEMENTED BUT NOT VERIFIED` |
| MySQL migration 002 | Migration exists; no DB credentials were available to apply it | `IMPLEMENTED BUT NOT VERIFIED` |
| Pessimistic payment/order/coupon locks | Repository locks compile; no MySQL concurrency test | `IMPLEMENTED BUT NOT VERIFIED` |
| Unique gateway transaction enforcement | Migration exists; not applied to MySQL | `IMPLEMENTED BUT NOT VERIFIED` |
| Teacher ownership and cross-course question checks | Service checks compile; no authenticated integration test | `IMPLEMENTED BUT NOT VERIFIED` |
| Profile and course-publish reload persistence | API wiring builds; no authenticated browser E2E | `IMPLEMENTED BUT NOT VERIFIED` |
| Dark-mode/mobile/accessibility changes already in worktree | Build passes; no visual/browser accessibility audit | `IMPLEMENTED BUT NOT VERIFIED` |

## 5. Not Implemented

- `REAL PAYMENT PROVIDER: NOT IMPLEMENTED`. Payment creation still declares provider `MOCK`; it is not production-ready settlement.
- Full admin dashboard API/data aggregation: `NOT IMPLEMENTED`.
- Role-management list/permission editor UI/API: `NOT IMPLEMENTED` (only per-user role update exists).
- Reports and system-activity frontend/backend flows: `NOT IMPLEMENTED`.
- Teacher revenue, student tracking, and dedicated submission pages: `NOT IMPLEMENTED`; current pages are descriptive templates.
- End-to-end browser automation and real multi-role test accounts: `NOT IMPLEMENTED` in this run.

## 6. Failed Tests

- The final automated test suite has no failed tests: 14 passed, 0 failed.
- `mvn spring-boot:run` is a failed runtime command because the forked JVM receives a broken classpath under the current Unicode path. Direct Java startup proves the built application itself can start.
- Default MySQL startup failed because no DB password/usable test account was supplied.
- MySQL migration execution, live OpenAI, live SMTP, and live payment were not attempted as successful tests and are not marked verified.

## 7. Chatbot Live Integration

Flow:

`ChatbotPage.jsx -> aiService.js -> POST /api/ai/chat -> AiController -> AiServiceImpl -> OpenAiProvider -> POST {OPENAI_BASE_URL}/responses -> ai_messages/ai_conversations -> UI`

| Item | Current value |
| --- | --- |
| Frontend endpoint | `POST /api/ai/chat` through `VITE_API_BASE_URL` (default `/api`) |
| Request | `{ conversationId, topic, level, message }` |
| Response | `{ conversationId, reply, provider, totalTokens, fallback }` inside `ApiResponse.data` |
| Provider endpoint | `${OPENAI_BASE_URL}/responses` |
| Model | Required `AI_MODEL`; no Java/default model string |
| Key | Required backend-only `OPENAI_API_KEY` |
| Fallback | `AI_FALLBACK_ENABLED=false` by default |
| History | `ai_conversations` and `ai_messages`; ownership-scoped repository queries |
| History APIs | GET list/detail and DELETE conversation are wired in UI |

The Responses API is valid and retained after checking the official [OpenAI quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request) and [Responses API reference](https://platform.openai.com/docs/api-reference/responses). Provider errors distinguish 400, 401, 403, 429, 5xx, timeout/connection, empty response, and malformed response. Only 429/5xx and connection failures retry, using bounded exponential backoff.

Environment check: `OPENAI_API_KEY_CONFIGURED=False`, `AI_MODEL_CONFIGURED=False`. Therefore live status is `IMPLEMENTED BUT NOT VERIFIED`, never `VERIFIED`.

## 8. Payment Security

The webhook canonical payload is:

`paymentCode|webhookCode|orderCode|normalizedAmount|gatewayTransactionCode|UPPERCASE_STATUS|epochTimestamp`

It is authenticated with `HmacSHA256` using backend-only `PAYMENT_WEBHOOK_SECRET`. Processing checks secret presence, timestamp age, payment code, order code, amount, gateway transaction uniqueness, webhook uniqueness, canceled/paid order states, and uses pessimistic locks on payment, order, and coupon. The paid transaction encloses payment update, transaction save, order paid, coupon use, ownership/enrollment, invoice, and notification in the service transaction.

Database uniqueness exists or is added for webhook code, coupon/order use, user/course ownership, user/course enrollment, and gateway transaction code. Exact duplicate callbacks return existing state. `PAYMENT_WEBHOOK_SECRET_CONFIGURED=False`, and real provider settlement remains `NOT IMPLEMENTED`.

## 9. Password Reset

The API always returns the same public message for known and unknown email. Raw tokens were removed from `ForgotPasswordResponse` and logs. Only SHA-256 token hashes are stored; expiry and `usedAt` enforce lifetime and one-time use. Successful reset revokes refresh tokens.

`PasswordResetEmailService` now sends the one-time link via Spring Mail. No SMTP credentials were present (`MAIL_CREDENTIALS_CONFIGURED=False`), so `PASSWORD RESET EMAIL DELIVERY: IMPLEMENTED BUT NOT VERIFIED`.

## 10. Assessment Security

- New questions record an owner. Non-admin modification requires owner match.
- A test rejects questions owned by another teacher and exercise questions from another course.
- Every submitted option ID must belong to the requested question.
- Question membership is checked against the attempt snapshot, not the current mutable test.
- Multiple choice compares the complete selected-ID set with the complete correct-ID set.
- Snapshots include question text, points, correct answer, and option correctness at start; answers are hidden from in-progress API responses.
- Snapshot serialization failure aborts attempt creation rather than silently creating a mutable attempt.
- Snapshot grading is verified by a test where live points/correctness are changed after start.

Cross-role HTTP/database E2E remains `IMPLEMENTED BUT NOT VERIFIED`.

## 11. Frontend–Backend Connection Matrix

| Page | Frontend File | API | Backend Endpoint | Data Source | Reload Persists | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Admin Dashboard | `admin/DashboardPage.jsx` | None | None | Configured static stats | No | `NOT IMPLEMENTED` |
| User Management | `admin/UserManagementPage.jsx` | None | Backend exists but unused | Static template | No | `NOT IMPLEMENTED` |
| Teacher Management | `admin/TeacherManagementPage.jsx` | None | Backend exists but unused | Static template | No | `NOT IMPLEMENTED` |
| Role Management | `admin/RoleManagementPage.jsx` | None | Partial per-user role endpoint | Static template | No | `NOT IMPLEMENTED` |
| Reports | `admin/ReportPage.jsx` | None | None | Static template | No | `NOT IMPLEMENTED` |
| System Activity | `admin/SystemActivityPage.jsx` | None | None | Static template | No | `NOT IMPLEMENTED` |
| Course Publish | `admin/CoursePublishPage.jsx` | GET + publish/hide | `/api/admin/courses`, `/{id}/publish`, `/{id}/hide` | Database API | Yes by design | `IMPLEMENTED BUT NOT VERIFIED` |
| Student Profile | `student/ProfilePage.jsx`, `ProfileEditor.jsx` | GET/PUT | `/api/users/profile` | Database API | Yes by design | `IMPLEMENTED BUT NOT VERIFIED` |
| Teacher Profile | `teacher/ProfilePage.jsx`, `ProfileEditor.jsx` | GET/PUT | `/api/users/profile` | Database API | Yes by design | `IMPLEMENTED BUT NOT VERIFIED` |
| Teacher Revenue | `teacher/RevenuePage.jsx` | None | None | Static template | No | `NOT IMPLEMENTED` |
| Student Tracking | `teacher/StudentTrackingPage.jsx` | None | Only aggregate teacher dashboard exists | Static template | No | `NOT IMPLEMENTED` |
| Course Submission | `teacher/CourseSubmissionPage.jsx` | None on this page | Submit endpoint used elsewhere | Static template | No | `NOT IMPLEMENTED` |
| Chatbot | `student/ChatbotPage.jsx` | chat/list/detail/delete/usage | `/api/ai/*` | Database + provider | Yes by design | `IMPLEMENTED BUT NOT VERIFIED` |
| Payment | checkout/order/status pages | create/status/order APIs | `/api/orders`, `/api/payments/*` | Database + mock provider | Partial | `IMPLEMENTED BUT NOT VERIFIED` |
| Question Bank | `teacher/QuestionBankPage.jsx` | create question/exercise/test, results | `/api/teacher/*` | API plus incomplete page state | Partial | `IMPLEMENTED BUT NOT VERIFIED` |
| Vocabulary | student and teacher vocabulary pages | GET/POST/PUT/DELETE/progress | `/api/vocabularies*`, `/api/teacher/vocabularies*` | Database API | Yes by design | `IMPLEMENTED BUT NOT VERIFIED` |
| Grammar | student and teacher grammar pages | GET/POST/PUT/DELETE | `/api/grammar`, `/api/teacher/grammar*` | Database API | Yes by design | `IMPLEMENTED BUT NOT VERIFIED` |

## 12. Database Migrations

New migration: `database/migrations/002_add_test_attempt_snapshot.sql`.

It adds `test_attempts.test_snapshot`, `questions.owner_user_id` with backfill and index, and a unique gateway transaction constraint. `ddl-auto` is restored to `none`; schema changes are not delegated to Hibernate.

Migration execution against MySQL: `IMPLEMENTED BUT NOT VERIFIED` because no database credentials were configured. H2 context creation verifies entity mapping, not MySQL migration syntax or production data backfill.

## 13. Changed Files

| File/group | Change | Reason | Related test |
| --- | --- | --- | --- |
| `ai/OpenAiProvider.java` | Responses API, model env-only, error classes, retry/backoff, strict parsing | Correct live-provider boundary | `OpenAiProviderTest` |
| `AiController`, `AiService`, `AiServiceImpl` | Conversation delete and ownership-scoped history | Complete chatbot history UI | `AiServiceImplTest` (partial) |
| `ChatbotPage.jsx`, `aiService.js` | list/select/delete/new/retry/loading/error/scroll | Required resilient chat UX | Vite build |
| `AuthServiceImpl`, `ForgotPasswordResponse` | no token leak/log; equal message; mail send | Password-reset security | `AuthServiceImplPasswordResetTest` |
| `PasswordResetEmailService.java` | Real Spring Mail boundary | Deliver reset link | Context test; live SMTP pending |
| `PaymentWebhookRequest`, `CommerceServiceImpl` | signed canonical fields, validation, idempotency, transactional fulfillment | Webhook/payment security | `CommerceServiceImplWebhookTest` |
| Payment/order/coupon repositories | pessimistic locks and uniqueness lookup | Concurrent callback/coupon defense | Compile/unit; DB concurrency pending |
| `Question`, `TestAttempt`, assessment DTO/repository/service | ownership, snapshot, option validation, exact multi-select grading | Assessment integrity | `AssessmentServiceImplSnapshotTest` |
| `002_add_test_attempt_snapshot.sql` | snapshot/owner/gateway uniqueness migration | Persist schema changes | MySQL execution pending |
| `ProfileEditor`, profile pages, `userService.js` | real profile GET/PUT | Replace static/local UI | Vite build |
| `CoursePublishPage.jsx`, `courseService.js` | real list/publish/hide API | Remove hard-coded local-state page | Vite build |
| `application.yml`, `.env.example` | safe AI/payment/mail config; `ddl-auto:none` | No secret/model hard-coding | Context test/grep |
| `pom.xml`, test profile/resources | Spring Mail and H2 test dependency | Mail integration and deterministic tests | 14-test suite |
| New test files | provider, payment, reset, snapshot tests | Regression evidence | 14-test suite |
| Teacher grammar/vocabulary/question pages and `global.css` | These were already modified before this verification run | Existing worktree changes retained | Build only |

Initial worktree inspection found logic changes mixed with generated `backend/target` files and UI/CSS changes. Generated class/resource differences are build artifacts, not logic fixes. `.vscode/settings.json` was also already modified and was not treated as a product fix.

## 14. Remaining Risks

- No live OpenAI response, authenticated conversation reload, or cross-user E2E was possible.
- No real payment provider exists; a secured mock webhook is still a mock.
- No MySQL migration/concurrency test was possible without credentials.
- No live SMTP delivery was possible.
- Several admin/teacher pages remain static templates or local-only UI.
- npm reports one high and one moderate vulnerability; upgrades need compatibility review rather than an unreviewed forced update.
- `spring-boot:run` is unreliable from the current Unicode workspace path on this Windows Maven fork. Moving/cloning to an ASCII-only path or fixing wrapper/JVM encoding should be evaluated.
- Visual contrast, keyboard traversal, screen-reader behavior, mobile breakpoints, and `backdrop-filter` performance were not browser-audited.

## 15. Environment Variables

Required/important variables:

```env
DB_URL=jdbc:mysql://localhost:3306/english_learning?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh
DB_USERNAME=...
DB_PASSWORD=...

OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL=...
AI_FALLBACK_ENABLED=false
AI_TIMEOUT_SECONDS=20
AI_MAX_RETRIES=2

PAYMENT_WEBHOOK_SECRET=...
PAYMENT_WEBHOOK_MAX_AGE_SECONDS=300

RESET_PASSWORD_URL=http://localhost:5173/reset-password
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_SMTP_AUTH=true
MAIL_STARTTLS=true
```

Do not put OpenAI, payment, JWT, database, or mail secrets in frontend variables or commit them.

## 16. Run Instructions

1. Apply `001_create_schema.sql` to a new database, or apply `002_add_test_attempt_snapshot.sql` to the existing schema after taking a backup.
2. Configure backend environment variables from `.env.example`; choose a model available to the configured OpenAI project via `AI_MODEL`.
3. Run backend tests: `cd backend` then `.\\mvnw.cmd clean test`.
4. Start backend from an ASCII-only checkout path with `.\\mvnw.cmd spring-boot:run`. In the current Unicode path, use an IDE run configuration or direct Java classpath until the wrapper/fork issue is resolved.
5. Install/build frontend: `cd frontend`, `npm.cmd install`, `npm.cmd run build`.
6. Start frontend: `npm.cmd run dev`.
7. For live chatbot acceptance, set `OPENAI_API_KEY`, `AI_MODEL`, `OPENAI_BASE_URL=https://api.openai.com/v1`, and `AI_FALLBACK_ENABLED=false`; verify HTTP success, `provider=openai`, `fallback=false`, DB persistence, reload, and two-user isolation.
8. For password-reset acceptance, configure SMTP and verify receipt, expiry, one-time use, and identical public responses.
9. Do not treat the mock payment flow as production payment acceptance.
