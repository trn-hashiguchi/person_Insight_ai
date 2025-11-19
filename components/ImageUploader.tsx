import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, Lock } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロード可能です。');
      return;
    }

    // Basic size check (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください。');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [disabled, onImageSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ease-in-out text-center
        ${disabled 
          ? 'border-slate-300 bg-slate-100 cursor-not-allowed' 
          : isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer'
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      {disabled ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
          <Lock className="w-10 h-10" />
          <p className="font-semibold">APIキーが設定されていません</p>
          <p className="text-sm">下の設定エリアからAPIキーを入力してください。</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
            {isDragging ? (
              <ImageIcon className="w-8 h-8 text-indigo-600" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-700">
              画像をアップロード
            </p>
            <p className="text-sm text-slate-500">
              クリックして選択 または ドラッグ＆ドロップ
            </p>
          </div>
          <div className="text-xs text-slate-400">
            PNG, JPG, WEBP (最大 10MB)
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
