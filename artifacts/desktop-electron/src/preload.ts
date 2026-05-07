import { contextBridge, ipcRenderer } from "electron";

const api = {
  getApiBaseUrl: () => ipcRenderer.invoke("desktop:get-api-base-url") as Promise<string>,
  getAppVersion: () => ipcRenderer.invoke("desktop:get-app-version") as Promise<string>,
  quit: () => ipcRenderer.send("desktop:quit"),
};

contextBridge.exposeInMainWorld("desktop", api);

export type DesktopApi = typeof api;
