import bcrypt from "bcryptjs";

const PASSWORD_HASH_ROUNDS = 10;

export function hashPassword(password) {
  return bcrypt.hashSync(String(password || ""), PASSWORD_HASH_ROUNDS);
}

export function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compareSync(String(password || ""), passwordHash);
}
