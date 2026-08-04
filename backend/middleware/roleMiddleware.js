export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: '401 Unauthorized: User identity unverified'
      });
    }

    const userRole = req.user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    let isAllowed = normalizedAllowed.includes(userRole);
    if (!isAllowed && (userRole === 'CONSULTANT' || userRole === 'SKINCARE_CONSULTANT')) {
      isAllowed = normalizedAllowed.includes('CONSULTANT') || normalizedAllowed.includes('SKINCARE_CONSULTANT');
    }

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `403 Access Denied: Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

