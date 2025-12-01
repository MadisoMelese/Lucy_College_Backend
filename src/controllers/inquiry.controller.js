import * as InquiryService from "../services/inquiry.service.js";
import { created, errorResponse } from "../utils/apiResponse.js";

export const create = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return errorResponse(res, "All fields are required", 400);
    }
    const saved = await InquiryService.createInquiry({ name, email, message });
    return created(res, saved, "Inquiry submitted successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
