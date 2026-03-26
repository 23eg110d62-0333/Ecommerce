import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extended Request interface to include user data
 */
export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

/**
 * JWT Payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
}

/**
 * Verify JWT token and attach user to request
 * Middleware for protected routes
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JWTPayload;

    // Attach user info to request
    req.userId = decoded.userId;
    req.email = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Authentication failed",
      });
    }
  }
}

/**
 * Generate JWT token
 * Used after user login or registration
 */
export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    iat: Date.now(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d", // Token expires in 7 days
  });
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Error:", error);

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
}

/**
 * Request validation middleware
 * Ensures required fields are present
 */
export function validateRequest(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiter middleware (simple in-memory implementation)
 * For production, consider using redis-rate-limit or similar
 */
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();

    if (!rateLimitStore[key]) {
      rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
      next();
      return;
    }

    const record = rateLimitStore[key];

    // Check if window has expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      next();
      return;
    }

    // Increment counter
    record.count++;

    // Check if limit exceeded
    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
      return;
    }

    res.set("X-RateLimit-Limit", maxRequests.toString());
    res.set("X-RateLimit-Remaining", (maxRequests - record.count).toString());

    next();
  };
}
