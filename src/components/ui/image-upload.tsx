'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  folder?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // MB
  placeholder?: string;
  compact?: boolean; // 紧凑模式，用于小尺寸上传
}

export function ImageUpload({
  value,
  onChange,
  folder = 'blog',
  className,
  accept = 'image/*',
  maxSize = 5,
  placeholder = '点击或拖拽上传图片',
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || '上传失败');
        }

        const { url } = await res.json();
        onChange?.(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败');
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        if (file.size > maxSize * 1024 * 1024) {
          setError(`文件大小不能超过 ${maxSize}MB`);
          return;
        }
        handleUpload(file);
      }
    },
    [handleUpload, maxSize]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > maxSize * 1024 * 1024) {
          setError(`文件大小不能超过 ${maxSize}MB`);
          return;
        }
        handleUpload(file);
      }
    },
    [handleUpload, maxSize]
  );

  return (
    <div className={cn('relative', className)}>
      {/* 已上传图片预览 */}
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Uploaded"
            className={cn(
              'object-cover rounded-lg border',
              compact ? 'w-full h-full min-h-[80px]' : 'w-full h-40'
            )}
          />
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        /* 上传区域 */
        <div
          className={cn(
            'border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer',
            compact ? 'p-3 min-h-[80px]' : 'p-6',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            isUploading && 'opacity-50 pointer-events-none'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className={cn('animate-spin text-primary', compact ? 'w-5 h-5' : 'w-8 h-8')} />
              <span className="text-xs text-muted-foreground">上传中...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {error ? (
                <>
                  <ImageIcon className={cn('text-destructive', compact ? 'w-5 h-5' : 'w-8 h-8')} />
                  <span className={cn('text-destructive', compact ? 'text-xs' : 'text-sm')}>{error}</span>
                </>
              ) : (
                <>
                  <Upload className={cn('text-muted-foreground', compact ? 'w-5 h-5' : 'w-8 h-8')} />
                  <span className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>{placeholder}</span>
                  {!compact && (
                    <span className="text-xs text-muted-foreground/60">
                      支持 PNG, JPG, WEBP，最大 {maxSize}MB
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
