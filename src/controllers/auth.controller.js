import * as AuthService from "../services/auth.service.js";
import { created, success, errorResponse } from "../utils/apiResponse.js";

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return errorResponse(res, "Email and password are required", 400);

    const existing = await AuthService.findUserByEmail(email);
    if (existing) return errorResponse(res, "Email already in use", 409);

    const user = await AuthService.registerUser({ email, password, role });
    // avoid returning password
    const { password: _p, ...payload } = user;
    return created(res, payload, "User registered");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, "Email and password are required", 400);

    const user = await AuthService.verifyCredentials(email, password);
    if (!user) return errorResponse(res, "Invalid credentials", 401);

    const token = AuthService.createAccessToken(user);
    const { password: _p, ...payload } = user;
    return success(res, { user: payload, token }, "Login successful");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const logout = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Authorization header missing", 401);
    }
    const token = authHeader.split(" ")[1];

    const payload = req.user;
    const expiresAt = payload && payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now());

    await AuthService.blacklistToken(token, expiresAt);
    return success(res, {}, "Logout successful");
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

