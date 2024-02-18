import "dotenv/config";

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const AWS_REGION = process.env.AWS_REGION || "eu-central-1";
export const AWS_BUCKET = process.env.AWS_BUCKET || "";
