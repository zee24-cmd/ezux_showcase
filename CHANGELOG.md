# Changelog - ezux-showcase

All notable changes to this project will be documented in this file.

## [1.1.13] - 2026-03-01

### Refactored
- **AppShell Compliance**: Rewrote `App.tsx` and moved `EzLayout` to the global entry point to satisfy `pre_flight_compliance.py` requirements.
- **Service Registry Integration**: Registered `DataWorkerService` globally within the `EzUX` service registry, removing direct imports in demos where possible.
- **IService Compliance**: Added `name` property to `DataWorkerService` for proper registration.
- **Global Provider Structure**: Refined `EzProvider` wrapping and service initialization via `AppServiceInit`.
