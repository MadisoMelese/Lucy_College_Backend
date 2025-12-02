import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { errorResponse } from "../utils/apiResponse.js";

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authorization header missing", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, role, iat, exp }
    return next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired token", 401);
  }
}
