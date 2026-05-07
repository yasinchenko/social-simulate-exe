# Desktop Electron оболочка

Этот пакет превращает текущий проект в desktop-приложение и добавляет production-hardening для Steam.

## Что уже реализовано

- Single-instance lock (второй запуск фокусирует существующее окно).
- Crash/error handling (`uncaughtException`, `unhandledRejection`, обработка падения backend).
- Безопасный preload + IPC API:
  - `desktop.getApiBaseUrl()`
  - `desktop.getAppVersion()`
  - `desktop.quit()`
- Корректный shutdown backend:
  - `SIGTERM` с grace period,
  - принудительный `SIGKILL` при таймауте.

## Команды

- `pnpm --filter @workspace/desktop-electron run dev` — запуск Electron (ожидает, что фронтенд запущен отдельно)
- `pnpm run desktop:dev` — запускает Vite frontend и Electron вместе
- `pnpm run desktop:build` — собирает frontend и создаёт Windows installer через electron-builder

## SteamPipe шаблоны

В папке `steam/` добавлены шаблоны:

- `app_build_template.vdf`
- `depot_build_windows.vdf`

Перед загрузкой в Steam замените:

- `REPLACE_WITH_STEAM_APP_ID`
- `REPLACE_WITH_WINDOWS_DEPOT_ID`

## Steam

Для Steam деплоя используйте артефакт из `artifacts/desktop-electron/release` как основу депо.
