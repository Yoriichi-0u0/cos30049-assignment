# Project Notes

Demo-safe folder:

```text
/Users/chiayuenkai/Desktop/GitHub/my-react-app1
```

This copy is prepared for lecturer demonstration. Do not use Git commands in this folder unless the copy is intentionally reconnected to a repository.

## Architecture Snapshot

- Root hub: `http://localhost:5173`
- Park Guide web portal: `user_page`, Vite, `http://localhost:5175/user`
- Admin portal: `admin_page`, Vite, `http://localhost:5174/admin`
- Admin Incident Detection: `http://localhost:5174/admin/detection`
- Park Ranger Alert Console: `http://localhost:5174/admin/ranger`
- Mobile preview: `mobile_app`, Expo web, `http://localhost:8081`
- Backend API: `user_login/server`, Express, `http://localhost:4000`
- AI camera script: `scripts/run_ai_camera_monitor.py`
- Evidence folder: `alerts/ai`
- MySQL database for monitoring incidents only: `cos30049_assignment`

The training platform is seeded frontend demo data. The backend and MySQL integration are scoped to AI/IoT monitoring incidents only.

## Expected Local Structure

```text
my-react-app1/
├── .venv/
├── artifacts/clip_2class_touching_species.pt
├── datasets/touching-plants/
├── datasets/touching-wildlife/
├── models/hand_landmarker.task
└── alerts/ai/
```

`.venv`, `artifacts`, `datasets`, and `models` are local-only. `alerts/ai` is intentionally retained for curated demo evidence.

## Project Scope Audit

| Requirement | Status | Notes |
| --- | --- | --- |
| User/Park Guide portal | Done / Demo-ready | Dashboard, module catalog, module detail, quiz, progress, certificates, notifications, schedule, resources, profile, help, and User01/User02/User03 switcher. |
| Mobile app preview | Partially done / Demo-ready | Expo web preview exists for mobile-facing evidence. Some mobile screens are simpler than the web portal. |
| Admin dashboard | Done / Demo-ready | Admin app remains available at `/admin`. Incident dashboard is separate at `/admin/detection`. |
| Login/Register/Forgot Password | Partially done / Demo-ready | Demo flow exists for presentation. It is not production authentication. |
| Admin Incident Detection | Done / Demo-ready | Shows AI_CAMERA and IOT_SENSOR incidents, summary cards, filters, table, selected detail panel, AI evidence, AI metadata, IoT metadata, fallback/live states, and status updates. |
| Park Ranger Alert Console | Done / Demo-ready | Response-only view with urgent/new incidents, evidence, metadata, field notes, and Acknowledged/In Review/Resolved/False Alarm actions. |
| Backend API health | Done / Demo-ready | `/api/health` reports storage status and degraded fallback when needed. |
| AI camera monitor | Done / Demo-ready | Supports `--project-dir`, `--evidence-dir`, `--camera-index`, `--backend-url`, JPG/JSON evidence, backend POST, and safe shutdown. |
| IoT MQTT simulation | Done / Demo-ready | `npm run publish:test-iot` publishes ObjectCloseToPlant style payloads to `ctip/sensor/plant-zone-01/proximity`. |
| MySQL incident persistence | Done / Demo-ready | Optional `INCIDENT_STORAGE=mysql` mode uses `cos30049_assignment` and monitoring tables. Memory mode remains default. |
| Cybersecurity and data protection | Partially done / Demo-ready notes | `.env.example`, ignored real env files, browser-safe evidence URLs, source/status validation, role boundaries, and production hardening notes are documented. |
| Evidence/report screenshots | Done / Demo-ready | README and WORKFLOW include screenshot checklist and exact URLs/commands. |

## Monitoring Incident Contract

Supported sources:

```text
AI_CAMERA
IOT_SENSOR
```

Supported event types:

```text
TouchingPlants
TouchingWildlife
ObjectCloseToPlant
```

Supported statuses:

```text
New
Reviewed
Acknowledged
In Review
Resolved
False Alarm
```

Frontend evidence must use browser-safe URLs such as:

```text
/evidence/ai/example.jpg
```

Absolute local paths such as `/Users/...` should not be returned to the frontend.

## Security Notes

- Real `.env` files must remain local.
- Database credentials are loaded from environment variables, not hardcoded source.
- The backend validates allowed incident source and status values.
- Admin, Park Ranger, and Park Guide role boundaries are clearly shown in the demo.
- Production MQTT should use a private broker with authentication and TLS.
- Production AI camera and IoT ingestion should require HTTPS and device tokens.
- SSDLC/vulnerability assessment evidence can reference this notes file, `.env.example`, validation code, role-boundary screenshots, and API health/error behavior.

## Recent Demo Prep Changes

- Localized runbook and notebook examples to `/Users/chiayuenkai/Desktop/GitHub/my-react-app1`.
- Updated the root hub with direct links for Login/Register, Park Guide, Admin, Admin Detection, Park Ranger, Mobile Preview, API Health, Incidents API, and Incidents Summary API.
- Polished Admin Incident Detection for clearer summary cards, filters, table readability, selected detail panel, evidence preview, metadata, loading, empty, and offline fallback states.
- Polished Park Ranger Console as a response-only field console with urgent incidents, field notes, status actions, and role boundaries.
- Added a demo-safe IoT test publisher fallback: MQTT remains the first path, but public-broker timeouts can fall back to the local incidents API with the same IOT_SENSOR payload.
- Updated documentation for memory mode, MySQL mode, AI camera runtime, IoT simulation, cybersecurity notes, and final screenshot evidence.
