
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import '../config/cloudinary.js'; // Ensure config is loaded

export const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'buildershub_projects', resource_type: "auto" },
      (error, result) => {
        if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
        }
        if (result) {
            console.log("Cloudinary Upload Success. URL:", result.secure_url);
            return resolve(result.secure_url);
        }
        reject(new Error('Cloudinary upload failed: No result returned'));
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
