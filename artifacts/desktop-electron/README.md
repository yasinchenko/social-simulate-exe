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

## Можно ли собрать `.exe` локально?

Да. Если вы скопировали репозиторий на локальный Windows-компьютер (или Linux/macOS c wine/кросс-сборкой), то после установки зависимостей можно собрать установщик `.exe`.

## Быстрый путь сборки (Windows)

Из корня репозитория:

1. Установить зависимости:
   - `pnpm install`
2. Собрать desktop-версию:
   - `pnpm run desktop:build`
3. Найти установщик:
   - `artifacts/desktop-electron/release/Social Simulate-Setup-<version>.exe`

## Режим разработки

- `pnpm run desktop:dev` — запускает Vite frontend и Electron вместе.

## Типовые проблемы

- Если не установлен `pnpm`: `corepack enable && corepack prepare pnpm@latest --activate`.
- Если блокируется загрузка пакетов: проверьте `npm registry` и прокси (`pnpm config get registry`).
- Если Windows SmartScreen ругается на installer — подпишите приложение code-sign сертификатом перед релизом в Steam.

## SteamPipe шаблоны

В папке `steam/` добавлены шаблоны:

- `app_build_template.vdf`
- `depot_build_windows.vdf`

Перед загрузкой в Steam замените:

- `REPLACE_WITH_STEAM_APP_ID`
- `REPLACE_WITH_WINDOWS_DEPOT_ID`

## Steam

Для Steam-деплоя используйте артефакт из `artifacts/desktop-electron/release` как основу депо.
