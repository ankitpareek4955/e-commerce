import fs from "fs";
import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();
const isServerless = Boolean(process.env.VERCEL);

const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync("uploads", { recursive: true });
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${extname}`);
      },
    });

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err.message });
    } else if (req.file) {
      const imageUrl = isServerless
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        : `/${req.file.path.replace(/\\/g, "/")}`;

      res.status(200).send({
        message: "Image uploaded successfully",
        image: imageUrl,
      });
    } else {
      res.status(400).send({ message: "No image file provided" });
    }
  });
});

export default router;
