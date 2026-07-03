import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_jwt_token_for_orbya_tech_digital_campus_saas';
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY);

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  collegeId: string;
}

/**
 * Signs a payload to generate a JWT token
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Tokens expire in 24 hours
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns its payload, or null if invalid/expired
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Securely hashes a plain-text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compares a plain-text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
