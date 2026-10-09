
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import prisma from '../lib/prisma.js';

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
       res.status(401).json({ message: "Authentication required" });
       return;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user || user.role !== 'admin') {
       res.status(403).json({ message: "Access denied. Admins only." });
       return;
    }

    next();
  } catch (error) {
    console.error("Admin Check Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
