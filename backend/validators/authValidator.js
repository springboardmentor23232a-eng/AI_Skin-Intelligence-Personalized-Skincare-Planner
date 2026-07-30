import { body, validationResult } from 'express-validator';

// Registration validation middleware
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[\W_]/)
    .withMessage('Password must contain at least one special character'),
  body('role')
    .optional()
    .isIn(['USER', 'WELLNESS_COACH', 'SKINCARE_CONSULTANT', 'DERMATOLOGIST', 'ADMIN'])
    .withMessage('Role must be one of: USER, WELLNESS_COACH, SKINCARE_CONSULTANT, DERMATOLOGIST, ADMIN'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
    next();
  }
];

// Login validation middleware
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email address is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
    next();
  }
];
