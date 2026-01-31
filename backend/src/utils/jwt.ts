import jwt from "jsonwebtoken";

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
