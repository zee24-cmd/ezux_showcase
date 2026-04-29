# Changelog - ezux-showcase

All notable changes to this project will be documented in this file.

## [1.1.15] - 2026-04-29

### Fixed
- Added an `ezux` compatibility barrel for root, advanced, and layout subpath exports.
- Updated showcase imports for the `ezux@1.1.15` public API.
- Replaced removed Lucide icon exports with current icon names.
- Updated `EzTable` field validation to use the current `field` parameter.
- Converted Vite `manualChunks` to the function form required by the current build pipeline.
- Removed the ineffective dynamic import warning for `ShowcaseHome`.
- Defaulted the showcase to light mode on app startup.
- Wired logout actions in the active shell header, profile menu, and sidebar footer.
- Fixed sidebar footer collapse/expand by using the layout toggle service.

### Added
- Added an `EzFlow` workflow builder demo with validation, save, publish, and export actions.
- Added Playwright smoke tests for home, table, scheduler, kanban, signature, and flow routes.
- Added CI checks for install, build, and smoke tests.

### Changed
- Enabled TanStack Router auto code splitting and deferred raw source loading until the Code tab is opened.

## [1.1.14] - 2026-03-11

### Changed
- Bumped the showcase package version to `1.1.14` with matching dependency updates.
- Added the `ShowcaseShell` layout and updated route wiring for the app shell.
- Documented resizable `EzLayout` sidebar props.
- Added an imperative `EzLayout` demo wrapper and refreshed the tree view demo.

## [1.1.13] - 2026-03-01

### Refactored
- **AppShell Compliance**: Rewrote `App.tsx` and moved `EzLayout` to the global entry point to satisfy `pre_flight_compliance.py` requirements.
- **Service Registry Integration**: Registered `DataWorkerService` globally within the `EzUX` service registry, removing direct imports in demos where possible.
- **IService Compliance**: Added `name` property to `DataWorkerService` for proper registration.
- **Global Provider Structure**: Refined `EzProvider` wrapping and service initialization via `AppServiceInit`.
