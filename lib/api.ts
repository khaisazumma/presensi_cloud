const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

interface ApiSuccess<T> {
  ok: true;
  data: T;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function post<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<T>>;
}

async function get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  return res.json() as Promise<ApiResponse<T>>;
}

// ── Module 1: QR Presence ──

export interface QrGenerateResponse {
  qr_token: string;
  expires_at: string;
}

export function generateQr(course_id: string, session_id: string) {
  return post<QrGenerateResponse>("/presence/qr/generate", {
    course_id,
    session_id,
    ts: new Date().toISOString(),
  });
}

export interface CheckinResponse {
  status: string;
  message: string;
}

export function checkin(payload: {
  user_id: string;
  device_id: string;
  course_id: string;
  session_id: string;
  qr_token: string;
}) {
  return post<CheckinResponse>("/presence/checkin", {
    ...payload,
    ts: new Date().toISOString(),
  });
}

export interface PresenceStatus {
  status: string;
  checked_in_at?: string;
}

export function getPresenceStatus(user_id: string, course_id: string, session_id: string) {
  return get<PresenceStatus>("/presence/status", { user_id, course_id, session_id });
}

// ── Module 2: Accelerometer ──

export interface AccelSample {
  t: string;
  x: number;
  y: number;
  z: number;
}

export function postAccel(device_id: string, samples: AccelSample[]) {
  return post("/telemetry/accel", {
    device_id,
    ts: new Date().toISOString(),
    samples,
  });
}

export interface AccelLatest {
  x: number;
  y: number;
  z: number;
  ts: string;
}

export function getAccelLatest(device_id: string) {
  return get<AccelLatest>("/telemetry/accel/latest", { device_id });
}

// ── Module 3: GPS ──

export function postGps(device_id: string, lat: number, lng: number, accuracy_m: number) {
  return post("/telemetry/gps", {
    device_id,
    ts: new Date().toISOString(),
    lat,
    lng,
    accuracy_m,
  });
}

export interface GpsLatest {
  lat: number;
  lng: number;
  accuracy_m: number;
  ts: string;
}

export function getGpsLatest(device_id: string) {
  return get<GpsLatest>("/telemetry/gps/latest", { device_id });
}

export interface GpsHistoryPoint {
  lat: number;
  lng: number;
  ts: string;
}

export function getGpsHistory(device_id: string, limit = 200) {
  return get<GpsHistoryPoint[]>("/telemetry/gps/history", { device_id, limit: String(limit) });
}
