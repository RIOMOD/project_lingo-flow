import { build } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");

build({
  root: rootDir,
  configFile: false,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
