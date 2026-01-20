import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken<T extends object = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export function decodeToken<T extends object = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}
