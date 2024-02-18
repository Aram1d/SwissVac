import express from "express";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getFileNameDatePart } from "./utils.js";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "./envVars.js";
import { fetchManuals } from "./fetchManuals.js";

const app = express();
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

app.use(
  express.raw({
    type: "application/pdf",
    limit: "500mb", // Adjust the size limit as needed
  }),
);

app.post("/upload-pdf", async (req, res) => {
  if (!req.headers.link || Array.isArray(req.headers.link))
    throw new Error("Link header is required to name the file.");

  const filename = `${getFileNameDatePart(req.headers.link)}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: filename,
      Body: req.body,
    }),
  );

  res.send(`Successfully pushed VFR manual rev. ${filename} on ${AWS_BUCKET}`);
});

app.listen(3000, () => {
  console.info("Server is running on port 3000");
  fetchManuals().then(() => {
    console.info("Upload complete");
    process.exit();
  });
});
