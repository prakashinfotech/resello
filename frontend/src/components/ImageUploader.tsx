import { useRef, useState, useCallback, useEffect } from 'react';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadedImage {
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  serverUrl?: string;
}

type OnChange = (images: UploadedImage[]) => void;

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: OnChange;
  onUpload: (file: File) => Promise<string>; // returns server URL
}

/**
 * Drag-and-drop image uploader with preview, validation, and upload progress.
 * Supports JPEG, PNG, WebP up to 5MB each, max 5 images total.
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Keep a mutable ref so async upload callbacks always see the latest array
  const imagesRef = useRef<UploadedImage[]>(images);
  useEffect(() => { imagesRef.current = images; }, [images]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size must be under ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;

      const toProcess = fileArray.slice(0, remaining);

      // Build initial entries with previews
      const newEntries: UploadedImage[] = toProcess.map((file) => {
        const error = validateFile(file);
        return {
          file,
          previewUrl: URL.createObjectURL(file),
          uploading: !error,
          uploaded: false,
          error,
        };
      });

      const updated = [...images, ...newEntries];
      onChange(updated);

      // Upload valid files
      for (let i = 0; i < newEntries.length; i++) {
        const entry = newEntries[i];
        if (entry.error) continue;

        const globalIndex = images.length + i;
        try {
          const serverUrl = await onUpload(entry.file);
          const copy = [...imagesRef.current];
          copy[globalIndex] = { ...copy[globalIndex], uploading: false, uploaded: true, serverUrl };
          onChange(copy);
        } catch {
          const copy = [...imagesRef.current];
          copy[globalIndex] = { ...copy[globalIndex], uploading: false, error: 'Upload failed. Please try again.' };
          onChange(copy);
        }
      }
    },
    [images, onChange, onUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input so same file can be re-selected after removal
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const entry = images[index];
    URL.revokeObjectURL(entry.previewUrl);
    onChange(images.filter((_, i) => i !== index));
  };

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images by clicking or dragging files here"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors min-h-[44px] ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <svg
            className="mx-auto w-10 h-10 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            <span className="hidden sm:inline">Drag and drop images here, or </span>
            <span className="text-primary-600">tap to select photos</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, WebP — max {MAX_SIZE_MB}MB each — up to {MAX_IMAGES} images
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {images.length} / {MAX_IMAGES} added
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileInput}
        aria-hidden="true"
      />

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <img
                src={img.previewUrl}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Upload progress overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center p-2">
                  <p className="text-white text-xs text-center leading-tight">{img.error}</p>
                </div>
              )}

              {/* Success indicator */}
              {img.uploaded && !img.error && (
                <div className="absolute top-1 left-1">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Remove button — always visible on touch devices, hover-only on desktop */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* First image badge */}
              {index === 0 && (
                <div className="absolute bottom-1 left-1">
                  <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded">Cover</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-gray-500 text-center">
          Maximum {MAX_IMAGES} images reached. Remove an image to add another.
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
