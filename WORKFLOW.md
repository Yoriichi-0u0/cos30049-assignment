# End-to-End Lecturer Demo Workflow

Use this workflow from the duplicated demo folder:

```text
/Users/chiayuenkai/Desktop/GitHub/my-react-app1
```

Do not run Git commands in this copy. This workflow is for local lecturer demonstration only.

## Terminal 1: Run The Full App

Memory mode:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
INCIDENT_STORAGE=memory \
AI_EVIDENCE_DIR="/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai" \
npm run dev
```

MySQL mode:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
INCIDENT_STORAGE=mysql \
DB_DATABASE=cos30049_assignment \
AI_EVIDENCE_DIR="/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai" \
npm run dev
```

Expected services:

```text
Backend API: http://localhost:4000
Root hub: http://localhost:5173
Admin app: http://localhost:5174/admin
User app: http://localhost:5175/user
Mobile preview: http://localhost:8081
```

Visual identity check:

- Confirm the shared Citrus logo appears on the Review Hub, User Portal sidebar, Admin sidebar, Park Ranger route through the Admin shell, and Mobile preview header.
- Keep the original generated logo source out of the app runtime; use the optimized WebP/PNG copies already placed in each app.

## Terminal 2: API And MySQL Checks

API health:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/incidents
curl http://localhost:4000/api/incidents/summary
```

Create MySQL database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cos30049_assignment;"
```

Apply migration:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
mysql -u root -p cos30049_assignment < user_login/server/migrations/001_create_monitoring_incident_tables.sql
```

Check tables:

```bash
mysql -u root -p cos30049_assignment -e "SHOW TABLES;"
```

Check latest incidents:

```bash
mysql -u root -p cos30049_assignment \
  -e "SELECT public_id, source, event_type, status, occurred_at FROM monitoring_incidents ORDER BY occurred_at DESC LIMIT 5;"
```

Patch status:

```bash
curl -X PATCH http://localhost:4000/api/incidents/<INCIDENT_ID>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"In Review"}'
```

## Terminal 3: AI Camera Monitor

Prepare Python:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
source .venv/bin/activate
```

Run the AI camera:

```bash
python scripts/run_ai_camera_monitor.py \
  --project-dir /Users/chiayuenkai/Desktop/GitHub/my-react-app1 \
  --evidence-dir /Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai \
  --backend-url http://localhost:4000
```

Optional normal webcam index:

```bash
python scripts/run_ai_camera_monitor.py \
  --project-dir /Users/chiayuenkai/Desktop/GitHub/my-react-app1 \
  --evidence-dir /Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai \
  --backend-url http://localhost:4000 \
  --camera-index 1
```

Camera notes:

- MacBook camera is the default.
- `--camera-index` helps with normal webcams.
- iPhone Continuity Camera is environment-dependent.
- It has worked when MacBook connects to the iPhone hotspot.
- It has also worked when both MacBook and iPhone connect to Yoriichi's Router.
- Do not claim camera index switching always selects the iPhone camera.
- Press `q` or ESC to exit safely.

Check output:

```bash
ls -lah alerts/ai
curl http://localhost:4000/api/incidents
```

## Terminal 4: IoT Simulation

