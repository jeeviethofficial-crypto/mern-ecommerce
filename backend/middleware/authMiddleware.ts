import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const protect = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
    const user = await User.findById(decoded.id).select('-password').exec();
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    (req as any).userId = decoded.id;
    (req as any).userName = user.name;
    (req as any).userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user = await User.findById((req as any).userId).select('-password').exec();
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
