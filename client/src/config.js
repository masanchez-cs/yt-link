/**
 * Base pública del API (sin barra final).
 * - Vacío: mismo origen (proxy en dev, o API+front en un solo dominio en prod).
 * - Ej. https://api.tudominio.com : front en S3/CloudFront y API en otro host.
 */
export function getApiBase() {
  const v = import.meta.env.VITE_API_BASE;
  if (v == null || String(v).trim() === '') return '';
  return String(v).trim().replace(/\/+$/, '');
}

export function apiUrl(path) {
  const base = getApiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
