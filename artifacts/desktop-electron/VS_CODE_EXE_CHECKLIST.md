# Чек-лист: сборка EXE через VS Code

Ниже — пошаговый сценарий для локальной Windows-машины.

## 1) Подготовка окружения

- [ ] Установлен **Node.js 20 LTS** (или новее).
- [ ] В PowerShell выполняется `node -v`.
- [ ] Включён Corepack: `corepack enable`.
- [ ] Активирован pnpm: `corepack prepare pnpm@latest --activate`.
- [ ] В терминале VS Code выполняется `pnpm -v`.

## 2) Открытие проекта в VS Code

- [ ] Открыт корень репозитория `social-simulate-exe` (не подпапка).
- [ ] Терминал VS Code открыт в корне проекта.
- [ ] Проверка: `git status` не показывает незавершённых конфликтов.

## 3) Установка зависимостей

- [ ] Выполните: `pnpm install`.
- [ ] Если есть ошибки доступа к registry, проверьте `pnpm config get registry`.

## 4) Быстрая проверка перед сборкой

- [ ] Выполните: `pnpm --filter @workspace/desktop-electron run typecheck`.
- [ ] Выполните (опционально): `pnpm run typecheck`.

## 5) Сборка EXE

- [ ] Запустите из корня: `pnpm run desktop:build`.
- [ ] Дождитесь завершения `electron-builder` без ошибок.

## 6) Где лежит результат

- [ ] Откройте папку: `artifacts/desktop-electron/release`.
- [ ] Найдите файл вида: `Social Simulate-Setup-<version>.exe`.

## 7) Smoke-test установщика

- [ ] Запустите `.exe`.
- [ ] Установите приложение.
- [ ] Убедитесь, что открывается окно приложения и UI загружается.
- [ ] Проверьте, что backend доступен через встроенный health-check (приложение стартует без ошибки backend).

## 8) Если сборка не идёт

- [ ] Ошибка `@types/node`/`node_modules missing` → снова `pnpm install`.
- [ ] Ошибки сети/403/registry → сменить registry/прокси и повторить `pnpm install`.
- [ ] Предупреждение SmartScreen на Windows — ожидаемо для неподписанного сборочного инсталлятора; для релиза нужен code-sign сертификат.

## 9) Подготовка к Steam (после локального smoke-test)

- [ ] Использовать артефакт из `artifacts/desktop-electron/release`.
- [ ] Заполнить шаблоны в `artifacts/desktop-electron/steam/`:
  - `app_build_template.vdf`
  - `depot_build_windows.vdf`
- [ ] Подставить реальные `AppID` и `DepotID`.
