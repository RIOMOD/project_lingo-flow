const { chromium } = require("playwright");

const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const password = "Password123!";

const roles = [
  {
    role: "student",
    email: "student2@example.com",
    paths: [
      "/student", "/student/courses", "/student/path", "/student/exercises",
      "/student/tests", "/student/vocabulary", "/student/grammar",
      "/student/pronunciation", "/student/chatbot", "/student/writing",
      "/student/progress", "/student/leaderboard", "/student/cart",
      "/student/orders", "/student/profile", "/student/settings",
    ],
  },
  {
    role: "teacher",
    email: "teacher@example.com",
    paths: [
      "/teacher", "/teacher/courses", "/teacher/courses/create",
      "/teacher/lessons", "/teacher/vocabulary", "/teacher/grammar", "/teacher/question-bank",
      "/teacher/submission", "/teacher/students", "/teacher/revenue",
      "/teacher/profile",
    ],
  },
  {
    role: "admin",
    email: "admin@example.com",
    paths: [
      "/admin", "/admin/users", "/admin/teachers", "/admin/roles",
      "/admin/system-activity", "/admin/course-approval", "/admin/course-publish",
      "/admin/orders", "/admin/transactions", "/admin/coupons",
      "/admin/refunds", "/admin/reports",
    ],
  },
];

async function login(page, account) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.locator("input[name=email]").fill(account.email);
  await page.locator("input[name=password]").fill(password);
  await page.locator("button.auth-submit").click();
  await page.waitForURL(`**/${account.role}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  try {
    for (const account of roles) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      let activeResult = null;

      page.on("pageerror", (error) => {
        if (activeResult) activeResult.javascriptErrors.push(error.message);
      });
      page.on("console", (message) => {
        if (activeResult && message.type() === "error") {
          activeResult.consoleErrors.push(message.text());
        }
      });
      page.on("requestfailed", (request) => {
        if (activeResult) {
          activeResult.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`);
        }
      });
      page.on("response", (response) => {
        if (activeResult && response.url().includes("/api/") && response.status() >= 400) {
          activeResult.apiErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
        }
      });

      await login(page, account);

      const paths = [...account.paths];
      if (account.role === "teacher") {
        await page.goto(`${baseUrl}/teacher/courses`, { waitUntil: "domcontentloaded" });
        const editPath = await page.locator('a[href^="/teacher/courses/"][href$="/edit"]').first().getAttribute("href");
        if (editPath) paths.push(editPath);
      }

      for (const path of paths) {
        activeResult = {
          role: account.role,
          path,
          expectedPath: path,
          finalPath: "",
          javascriptErrors: [],
          consoleErrors: [],
          failedRequests: [],
          apiErrors: [],
          errorBoundary: false,
          blankMain: false,
          visibleError: false,
        };
        await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(900);
        activeResult.finalPath = new URL(page.url()).pathname;
        activeResult.errorBoundary = await page.locator(".error-boundary").count() > 0;
        const main = page.locator("main.app-main");
        activeResult.blankMain = await main.count() === 0 || (await main.innerText()).trim().length === 0;
        activeResult.visibleError = await page.locator(".auth-error").count() > 0;
        report.push(activeResult);
      }

      const homePath = `/${account.role}`;
      const accountFooter = {
        student: { label: "Settings", expectedPath: "/student/settings" },
        teacher: { label: "Profile", expectedPath: "/teacher/profile" },
        admin: { label: "Roles", expectedPath: "/admin/roles" },
      }[account.role];
      const footerChecks = [
        { label: "Support", expectedPath: "/contact" },
        accountFooter,
      ];

      for (const check of footerChecks) {
        activeResult = {
          role: account.role,
          path: `footer:${check.label}`,
          expectedPath: check.expectedPath,
          finalPath: "",
          javascriptErrors: [], consoleErrors: [], failedRequests: [], apiErrors: [],
          errorBoundary: false, blankMain: false, visibleError: false,
        };
        await page.goto(`${baseUrl}${homePath}`, { waitUntil: "domcontentloaded" });
        await page.locator(".app-sidebar-footer .app-footer-btn", { hasText: check.label }).click();
        await page.waitForURL(`**${check.expectedPath}`);
        activeResult.finalPath = new URL(page.url()).pathname;
        report.push(activeResult);
      }

      const forbiddenPaths = account.role === "student"
        ? ["/teacher", "/admin"]
        : account.role === "teacher" ? ["/student", "/admin"] : [];
      for (const path of forbiddenPaths) {
        activeResult = {
          role: account.role,
          path: `forbidden:${path}`,
          expectedPath: "/",
          finalPath: "",
          javascriptErrors: [], consoleErrors: [], failedRequests: [], apiErrors: [],
          errorBoundary: false, blankMain: false, visibleError: false,
        };
        await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(300);
        activeResult.finalPath = new URL(page.url()).pathname;
        report.push(activeResult);
      }

      activeResult = null;
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const failures = report.filter((item) =>
    item.finalPath !== item.expectedPath
    || item.javascriptErrors.length
    || item.failedRequests.length
    || item.apiErrors.length
    || item.errorBoundary
    || item.blankMain
    || item.visibleError
  );
  const summary = {
    checkedPages: report.length,
    passedPages: report.length - failures.length,
    failedPages: failures.length,
    failures,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
