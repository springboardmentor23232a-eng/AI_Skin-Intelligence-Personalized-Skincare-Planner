export const getDashboardForRole = (role) => {
  if (!role) return '/user';
  const r = role.toUpperCase();
  switch (r) {
    case 'ADMIN':
      return '/admin';
    case 'DERMATOLOGIST':
      return '/doctor';
    case 'SKINCARE_CONSULTANT':
    case 'CONSULTANT':
      return '/consultant';
    case 'WELLNESS_COACH':
      return '/wellness';
    case 'USER':
    default:
      return '/user';
  }
};

export const normalizeRole = (role) => {
  if (!role) return 'USER';
  const r = role.toUpperCase();
  if (r === 'CONSULTANT' || r === 'SKINCARE_CONSULTANT') return 'SKINCARE_CONSULTANT';
  return r;
};
