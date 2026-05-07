import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const apiPort = process.env.DESKTOP_API_PORT ?? "4123";
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
let backend: ChildProcess | null = null;
let isQuitting = false;

const lock = app.requestSingleInstanceLock();
if (!lock) {
  app.quit();
}

function getRepoRoot() {
  return path.resolve(__dirname, "../../..");
}

function getPreloadPath() {
  return path.resolve(__dirname, "preload.js");
}

function startBackend() {
  if (backend) return;

  const repoRoot = getRepoRoot();
  const command = "pnpm";
  const args = isDev
    ? ["--filter", "@workspace/api-server", "run", "dev"]
    : ["--filter", "@workspace/api-server", "run", "start"];

  backend = spawn(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: apiPort,
      NODE_ENV: isDev ? "development" : "production",
    },
  });

  backend.on("exit", (code, signal) => {
    console.log(`[desktop] api-server exited code=${code} signal=${signal}`);
    backend = null;
    if (!isQuitting) {
      dialog.showErrorBox(
        "Backend stopped",
        "Локальный сервер симуляции завершился. Приложение будет закрыто.",
      );
      app.quit();
    }
  });

  backend.on("error", (err) => {
    console.error("[desktop] failed to spawn api-server", err);
  });
}

async function stopBackend(graceMs = 8000) {
  const proc = backend;
  if (!proc || proc.killed) return;

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (!proc.killed) proc.kill("SIGKILL");
      resolve();
    }, graceMs);

    proc.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    proc.kill("SIGTERM");
  });
}

async function waitForApiReady(timeoutMs = 45_000) {
  const started = Date.now();
  const url = `${apiBaseUrl}/api/healthz`;

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
    title: "Social Simulate",
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  if (isDev) {
    win.loadURL("http://127.0.0.1:5173").catch(console.error);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const rendererPath = path.resolve(getRepoRoot(), "artifacts/life-sim/dist/index.html");
    win.loadFile(rendererPath).catch(console.error);
  }
}

function registerIpc() {
  ipcMain.handle("desktop:get-api-base-url", () => apiBaseUrl);
  ipcMain.handle("desktop:get-app-version", () => app.getVersion());
  ipcMain.on("desktop:quit", () => app.quit());
}

process.on("uncaughtException", (err) => {
  console.error("[desktop] uncaught exception", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[desktop] unhandled rejection", reason);
});

app.on("second-instance", () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(async () => {
  registerIpc();
  startBackend();
  await waitForApiReady();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((err) => {
  console.error("[desktop] failed to start", err);
  dialog.showErrorBox("Startup error", `Не удалось запустить приложение: ${String(err)}`);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async (event) => {
  if (isQuitting) return;
  isQuitting = true;
  event.preventDefault();
  await stopBackend();
  app.exit(0);
});
