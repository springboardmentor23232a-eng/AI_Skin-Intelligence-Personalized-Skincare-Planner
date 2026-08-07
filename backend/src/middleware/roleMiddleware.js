/**
 * Role-based authorization guard. Use after `protect`.
 * Usage: router.get('/admin-only', protect, authorize('ADMIN'), handler)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role permissions.' });
    }
    next();
  };
}

module.exports = { authorize };
