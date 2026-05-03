import { showToast } from './utils.js';

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `Error del servidor (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function tryParseError(res) {
  try {
    const body = await res.json();
    return body.detail || body.message || null;
  } catch {
    return null;
  }
}

export async function apiGet(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new ApiError(res.status, await tryParseError(res));
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new ApiError(res.status, await tryParseError(res));
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new ApiError(res.status, await tryParseError(res));
  return res.json();
}
