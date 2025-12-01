export const success = (res, data, message = "Success") => {
  return res.status(200).json({ status: "success", message, data });
};

export const created = (res, data, message = "Created") => {
  return res.status(201).json({ status: "success", message, data });
};

export const errorResponse = (res, message = "Something went wrong", code = 500) => {
  return res.status(code).json({ status: "error", message });
};
