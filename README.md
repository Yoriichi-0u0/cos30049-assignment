# COS30049 SFC Digital Training and AI/IoT Monitoring Demo

Demo-safe local copy:

```text
/Users/chiayuenkai/Desktop/GitHub/my-react-app1
```

This folder is prepared as the lecturer demo copy. Do not use Git commands from this duplicate unless you intentionally turn it back into a repository.

## Current Status

This project demonstrates the three Project Scope areas:

1. Interactive Digital Training Platform: seeded Park Guide web portal, Expo mobile preview, training modules, quizzes, progress, badges/certificates, notifications, files/resources, profile, and role boundaries.
2. Cybersecurity and Data Protection: demo login/register flow, role boundaries, `.env.example`, browser-safe evidence URLs, server-side incident validation, and documented production hardening steps.
3. AI/IoT Abnormal Activity Detection: AI camera incidents, IoT sensor incidents, Admin Incident Detection, Park Ranger response console, evidence serving, memory mode, and optional MySQL incident persistence.

The Park Guide training platform remains frontend-seeded for the demo. MySQL persistence is only implemented for AI/IoT monitoring incidents.

## Local Structure

```text
/Users/chiayuenkai/Desktop/GitHub/my-react-app1/
├── .venv/
├── artifacts/clip_2class_touching_species.pt
├── datasets/touching-plants/
├── datasets/touching-wildlife/
├── models/hand_landmarker.task
├── alerts/ai/
├── scripts/run_ai_camera_monitor.py
├── admin_page/
├── user_page/
├── mobile_app/
└── user_login/
```

Local-only folders such as `.venv/`, `artifacts/`, `datasets/`, `models/`, `node_modules/`, `dist/`, and `.expo/` should not be committed. `alerts/ai/` is intentionally available for curated demo evidence.

## Setup

Install JavaScript dependencies:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
npm install
```

Create the Python environment inside this folder:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Prepare backend environment values from the example file:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
cp user_login/server/.env.example user_login/server/.env
```

Do not commit real `.env` files.

## Run The Full Demo

Memory mode is the safest first run:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
INCIDENT_STORAGE=memory \
AI_EVIDENCE_DIR="/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai" \
npm run dev
```

MySQL incident mode:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
INCIDENT_STORAGE=mysql \
DB_DATABASE=cos30049_assignment \
AI_EVIDENCE_DIR="/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai" \
npm run dev
```

If `INCIDENT_STORAGE=mysql` is selected and MySQL is offline, the backend starts in degraded mode when `INCIDENT_MYSQL_FALLBACK=memory`.

## MySQL Incident Persistence

Create the database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cos30049_assignment;"
```

Apply the monitoring migration:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
mysql -u root -p cos30049_assignment < user_login/server/migrations/001_create_monitoring_incident_tables.sql
```

Check stored incidents:

```bash
mysql -u root -p cos30049_assignment \
  -e "SELECT public_id, source, event_type, status, occurred_at FROM monitoring_incidents ORDER BY occurred_at DESC LIMIT 5;"
```

Only AI/IoT monitoring incidents use MySQL. Training records, guide profiles, module content, and certificate approval remain seeded frontend demo data.

## AI Camera Runtime

Activate the local venv first:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
source .venv/bin/activate
```

Run the realtime monitor:

```bash
python scripts/run_ai_camera_monitor.py \
  --project-dir /Users/chiayuenkai/Desktop/GitHub/my-react-app1 \
  --evidence-dir /Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai \
  --backend-url http://localhost:4000
```

Expected behavior:

- MacBook camera is the default camera.
- `--camera-index` is useful for normal webcam selection.
- iPhone Continuity Camera is environment-dependent.
- It has worked when the MacBook connects to the iPhone hotspot.
- It has also worked when both MacBook and iPhone connect to Yoriichi's Router.
- Do not assume `--camera-index` always selects the iPhone camera.
- Press `q` or ESC to exit. The script releases the camera, closes OpenCV windows, and prints `Realtime camera stopped safely.`

Evidence output goes to:

```text
/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai
```

The backend serves evidence as browser-safe URLs:

```text
http://localhost:4000/evidence/ai/<filename>
```

## IoT Simulation

Run the full app or backend first, then publish a test IoT incident:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1/user_login/server
npm run publish:test-iot
```

The test publisher tries the configured MQTT broker first. If the public broker cannot complete a connection during the demo, it falls back to `POST http://localhost:4000/api/incidents` with the same `IOT_SENSOR` payload so the incident workflow can still be demonstrated.

The MQTT topic remains:

```text
ctip/sensor/plant-zone-01/proximity
```

The expected simulated incident is `source=IOT_SENSOR`, `event_type=ObjectCloseToPlant`, `sensor_id=plant-zone-01`, `location=Plant Zone 01`, `severity=low`, and incident status `New`.

## Demo URLs

Open these after `npm run dev`:

```text
http://localhost:5173
http://localhost:5175/user
http://localhost:5174/admin
http://localhost:5174/admin/detection
http://localhost:5174/admin/ranger
http://localhost:8081
http://localhost:4000/api/health
http://localhost:4000/api/incidents
http://localhost:4000/api/incidents/summary
```

## API Checks

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/incidents
curl http://localhost:4000/api/incidents/summary
```

Patch an incident status:

```bash
curl -X PATCH http://localhost:4000/api/incidents/<INCIDENT_ID>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"In Review"}'
```

Allowed statuses are:

```text
New, Reviewed, Acknowledged, In Review, Resolved, False Alarm
```

## Build And Syntax Checks

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
npm --prefix user_page run build
npm --prefix admin_page run build
node --check user_login/server/index.js
node --check scripts/dev-all.mjs
source .venv/bin/activate
python -m py_compile scripts/run_ai_camera_monitor.py
```

## Cybersecurity Notes

- Real credentials belong in `.env`, not source code.
- `.env.example` uses safe local placeholders.
- Evidence responses use `/evidence/ai/<filename>` and do not expose `/Users/...` paths to the frontend.
- Backend incident endpoints validate known incident source and status values.
- Role boundaries are visible: Park Guide, Park Ranger, and Admin have different permissions.
- Production MQTT should use a private broker with authentication and TLS.
- Production camera/IoT ingestion should use HTTPS and device token authentication.
- MySQL stores AI/IoT incident records server-side; full training-platform MySQL integration is intentionally deferred.

## Known Limitations

- Login/register is a demo flow, not production authentication.
- Park Guide training content is frontend-seeded and local to the browser.
- The AI model depends on local model files under `artifacts/` and `models/`.
- MQTT public broker behavior depends on network availability.
- The IoT test publisher includes a local API fallback for lecturer-demo reliability when the public MQTT broker times out.
- MySQL mode requires the local `cos30049_assignment` database and migration.
- This duplicate copy is for local demo review, not Git publishing.

## Screenshot Checklist

Capture:

1. Root hub at `http://localhost:5173`.
2. Login/Register and Park Guide portal.
3. User dashboard, modules, quiz, progress, certificates, notifications, files, profile, and help.
4. Mobile preview at `http://localhost:8081`.
5. Admin dashboard.
6. Admin Incident Detection with AI and IoT rows, evidence image, metadata, filters, and status update.
7. Park Ranger Console with urgent/new incidents and response actions.
8. `/api/health`, `/api/incidents`, and `/api/incidents/summary`.
9. `alerts/ai` folder showing JPG/JSON evidence.
10. MySQL query showing monitoring incidents, if running MySQL mode.
