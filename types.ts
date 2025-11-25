export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64Data: string | null;
  mimeType: string;
}

export interface EditHistoryItem {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
}
