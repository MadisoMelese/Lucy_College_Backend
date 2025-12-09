export const fileUrl = (req, filePath) => {
  return `${process.env.BASE_URL}/uploads/${filePath}`;
};
