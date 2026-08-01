import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

function fail(message) {
  console.error(`\n[frontend:dev] ${message}`);
  process.exit(1);
}

function runInstallIfNeeded() {
  const nodeModulesPath = join(rootDir, "node_modules");

  if (existsSync(nodeModulesPath)) {
    console.log("[frontend:dev] node_modules already exists.");
    return;
  }

  console.log("[frontend:dev] node_modules not found. Running npm install...");
  const result = spawnSync(npmCommand, ["install"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: isWindows,
  });

  if (result.error) {
    fail(`Failed to run npm install: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`npm install exited with code ${result.status}.`);
  }
}

async function startVite() {
  console.log("[frontend:dev] Starting Vite dev server...");

  const portArgIdx = process.argv.indexOf("--port");
  const port = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? parseInt(process.argv[portArgIdx + 1], 10) : 5173;

  const server = await createServer({
    root: rootDir,
    configFile: join(rootDir, "vite.config.js"),
    server: {
      host: "localhost",
      port: port,
    },
  });

  await server.listen();
  server.printUrls();

  const close = async () => {
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

runInstallIfNeeded();
startVite().catch((error) => {
  fail(error.message);
});
