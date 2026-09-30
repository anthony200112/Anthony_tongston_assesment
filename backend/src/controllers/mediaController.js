import Joi from 'joi';
import crypto from 'node:crypto';
import logger from '../utils/logger.js';

/**
 * Media storage is mocked. Uploads register a file record in-memory and return
 * a fake Cloudinary-style URL. Promotion generates a fake S3 URL.
 * In production these would call the Cloudinary and AWS S3 SDKs.
 */

const mediaStore = new Map();

export const uploadSchema = {
  body: Joi.object({
    fileName: Joi.string().trim().min(1).required(),
    contentType: Joi.string().trim().default('application/octet-stream'),
    // base64-encoded payload, optional for mock purposes
    data: Joi.string().allow(''),
  }),
};

export function upload(req, res, next) {
  try {
    const { fileName, contentType, data } = req.body;
    const id = crypto.randomUUID();
    const cloudinaryUrl = `https://res.cloudinary.com/tongston-mock/image/upload/${id}/${fileName}`;

    mediaStore.set(id, {
      id,
      fileName,
      contentType,
      cloudinaryUrl,
      s3Url: null,
      promoted: false,
      uploadedAt: new Date(),
      sizeBytes: data ? Math.floor(data.length * 0.75) : 0,
    });

    logger.info('Media uploaded (mock)', { id, fileName });

    res.status(201).json({
      id,
      fileName,
      contentType,
      url: cloudinaryUrl,
      storage: 'cloudinary',
      promoted: false,
    });
  } catch (err) {
    next(err);
  }
}

export function promote(req, res, next) {
  try {
    const { id } = req.params;
    const media = mediaStore.get(id);
    if (!media) throw Object.assign(new Error(`Media "${id}" not found.`), { status: 404 });

    const s3Url = `https://tongston-mock.s3.amazonaws.com/media/${id}/${media.fileName}`;
    media.s3Url = s3Url;
    media.promoted = true;

    logger.info('Media promoted to S3 (mock)', { id });

    res.json({
      id,
      fileName: media.fileName,
      cloudinaryUrl: media.cloudinaryUrl,
      s3Url,
      storage: 's3',
      promoted: true,
    });
  } catch (err) {
    next(err);
  }
}
