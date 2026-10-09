import jwt, { SignOptions } from "jsonwebtoken";

interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const signInOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as any,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, signInOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};
