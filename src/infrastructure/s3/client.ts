import { S3Client } from "@aws-sdk/client-s3";

function getEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`${key} が設定されていません。.env を確認してください。`);
  }
  return value;
}

function createS3Client(): S3Client {
  return new S3Client({
    endpoint: getEnv("S3_ENDPOINT"),
    region: getEnv("S3_REGION"),
    credentials: {
      accessKeyId: getEnv("S3_ACCESS_KEY"),
      secretAccessKey: getEnv("S3_SECRET_KEY"),
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
}

const globalForS3 = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

export function getS3(): S3Client {
  if (globalForS3.s3Client === undefined) {
    globalForS3.s3Client = createS3Client();
  }
  return globalForS3.s3Client;
}

export function getBucket(): string {
  return getEnv("S3_BUCKET");
}
