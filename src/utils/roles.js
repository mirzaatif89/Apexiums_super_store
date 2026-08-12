export function normalizeRole(role) {
  return String(role || '').replace(/[\s_-]+/g, '').toLowerCase();
}

export function isSuperAdminRole(role) {
  return normalizeRole(role) === 'superadmin';
}

export function isAdminRole(role) {
  return ['superadmin', 'businessadmin', 'admin', 'staff', 'manager'].includes(normalizeRole(role));
}
