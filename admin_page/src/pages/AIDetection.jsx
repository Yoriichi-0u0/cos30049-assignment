import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  INCIDENT_FILTERS,
  INCIDENT_STATUSES,
  normalizeIncidentRecord,
  seededIncidents,
  summarizeIncidents,
} from "../data/incidents";
import "../Admin.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const backendBaseUrl = API_BASE_URL.replace(/\/$/, "");

const sourceLabel = {
  AI_CAMERA: "AI Camera",
  IOT_SENSOR: "IoT Sensor",
};

const resolveEvidenceImageUrl = (evidenceImage) => {
  if (!evidenceImage || typeof evidenceImage !== "string") return null;
  if (evidenceImage.startsWith("/Users/")) return null;
  if (evidenceImage.startsWith("http://") || evidenceImage.startsWith("https://")) {
    return evidenceImage;
  }
  if (evidenceImage.startsWith("/evidence/ai/")) {
    return `${backendBaseUrl}${evidenceImage}`;
  }
  return evidenceImage;
};

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatPercent = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number * 100)}%` : "Unavailable";
};

const formatDecimal = (value, digits = 2) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "Unavailable";
};

const statusClassName = (status = "") => String(status).toLowerCase().replace(/\s+/g, "-");

const getFilteredIncidents = (incidents, activeFilter) => {
  if (activeFilter === "all") return incidents;
  if (activeFilter === "AI_CAMERA" || activeFilter === "IOT_SENSOR") {
    return incidents.filter((incident) => incident.source === activeFilter);
  }
  return incidents.filter((incident) => incident.status === activeFilter);
};

const getApiIncidents = (payload) => {
  const records = Array.isArray(payload) ? payload : payload?.incidents || [];
  return records.map(normalizeIncidentRecord).filter(Boolean);
};

const AIDetection = () => {
  const [incidents, setIncidents] = useState(seededIncidents);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState(seededIncidents[0]?.id);
  const [backendOnline, setBackendOnline] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [savingIncidentId, setSavingIncidentId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchIncidents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/incidents`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const payload = await response.json();
        const liveIncidents = getApiIncidents(payload);
        if (cancelled) return;

        setBackendOnline(true);
        setApiError("");
        setLastUpdated(new Date());
        setIncidents(liveIncidents);
        setSelectedIncidentId((currentId) =>
          liveIncidents.some((incident) => incident.id === currentId)
            ? currentId
            : liveIncidents[0]?.id || null
        );
      } catch (error) {
        if (cancelled) return;
        setBackendOnline(false);
        setApiError(error.message);
        setIncidents(seededIncidents);
        setSelectedIncidentId((currentId) =>
          seededIncidents.some((incident) => incident.id === currentId)
            ? currentId
            : seededIncidents[0]?.id || null
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchIncidents();
    const intervalId = window.setInterval(fetchIncidents, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const summary = useMemo(() => summarizeIncidents(incidents), [incidents]);
  const filteredIncidents = useMemo(
    () => getFilteredIncidents(incidents, activeFilter),
    [incidents, activeFilter]
  );
  const filterCounts = useMemo(
    () =>
      INCIDENT_FILTERS.reduce(
        (counts, filter) => ({
          ...counts,
          [filter.id]: getFilteredIncidents(incidents, filter.id).length,
        }),
        {}
      ),
    [incidents]
  );
  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId);

  const updateIncidentStatus = async (incidentId, status) => {
    const applyLocalStatus = () => {
      setIncidents((current) =>
        current.map((incident) =>
          incident.id === incidentId ? { ...incident, status } : incident
        )
      );
    };

    if (!backendOnline) {
      applyLocalStatus();
      return;
    }

    setSavingIncidentId(incidentId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${encodeURIComponent(incidentId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Actor-Role": "admin",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Status update failed with ${response.status}`);
      }

      const payload = await response.json();
      const updatedIncident = normalizeIncidentRecord(payload.incident);
      if (!updatedIncident) {
        applyLocalStatus();
        return;
      }

      setIncidents((current) =>
        current.map((incident) =>
          incident.id === updatedIncident.id ? updatedIncident : incident
        )
      );
    } catch (error) {
      setBackendOnline(false);
      setApiError(error.message);
      applyLocalStatus();
    } finally {
      setSavingIncidentId(null);
    }
  };

  const statusMode = backendOnline ? "Live backend" : "Seeded fallback";
  const statusCards = [
    { label: "Total", value: summary.total, detail: backendOnline ? "Backend incidents" : "Demo incidents" },
    { label: "AI Camera", value: summary.ai, detail: "TouchingPlants / TouchingWildlife" },
    { label: "IoT Sensor", value: summary.iot, detail: "ObjectCloseToPlant readings" },
    { label: "New", value: summary.new, detail: "Needs review" },
    { label: "In Review", value: summary.inReview, detail: "Being investigated" },
    { label: "Resolved", value: summary.resolved, detail: "Closed response" },
    { label: "False Alarm", value: summary.falseAlarm, detail: "Retained for audit" },
  ];

  const visibleCountLabel = `${filteredIncidents.length} visible`;
  const emptyState = filteredIncidents.length === 0;
  const lastUpdatedLabel = lastUpdated ? formatDateTime(lastUpdated.toISOString()) : "Not connected yet";
  const connectionDetail = backendOnline
    ? `Polling every 2.5 seconds. Last update: ${lastUpdatedLabel}`
    : `Backend offline, showing seeded fallback${apiError ? ` (${apiError})` : ""}`;

  return (
    <Box className="incident-dashboard">
      <Box className="incident-hero">
        <Box>
          <Typography className="incident-eyebrow">AI / IoT Monitoring</Typography>
          <Typography component="h1" className="incident-title">
            Admin Incident Detection
          </Typography>
          <Typography className="incident-subtitle">
            Command-center review for AI camera alerts, IoT proximity alerts, evidence metadata,
            and incident status decisions.
          </Typography>
        </Box>
        <Box className="incident-contract-card">
          <span>{statusMode}</span>
          <strong>AI_CAMERA + IOT_SENSOR</strong>
          <small>{connectionDetail}</small>
        </Box>
      </Box>

      <Box className={`incident-state-banner ${backendOnline ? "online" : "fallback"}`}>
        <strong>{backendOnline ? "Backend incident API connected" : "Using seeded fallback incidents"}</strong>
        <span>
          {backendOnline
            ? "Live memory/MySQL incident data is being rendered from /api/incidents."
            : "Start the backend to switch this dashboard from seeded evidence to live runtime incidents."}
        </span>
      </Box>

      <Box className="incident-stat-grid">
        {statusCards.map((card) => (
          <Paper className="incident-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{String(card.value).padStart(2, "0")}</strong>
            <p>{card.detail}</p>
          </Paper>
        ))}
      </Box>

      <Box className="incident-filter-row">
        {INCIDENT_FILTERS.map((filter) => (
          <Button
            key={filter.id}
            className={activeFilter === filter.id ? "active" : ""}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
            <span>{filterCounts[filter.id] ?? 0}</span>
          </Button>
        ))}
      </Box>

      <Box className="incident-workspace">
        <Paper className="incident-table-panel">
          <Box className="incident-section-head">
            <Box>
              <Typography className="incident-eyebrow">Review queue</Typography>
              <Typography component="h2">Incident records</Typography>
            </Box>
            <Typography>{isLoading ? "Loading..." : visibleCountLabel}</Typography>
          </Box>

          {emptyState ? (
            <Box className="incident-empty-state">
              <Typography component="h3">No matching incidents</Typography>
              <Typography>
                Change the filter, post an AI incident, or publish an IoT MQTT payload to populate this queue.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table className="incident-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Incident ID</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      hover
                      selected={selectedIncidentId === incident.id}
                      className={`incident-table-row ${selectedIncidentId === incident.id ? "is-selected" : ""}`}
                      onClick={() => setSelectedIncidentId(incident.id)}
                    >
                      <TableCell className="incident-id-cell">{incident.id}</TableCell>
                      <TableCell>
                        <span className={`source-chip ${(incident.source || "").toLowerCase()}`}>
                          {sourceLabel[incident.source] || incident.source}
                        </span>
                      </TableCell>
                      <TableCell>{incident.eventType}</TableCell>
                      <TableCell>
                        <span className={`severity-chip ${incident.severity}`}>
                          {incident.severity}
                        </span>
                      </TableCell>
                      <TableCell>{incident.location}</TableCell>
                      <TableCell>{formatDateTime(incident.timestamp)}</TableCell>
                      <TableCell>
                        <span className={`status-chip ${statusClassName(incident.status)}`}>
                          {incident.status}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          className="incident-detail-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedIncidentId(incident.id);
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <IncidentDetailPanel
          incident={selectedIncident}
          savingIncidentId={savingIncidentId}
          onStatusChange={updateIncidentStatus}
        />
      </Box>
    </Box>
  );
};

const IncidentDetailPanel = ({ incident, savingIncidentId, onStatusChange }) => {
  if (!incident) {
    return (
      <Paper className="incident-detail-panel">
        <Typography component="h2">No incident selected</Typography>
        <Typography>Select a record to inspect incident metadata.</Typography>
      </Paper>
    );
  }

  const probabilities = incident.ai?.probabilities || {};
  const evidenceImageUrl = resolveEvidenceImageUrl(incident.evidenceImage);
  const bbox = Array.isArray(incident.ai?.bbox) ? incident.ai.bbox : [];
  const isSaving = savingIncidentId === incident.id;

  return (
    <Paper className="incident-detail-panel">
      <Typography className="incident-eyebrow">{sourceLabel[incident.source]}</Typography>
      <Typography component="h2">{incident.eventType}</Typography>
      <Typography className="incident-detail-id">{incident.id}</Typography>
      <Typography className="incident-detail-kicker">
        {incident.source === "AI_CAMERA"
          ? "Evidence review, classification confidence, and bounding-box metadata"
          : "Sensor-only proximity alert with MQTT metadata"}
      </Typography>

      {evidenceImageUrl ? (
        <Box className="incident-evidence-frame">
          <img src={evidenceImageUrl} alt={`${incident.eventType} evidence`} />
          <span className="incident-evidence-caption">Browser-safe evidence URL rendered through the app/backend.</span>
        </Box>
      ) : (
        <Box className="incident-no-image">No image evidence for sensor-only alert</Box>
      )}

      <Box className="incident-detail-grid">
        <DetailItem label="Severity" value={incident.severity} />
        <DetailItem label="Status" value={incident.status} />
        <DetailItem label="Location" value={incident.location} />
        <DetailItem label="Timestamp" value={formatDateTime(incident.timestamp)} />
      </Box>

      {incident.source === "AI_CAMERA" && incident.ai && (
        <Box className="incident-metadata-card">
          <Typography component="h3">AI evidence metadata</Typography>
          <DetailItem label="Predicted Class" value={incident.ai.predictedClass || "Unknown"} />
          <DetailItem label="Confidence" value={formatPercent(incident.ai.confidence)} />
          <DetailItem label="Margin" value={formatDecimal(incident.ai.margin)} />
          <DetailItem label="BBox" value={bbox.length ? `[${bbox.join(", ")}]` : "Unavailable"} />
          <DetailItem
            label="Probabilities"
            value={`Plants ${formatPercent(probabilities.TouchingPlants)} / Wildlife ${formatPercent(probabilities.TouchingWildlife)}`}
          />
        </Box>
      )}

      {incident.source === "IOT_SENSOR" && incident.iot && (
        <Box className="incident-metadata-card">
          <Typography component="h3">IoT sensor metadata</Typography>
          <DetailItem label="Sensor ID" value={incident.iot.sensorId} />
          <DetailItem label="Distance" value={`${incident.iot.distanceCm} cm`} />
          <DetailItem label="Threshold" value={`${incident.iot.thresholdCm} cm`} />
          <DetailItem label="MQTT Topic" value={incident.iot.topic} />
          <DetailItem label="Location" value={incident.location} />
        </Box>
      )}

      <Box className="incident-notes">
        <Typography component="h3">Review notes</Typography>
        <Typography>{incident.notes || "No notes recorded for this incident."}</Typography>
      </Box>

      <Box className="incident-status-actions">
        <Typography component="h3">Update incident status</Typography>
        {INCIDENT_STATUSES.map((status) => (
          <Button
            key={status}
            className={incident.status === status ? "active" : ""}
            disabled={isSaving}
            onClick={() => onStatusChange(incident.id, status)}
          >
            {status}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

const DetailItem = ({ label, value }) => (
  <Box className="incident-detail-item">
    <span>{label}</span>
    <strong>{value ?? "Unavailable"}</strong>
  </Box>
);

export default AIDetection;
