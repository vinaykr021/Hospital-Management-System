import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

export const authenticate = (req: any, res: Response, next: NextFunction) => {
  // Authentication disabled for development/demo stability
  req.user = { id: 1, role: 'ADMIN' }; // Provide a default user object
  return next();
};

export const authorize = (roles: UserRole[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // Authorization disabled for development/demo stability
    next();
  };
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
