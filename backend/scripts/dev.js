const { copyFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const rootDir = join(__dirname, "..");
const isWindows = process.platform === "win32";

function fail(message) {
  console.error(`\n[backend:dev] ${message}`);
  process.exit(1);
}

function runCheck(command, args, missingMessage) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "ignore",
    shell: false,
  });

  if (result.error && result.error.code === "ENOENT") {
    fail(missingMessage);
  }

  if (result.status !== 0) {
    fail(missingMessage);
  }
}

function run(command, args, message) {
  console.log(`[backend:dev] ${message}`);
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    fail(`Failed to run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} exited with code ${result.status}.`);
  }
}

function ensureEnvFile() {
  const envPath = join(rootDir, ".env");
  const examplePath = join(rootDir, ".env.example");

  if (existsSync(envPath)) {
    console.log("[backend:dev] .env already exists.");
    return;
  }

  if (!existsSync(examplePath)) {
    fail("Missing .env.example, cannot create .env.");
  }

  copyFileSync(examplePath, envPath);
  console.log("[backend:dev] Created .env from .env.example.");
}

function dockerInspectHealth(containerName) {
  const result = spawnSync(
    "docker",
    ["inspect", "-f", "{{.State.Health.Status}}", containerName],
    {
      cwd: rootDir,
      encoding: "utf8",
      shell: false,
    }
  );

  if (result.status !== 0) {
    return "starting";
  }

  return result.stdout.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMysql() {
  const containerName = "lingo-flow-mysql";
  const timeoutMs = 120000;
  const startedAt = Date.now();

  console.log("[backend:dev] Waiting for MySQL healthcheck...");

  while (Date.now() - startedAt < timeoutMs) {
    const health = dockerInspectHealth(containerName);

    if (health === "healthy") {
      console.log("[backend:dev] MySQL is healthy.");
      return;
    }

    if (health === "unhealthy") {
      fail("MySQL container is unhealthy. Check Docker logs with: docker compose logs mysql");
    }

    await sleep(2000);
  }

  fail("Timed out waiting for MySQL healthcheck.");
}

function startSpringBoot() {
  const command = isWindows ? "mvnw.cmd" : "./mvnw";
  const commandPath = join(rootDir, command);

  if (!existsSync(commandPath)) {
    fail(`Missing Maven Wrapper: ${command}`);
  }

  console.log("[backend:dev] Starting Spring Boot with Maven Wrapper...");
  const child = spawn(commandPath, ["spring-boot:run"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: isWindows,
  });

  child.on("error", (error) => {
    fail(`Failed to start Maven Wrapper: ${error.message}`);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.exit(0);
    }
    process.exit(code ?? 0);
  });
}

async function main() {
  runCheck("java", ["-version"], "Java was not found. Install Java 21 and make sure it is available in PATH.");
  ensureEnvFile();
  runCheck("docker", ["--version"], "Docker was not found. Install Docker Desktop and make sure it is available in PATH.");
  runCheck("docker", ["compose", "version"], "Docker Compose was not found. Install or update Docker Desktop.");

  run("docker", ["compose", "up", "-d"], "Starting Docker services...");
  await waitForMysql();
  startSpringBoot();
}

main().catch((error) => {
  fail(error.message);
});
