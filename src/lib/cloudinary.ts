import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import config from "../config";
import { AppError } from "../errors/AppError";
import httpStatus from "http-status";

cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_secret,
});

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new AppError(httpStatus.BAD_REQUEST, "Only image files are allowed"));
        }
    },
});

/**
 * Middleware factory to support multiple possible field names (e.g. image, profilePhoto, file)
 * and gracefully assign the primary uploaded file to req.file.
 */
export const fileUploadMiddleware = (fieldNames: string[]) => {
    const fields = fieldNames.map((name) => ({ name, maxCount: 1 }));
    const multerMiddleware = upload.fields(fields);

    return (req: Request, res: Response, next: NextFunction) => {
        multerMiddleware(req, res, (err: any) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    return next(new AppError(httpStatus.BAD_REQUEST, `Upload error: ${err.message}`));
                }
                return next(err);
            }

            if (req.files && !Array.isArray(req.files)) {
                for (const name of fieldNames) {
                    const files = req.files[name];
                    if (files && files.length > 0) {
                        req.file = files[0];
                        break;
                    }
                }
            }
            next();
        });
    };
};

/**
 * Uploads a Multer file buffer or Base64 data URL to Cloudinary.
 * If already a remote HTTP/HTTPS URL, returns it directly.
 */
export const uploadToCloudinary = async (
    fileOrPath: Express.Multer.File | string,
    folder: string = "rentnest"
): Promise<string> => {
    // If it's a Multer file object with buffer
    if (typeof fileOrPath !== "string" && fileOrPath?.buffer) {
        return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto",
                },
                (error, result: UploadApiResponse | undefined) => {
                    if (error || !result) {
                        return reject(
                            new AppError(
                                httpStatus.INTERNAL_SERVER_ERROR,
                                error?.message || "Cloudinary image upload failed"
                            )
                        );
                    }
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(fileOrPath.buffer);
        });
    }

    // If it's a string
    if (typeof fileOrPath === "string") {
        // If it's already a hosted URL (http / https), don't re-upload
        if (fileOrPath.startsWith("http://") || fileOrPath.startsWith("https://")) {
            return fileOrPath;
        }

        // Base64 data URI or remote/local path
        try {
            const result = await cloudinary.uploader.upload(fileOrPath, {
                folder,
                resource_type: "auto",
            });
            return result.secure_url;
        } catch (error: any) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                error?.message || "Failed to upload image to Cloudinary"
            );
        }
    }

    throw new AppError(httpStatus.BAD_REQUEST, "Invalid file format for image upload");
};

export { cloudinary };
