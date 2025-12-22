import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { errorResponse } from "../utils/apiResponse.js";
import * as AuthService from "../services/auth.service.js";

export default async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authorization header missing", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Check blacklist
    const blacklisted = await AuthService.isTokenBlacklisted(token);
    if (blacklisted)
      return errorResponse(res, "Token revoked (logged out)", 401);

    req.user = payload; // { id, email, role, iat, exp }
    return next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired token", 401);
  }
}

export function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return errorResponse(res, "Access denied. Admin only", 403);
  }
  next();
}
