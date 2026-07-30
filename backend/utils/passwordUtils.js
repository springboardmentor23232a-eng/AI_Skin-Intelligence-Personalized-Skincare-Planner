import bcrypt from 'bcryptjs';

/**
 * Hash plain password with BCrypt (Salt rounds 10)
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain password against BCrypt hash
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
};
