# Desktop Electron оболочка

Этот пакет превращает текущий проект в desktop-приложение:

- запускает backend `@workspace/api-server` как локальный процесс (на `PORT`, по умолчанию `4123`),
- ждёт готовность `/api/healthz`,
- открывает UI `@workspace/life-sim` в окне Electron.

## Команды

- `pnpm --filter @workspace/desktop-electron run dev` — запуск Electron (ожидает, что фронтенд запущен отдельно)
- `pnpm run desktop:dev` — запускает Vite frontend и Electron вместе
- `pnpm run desktop:build` — собирает frontend и создаёт Windows installer через electron-builder

## Steam

Для Steam деплоя используйте артефакт из `artifacts/desktop-electron/release` как основу депо.
