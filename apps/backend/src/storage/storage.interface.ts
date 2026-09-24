export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface StoredFileResult {
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface IStorageService {
  saveFile(file: UploadedFile, folder?: string): Promise<StoredFileResult>;
  getFileStream(storagePath: string): Promise<NodeJS.ReadableStream>;
  getFileUrl(storagePath: string): Promise<string>;
  deleteFile(storagePath: string): Promise<void>;
}