Publish a test IoT proximity alert:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1/user_login/server
npm run publish:test-iot
```

The script tries the configured MQTT broker first. If the public broker times out, it falls back to posting the same simulated incident to the local backend API.

Expected incident fields:

```text
source = IOT_SENSOR
event_type = ObjectCloseToPlant
sensor_id = plant-zone-01
location = Plant Zone 01
distance_cm = simulated distance
threshold_cm = 20
status = New
severity = low
topic = ctip/sensor/plant-zone-01/proximity
```

Then check:

```bash
curl http://localhost:4000/api/incidents
curl http://localhost:4000/api/incidents/summary
```

## Browser Tabs To Open

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

## Visual Consistency Checks

The demo should now read as one Citrus Energetic system:

- Hub: rainforest launcher, forest/citrus hero, rounded service cards, live status pills.
- User/Park Guide: warm citrus learning portal, cream cards, orange actions, lime progress states.
- Admin Dashboard: command-center view with charcoal/forest structure and citrus monitoring cards.
- Admin Incident Detection: consistent filters, table badges, evidence frame, metadata cards, and status actions.
- Park Ranger Console: forest field-response identity, urgent queue, evidence panel, and citrus response actions.
- Mobile Preview: simplified Park Guide palette with cream surfaces and citrus actions.

Image rule for report/demo assets:

- Hero images should stay below 500 KB.
- Card thumbnails should stay below 150 KB.
- Do not optimize or delete `alerts/ai` runtime evidence.
- Current generated hub hero is `images/citrus-rainforest-hero.webp` at 136 KB.
- Current user training WebP images are below 100 KB each.

## Manual Demo Order

1. Open `http://localhost:5173` and show the root hub cards and service links.
2. Open Login/Register, then Park Guide/User Portal at `http://localhost:5175/user`.
3. Switch User01/User02/User03.
4. Show modules, module detail, quiz, progress, certificates/badges, notifications, schedule, resources/files, profile, and help/permission guide.
5. Open mobile preview at `http://localhost:8081`.
6. Open Admin Dashboard at `http://localhost:5174/admin`.
7. Open Admin Incident Detection at `http://localhost:5174/admin/detection`.
8. Show summary cards, filters, AI_CAMERA row, IOT_SENSOR row, evidence image, AI metadata, IoT metadata, and status update.
9. Open Park Ranger Console at `http://localhost:5174/admin/ranger`.
10. Show response-only role boundary, urgent/new incident queue, selected detail, evidence, field notes, and action buttons.
11. Run AI camera or IoT simulation.
12. Refresh Admin and Ranger pages and show the same backend incident data.
13. Patch status from the UI or curl and show persistence in API/MySQL.
14. Capture final screenshots after confirming the Citrus Energetic theme is consistent across Hub, User, Admin, Ranger, and Mobile.

## Screenshot Checklist

Capture:

```text
1. Root hub with all demo links.
2. Park Guide dashboard.
3. Module catalog and module detail/quiz.
4. Progress and certificates/badges.
5. Notifications, resources/files, profile, and permission guide.
6. Mobile preview.
7. Admin dashboard.
8. Admin Incident Detection with AI and IoT rows.
9. Admin selected incident detail with AI evidence image.
10. Admin IoT metadata card.
11. Park Ranger response console.
12. Park Ranger status action update.
13. /api/health.
14. /api/incidents.
15. /api/incidents/summary.
16. alerts/ai folder with JPG/JSON evidence.
17. MySQL query showing monitoring incidents if MySQL mode is used.
```

## Verification Commands

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
npm install
npm --prefix user_page run build
npm --prefix admin_page run build
node --check user_login/server/index.js
node --check scripts/dev-all.mjs
source .venv/bin/activate
python -m py_compile scripts/run_ai_camera_monitor.py
```

## Troubleshooting

If a port is already in use:

```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN
lsof -nP -iTCP:5173 -sTCP:LISTEN
lsof -nP -iTCP:5174 -sTCP:LISTEN
lsof -nP -iTCP:5175 -sTCP:LISTEN
lsof -nP -iTCP:8081 -sTCP:LISTEN
```

If MySQL is offline, run memory mode first:

```bash
INCIDENT_STORAGE=memory \
AI_EVIDENCE_DIR="/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai" \
npm run dev
```

If the camera script cannot import OpenCV or MediaPipe, recreate and activate `.venv` inside `my-react-app1`:

```bash
cd /Users/chiayuenkai/Desktop/GitHub/my-react-app1
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If live evidence does not appear, confirm the backend and script use the same evidence folder:

```bash
AI_EVIDENCE_DIR="/Users/chiayuenkai/Desktop/GitHub/my-react-app1/alerts/ai"
```

Frontend evidence should render through:

```text
http://localhost:4000/evidence/ai/<filename>
```
