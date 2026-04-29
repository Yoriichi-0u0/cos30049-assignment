# TODO / Demo Readiness Checklist

Working folder:

```text
/Users/chiayuenkai/Desktop/GitHub/my-react-app1
```

Do not run Git commands in this duplicated demo copy.

## Project Scope Checklist

| Area | Status | Demo check |
| --- | --- | --- |
| User/Park Guide portal | Done / Demo-ready | Open `http://localhost:5175/user`; switch User01/User02/User03; show dashboard, modules, quiz, progress, certificates, notifications, schedule, resources, profile, and help. |
| Mobile app preview | Partially done / Demo-ready | Open `http://localhost:8081`; show mobile-style access to training/account surfaces. |
| Admin dashboard | Done / Demo-ready | Open `http://localhost:5174/admin`; confirm admin landing page loads. |
| Login/Register/Forgot Password | Partially done / Demo-ready | Use `http://localhost:5175/user` or hub Login/Register link; explain this is demo auth, not production auth. |
| Admin Incident Detection | Done / Demo-ready | Open `http://localhost:5174/admin/detection`; show AI and IoT rows, summary cards, filters, evidence, metadata, fallback/live states, and status update. |
| Park Ranger Alert Console | Done / Demo-ready | Open `http://localhost:5174/admin/ranger`; show response-only role, urgent incidents, field notes, and action buttons. |
| Backend API health | Done / Demo-ready | `curl http://localhost:4000/api/health`. |
| AI camera monitor | Done / Demo-ready | Run `scripts/run_ai_camera_monitor.py` from local `.venv`; press `q` or ESC to stop safely. |
| IoT MQTT simulation | Done / Demo-ready | Run `cd user_login/server && npm run publish:test-iot`; it tries MQTT first and can fall back to local API simulation if the public broker times out. Check `/api/incidents`. |
| MySQL incident persistence | Done / Demo-ready | Apply migration, run `INCIDENT_STORAGE=mysql`, query `monitoring_incidents`. |
| Cybersecurity and data protection | Partially done / Demo-ready notes | Show `.env.example`, role boundaries, browser-safe evidence URLs, validation behavior, and production hardening recommendations. |
| Evidence/report screenshots | Done / Demo-ready | Use README and WORKFLOW screenshot checklist. |
| Citrus Energetic UI consistency | Done / Demo-ready | Hub, User Portal, Admin Dashboard, Admin Detection, Park Ranger, and Mobile preview now share the same forest/citrus/cream/lime visual system. |
| Shared demo logo | Done / Demo-ready | Generated logo mark is optimized and applied to the Hub, login surfaces, User Portal, Admin shell, Park Ranger route, and Mobile preview. |
| Frontend image optimization | Done / Demo-ready | Generated hub hero is 136 KB; training images are WebP files below 100 KB each; `alerts/ai` evidence remains untouched. |

## Before Lecturer Demo

- [ ] Run `npm install` from `/Users/chiayuenkai/Desktop/GitHub/my-react-app1`.
- [ ] Recreate `.venv` inside this folder if needed.
- [ ] Confirm `artifacts/clip_2class_touching_species.pt` exists locally.
- [ ] Confirm `models/hand_landmarker.task` exists locally.
- [ ] Confirm `alerts/ai` contains a few clean demo JPG/JSON evidence pairs.
- [ ] Run `npm --prefix user_page run build`.
- [ ] Run `npm --prefix admin_page run build`.
- [ ] Run `node --check user_login/server/index.js`.
- [ ] Run `node --check scripts/dev-all.mjs`.
- [ ] Run `source .venv/bin/activate && python -m py_compile scripts/run_ai_camera_monitor.py`.
- [ ] Run backend API checks in memory mode.
- [ ] If showing persistence, create `cos30049_assignment`, apply migration, and run MySQL mode.
- [ ] Capture screenshots listed in README/WORKFLOW.
- [ ] Confirm the shared Citrus logo is visible in the hub, User Portal sidebar, Admin sidebar, Park Ranger page through Admin, and Mobile preview.
- [ ] Manually review the UI surfaces for final screenshot framing after starting `npm run dev`.

## Intentionally Deferred

- Full training platform persistence in MySQL.
- Production-grade authentication and password reset.
- Device-token authentication for AI camera and IoT ingestion.
- Private MQTT broker with TLS/authentication.
- Automated sync from memory fallback incidents into MySQL.
- Further AI threshold/model retraining.

## Quick Safety Checks

Local-only folders should stay local:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
find . -path './.git' -prune -o -name '.DS_Store' -print
```

Expected: no output outside `.git`.

Check old paths are gone:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
rg "<old absolute repo path>"
```

Expected: no old absolute runbook paths.
