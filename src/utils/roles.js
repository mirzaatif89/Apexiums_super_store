export function normalizeRole(role) {
  return String(role || '').replace(/[\s_-]+/g, '').toLowerCase();
}

export function roleKey(role) {
  const normalized = normalizeRole(role);
  if (normalized === 'sellers') return 'seller';
  if (normalized === 'investors') return 'investor';
  return normalized;
}

export function isSuperAdminRole(role) {
  return normalizeRole(role) === 'superadmin';
}

export function isAdminRole(role) {
  return ['superadmin', 'businessadmin', 'admin', 'staff', 'manager', 'seller', 'investor'].includes(roleKey(role));
}
