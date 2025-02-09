import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

// AWS S3 설정
const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.S3_KEYID,
    secretAccessKey: process.env.S3_PRIVATE_KEY,
  },
});

// multer-s3 설정 (이미지 업로드)
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `profile/${Date.now()}_${file.originalname}`);
    },
  }),
});

export { upload, s3 };