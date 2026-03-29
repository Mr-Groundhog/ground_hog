"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

// 图片上传配置
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

// 生成唯一文件名（私有空间用）- 原始文件名 + 随机六位数
function generateKey(fileName: string): string {
  // 获取文件扩展名
  const ext = fileName.split('.').pop() || 'png';
  // 获取不带扩展名的文件名
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  // 生成随机六位数
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  // 清理文件名中的特殊字符，只保留字母、数字、中文、下划线和连字符
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
  return `blog/${cleanName}_${random}.${ext}`;
}

// 获取上传 token（私有空间需要传入 key）
async function getUploadToken(key: string): Promise<string> {
  const response = await fetch(`/api/upload/token?key=${encodeURIComponent(key)}`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || '获取上传凭证失败');
  }
  return data.token;
}

// 上传单个文件到七牛云（私有空间）
async function uploadToQiniu(file: File): Promise<string> {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过 4MB 限制，当前文件: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // 生成 key
  const key = generateKey(file.name);
  
  // 获取上传 token（私有空间需要 bucket:key 格式）
  const token = await getUploadToken(key);

  // 构建表单数据
  const formData = new FormData();
  formData.append('file', file);
  formData.append('token', token);
  formData.append('key', key);

  // 上传到七牛云 (华北机房)
  const uploadUrl = 'https://upload.qiniup.com';
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`上传失败: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error || '上传失败');
  }

  // 返回完整的图片 URL
  return `${env.QINIU.domain}/${result.key}`;
}

export default function TestQiniuUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string; size: string }[]>([]);
  const [tokenInfo, setTokenInfo] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  // 测试获取 Token
  const testGetToken = async () => {
    try {
      const testKey = generateKey('test.png');
      const token = await getUploadToken(testKey);
      setTokenInfo(token);
      toast.success('获取 Token 成功');
      console.log('Token:', token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '获取 Token 失败');
    }
  };

  // 处理文件上传
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 检查是否是图片
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} 不是图片文件`);
          continue;
        }

        toast.info(`正在上传: ${file.name}`);
        
        const url = await uploadToQiniu(file);
        
        setUploadedImages(prev => [...prev, {
          name: file.name,
          url,
          size: `${(file.size / 1024).toFixed(2)} KB`
        }]);
        
        toast.success(`上传成功: ${file.name}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
    e.target.value = ''; // 重置以便重复选择同一文件
  };

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  // 粘贴处理
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(f => dataTransfer.items.add(f));
      handleUpload(dataTransfer.files);
    }
  }, []);

  // 清空列表
  const clearImages = () => {
    setUploadedImages([]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">七牛云图片上传测试</h1>
        
        {/* 配置信息 */}
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold">配置信息</h2>
          <div className="grid gap-2 text-sm text-zinc-400">
            <p>Bucket: <span className="text-zinc-200">{process.env.NEXT_PUBLIC_QINIU_BUCKET || '未配置'}</span></p>
            <p>Domain: <span className="text-zinc-200">{env.QINIU.domain || '未配置'}</span></p>
            <p>上传目录: <span className="text-zinc-200">blog/</span></p>
            <p>文件大小限制: <span className="text-zinc-200">4MB</span></p>
          </div>
        </div>

        {/* Token 测试 */}
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold">Token 测试</h2>
          <div className="flex gap-4">
            <Button onClick={testGetToken} variant="outline">
              获取上传 Token
            </Button>
          </div>
          {tokenInfo && (
            <div className="mt-3">
              <p className="mb-1 text-sm text-zinc-400">Token:</p>
              <code className="block max-h-32 overflow-auto rounded bg-zinc-800 p-2 text-xs break-all">
                {tokenInfo}
              </code>
            </div>
          )}
        </div>

        {/* 上传区域 */}
        <div 
          className={`mb-6 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            dragOver 
              ? 'border-orange-500 bg-orange-500/10' 
              : 'border-zinc-700 hover:border-zinc-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <div className="mb-4 text-5xl">📷</div>
          <p className="mb-2 text-lg text-zinc-300">
            拖拽图片到这里上传
          </p>
          <p className="mb-4 text-sm text-zinc-500">
            或者粘贴图片 (Ctrl+V)
          </p>
          <label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span>{isUploading ? '上传中...' : '选择文件'}</span>
            </Button>
          </label>
        </div>

        {/* 上传结果 */}
        {uploadedImages.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">上传结果 ({uploadedImages.length})</h2>
              <Button onClick={clearImages} variant="ghost" size="sm">
                清空
              </Button>
            </div>
            <div className="grid gap-4">
              {uploadedImages.map((img, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 rounded-lg bg-zinc-800 p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.url} 
                    alt={img.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{img.name}</p>
                    <p className="text-sm text-zinc-400">大小: {img.size}</p>
                    <a 
                      href={img.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-orange-400 hover:underline break-all"
                    >
                      {img.url}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`![${img.name}](${img.url})`);
                      toast.success('Markdown 链接已复制');
                    }}
                  >
                    复制
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 测试步骤说明 */}
        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold">测试步骤</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-400">
            <li>点击"获取上传 Token"按钮测试后端 Token 生成</li>
            <li>拖拽图片或点击"选择文件"上传图片</li>
            <li>也可以直接 Ctrl+V 粘贴剪贴板中的图片</li>
            <li>上传成功后会显示图片预览和链接</li>
            <li>点击"复制"可复制 Markdown 格式的图片链接</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
