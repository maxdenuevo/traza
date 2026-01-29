import { useRef, useState } from 'react';
import { Icon } from '../../common/Icon';
import { storageService } from '../../../services/storage';

interface AttachmentUploaderProps {
  attachments: string[];
  onUpload: (files: FileList) => Promise<void>;
  onRemove: (url: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  disabled?: boolean;
}

export const AttachmentUploader = ({
  attachments,
  onUpload,
  onRemove,
  isUploading,
  uploadProgress,
  disabled,
}: AttachmentUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onUpload(files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (url: string) => {
    setRemovingUrl(url);
    try {
      await onRemove(url);
    } finally {
      setRemovingUrl(null);
    }
  };

  const openPreview = (url: string) => {
    const fileType = storageService.getFileType(url);
    if (fileType === 'image') {
      setPreviewUrl(url);
    } else {
      // Open in new tab for non-images
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-esant-gray-300 rounded-lg text-esant-gray-600 hover:border-esant-gray-400 hover:text-esant-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-esant-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Subiendo... {uploadProgress}%</span>
            </>
          ) : (
            <>
              <Icon name="upload" className="w-5 h-5" />
              <span>Adjuntar archivos</span>
            </>
          )}
        </button>
        <p className="text-xs text-esant-gray-500 mt-1 text-center">
          Fotos, PDFs, documentos (máx. 10MB)
        </p>
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {attachments.map((url) => (
            <AttachmentThumbnail
              key={url}
              url={url}
              onView={() => openPreview(url)}
              onRemove={() => handleRemove(url)}
              isRemoving={removingUrl === url}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-esant-gray-300"
            >
              <Icon name="x" className="w-8 h-8" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface AttachmentThumbnailProps {
  url: string;
  onView: () => void;
  onRemove: () => void;
  isRemoving: boolean;
  disabled?: boolean;
}

const AttachmentThumbnail = ({
  url,
  onView,
  onRemove,
  isRemoving,
  disabled,
}: AttachmentThumbnailProps) => {
  const fileType = storageService.getFileType(url);
  const fileName = storageService.getFileName(url);

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden bg-esant-gray-100 border border-esant-gray-200">
      {/* Thumbnail Content */}
      <button
        type="button"
        onClick={onView}
        className="w-full h-full flex items-center justify-center"
        disabled={disabled}
      >
        {fileType === 'image' ? (
          <img
            src={url}
            alt={fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2">
            <Icon
              name={fileType === 'pdf' ? 'file-text' : 'file'}
              className="w-8 h-8 text-esant-gray-400"
            />
            <span className="text-[10px] text-esant-gray-500 mt-1 truncate max-w-full px-1">
              {fileName}
            </span>
          </div>
        )}
      </button>

      {/* Remove Button */}
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={isRemoving}
          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
        >
          {isRemoving ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name="x" className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};
