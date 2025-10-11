import { Client } from "minio";
import { env } from "./env";
import { getBaseUrl } from "./utils/base-url";

// For Electron app, we can disable MinIO and use local file storage
const isElectronApp = process.env.ELECTRON_APP === 'true';

export const minioBaseUrl = isElectronApp ? '' : getBaseUrl({ port: 9000 });

// Only initialize MinIO client if not running in Electron
export const minioClient = isElectronApp 
  ? null as any  // Placeholder - file operations will be handled differently
  : new Client({
      endPoint: minioBaseUrl.split("://")[1]!,
      useSSL: minioBaseUrl.startsWith("https://"),
      accessKey: "admin",
      secretKey: env.ADMIN_PASSWORD,
    });
