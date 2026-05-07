import { app, BrowserWindow } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";
const apiPort = process.env.DESKTOP_API_PORT ?? "4123";
let backend: ChildProcess | null = null;

function getRepoRoot() {
  return path.resolve(__dirname, "../../..");
}

function startBackend() {
  const repoRoot = getRepoRoot();
  backend = spawn(
    "pnpm",
    ["--filter", "@workspace/api-server", "run", "dev"],
    {
      cwd: repoRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        PORT: apiPort,
      },
    },
  );

  backend.on("exit", (code) => {
    console.log(`[desktop] api-server exited with code ${code}`);
  });
}

async function waitForApiReady(timeoutMs = 45_000) {
  const started = Date.now();
  const url = `http://127.0.0.1:${apiPort}/api/healthz`;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // noop
    }
    await new Promise((r) => setTimeout(r, 750));
  }

  throw new Error(`API did not become ready within ${timeoutMs}ms (${url})`);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 760,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Social Simulate",
  });

  if (isDev) {
    win.loadURL("http://127.0.0.1:5173").catch(console.error);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const rendererPath = path.resolve(getRepoRoot(), "artifacts/life-sim/dist/index.html");
    win.loadFile(rendererPath).catch(console.error);
  }
}

app.whenReady().then(async () => {
  startBackend();
  await waitForApiReady();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((err) => {
  console.error("[desktop] failed to start", err);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backend && !backend.killed) {
    backend.kill("SIGTERM");
  }
});
