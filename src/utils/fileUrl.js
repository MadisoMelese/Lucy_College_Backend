import fs from 'fs';
import path from 'path';

export const fileUrl = (req, filePath) => {
  return `${process.env.BASE_URL}/uploads/${filePath}`;
};



export const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};
