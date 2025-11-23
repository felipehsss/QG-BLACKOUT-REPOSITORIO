import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garante que a pasta uploads existe
const uploadFolder = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const time = new Date().getTime();
    // Ex: 123456789-foto.jpg
    cb(null, `${time}-${file.originalname}`);
  }
});

export const upload = multer({ storage });