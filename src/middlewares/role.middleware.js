import { errorResponse } from "../utils/apiResponse.js";

export default function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, "Unauthenticated", 401);
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "Forbidden: insufficient privileges", 403);
    }
    next();
  };
}
