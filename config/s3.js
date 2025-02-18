import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

// s3 - 게시글 사진 업로드 (post-photos 폴더) 
export const upload_post = multer({
  storage: multerS3({
      s3: s3,
      bucket: process.env.BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'bucket-owner-full-control',
      key: (req, file, cb) => {
        const filename = `post-photos/${Date.now()}_${file.originalname}`;
          cb(null, filename);
      }
  })
}).fields([
  { name: 'picture_url', maxCount: 10 },    // 게시글 업로드
  { name: 'updated_pictures', maxCount: 10 } // 게시글 수정
]);


// s3 - 게시글 사진 삭제 (post-photos 폴더)
export const delete_images = async (picture_urls) => {
  try {
    if (!picture_urls || !Array.isArray(picture_urls) || picture_urls.length === 0) {
      throw new Error("삭제할 이미지 URL 배열이 제공되지 않았습니다.");
    }
    
    const deleteCommands = picture_urls.map((picture_url) => {
      const url = new URL(picture_url);
      const file_name = decodeURIComponent(url.pathname.substring(1));

      console.log(`🗑️ 삭제 요청 파일: ${file_name}`);

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file_name,
      };

      return s3.send(new DeleteObjectCommand(params)); 
    });

    await Promise.all(deleteCommands);

    console.log("S3에서 성공적으로 사진을 삭제했습니다.");

  } catch (error) {
    console.error("S3에서 사진을 삭제중에 에러 발생: ", error);
    throw new Error("S3에서 사진을 삭제하는데 실패했습니다.");
  }
};

export { upload, s3 };