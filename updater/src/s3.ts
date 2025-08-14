import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";

import {
  AWS_ACCESS_KEY,
  AWS_BUCKET,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY
} from "./envVars";

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

export async function fileExistsOnS3(filename: string): Promise<boolean> {
  try {
    const response = await s3.send(
      new HeadObjectCommand({
        Bucket: AWS_BUCKET,
        Key: filename
      })
    );

    return response !== undefined;
  } catch (error) {
    console.error(`Error checking if file ${filename} exists on S3: ${error}`);
    return false;
  }
}

export function uploadOnS3(
  filename: string,
  fileContent: Uint8Array<ArrayBufferLike>
) {
  return s3.send(
    new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: filename,
      Body: fileContent
    })
  );
}
