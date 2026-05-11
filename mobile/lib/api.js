export const defaultApiBase = "http://192.168.1.120:3001";

export async function apiFetch(apiBase, path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json();
}
