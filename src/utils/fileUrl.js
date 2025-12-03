export const fileUrl = (req, filePath) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filePath}`;
};
