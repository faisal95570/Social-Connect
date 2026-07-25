/**
 * AWS Lambda — Thumbnail Generator
 * ─────────────────────────────────
 * Trigger: S3 ObjectCreated event on the main image bucket (posts/ prefix).
 * Action:  Resizes the image to 400×400 max and saves it to the thumbnail bucket
 *          with "thumb-" prefixed key.
 *
 * Runtime: Node.js 20.x
 * Handler: index.handler
 * Memory:  512 MB  |  Timeout: 30 s
 *
 * Environment variables to set in Lambda console:
 *   THUMB_BUCKET  =  your-socialmedia-thumbnails
 *   THUMB_MAX_DIM =  400   (optional, default 400)
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3   = new S3Client({});
const DIM  = parseInt(process.env.THUMB_MAX_DIM || '400', 10);
const DEST = process.env.THUMB_BUCKET;

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data',  (c) => chunks.push(c));
    stream.on('end',   ()  => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

export const handler = async (event) => {
  const record     = event.Records[0];
  const srcBucket  = record.s3.bucket.name;
  const srcKey     = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const destKey    = `thumb-${srcKey}`;

  console.log(`Processing: s3://${srcBucket}/${srcKey}  →  s3://${DEST}/${destKey}`);

  // 1. Download original from S3
  const getCmd    = new GetObjectCommand({ Bucket: srcBucket, Key: srcKey });
  const s3Object  = await s3.send(getCmd);
  const buffer    = await streamToBuffer(s3Object.Body);

  // 2. Resize with sharp (fit inside DIM×DIM, preserve aspect ratio)
  const thumbBuf  = await sharp(buffer)
    .resize(DIM, DIM, { fit: 'inside', withoutEnlargement: true })
    .toFormat('jpeg', { quality: 80 })
    .toBuffer();

  // 3. Upload thumbnail to thumbnail bucket
  const putCmd = new PutObjectCommand({
    Bucket:      DEST,
    Key:         destKey,
    Body:        thumbBuf,
    ContentType: 'image/jpeg',
  });
  await s3.send(putCmd);

  console.log(`✅ Thumbnail saved: s3://${DEST}/${destKey}`);
  return { statusCode: 200, body: `Thumbnail created: ${destKey}` };
};
