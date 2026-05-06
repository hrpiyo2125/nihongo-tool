const cache = new Map<string, string>(); // pdfUrl -> dataUrl

export function setCachedThumbnail(pdfUrl: string, dataUrl: string) {
  cache.set(pdfUrl, dataUrl);
}

export function getCachedThumbnail(pdfUrl: string): string | null {
  return cache.get(pdfUrl) ?? null;
}
