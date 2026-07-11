import React, { useState, useRef } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  onChangeImages: (images: string[]) => void;
  isDemo?: boolean;
}

export function ImageUploader({ images, onChangeImages, isDemo = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [rlsErrorState, setRlsErrorState] = useState<{ file: File; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    if (file.size > 500 * 1024) {
      toast.error('File size exceeds the 500kb limit!');
      return;
    }
    try {
      setUploadProgress(20);
      setRlsErrorState(null);

      if (isDemo) {
        setUploadProgress(60);
        const base64 = await convertFileToBase64(file);
        setUploadProgress(100);
        onChangeImages([...images, base64]);
        toast.success('Added locally in Demo Mode!');
        return;
      }

      const supabase = getSupabase();
      setUploadProgress(50);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload directly to 'Shop' bucket
      const { data, error } = await supabase.storage
        .from('Shop')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (error) {
        throw error;
      }

      setUploadProgress(85);
      // Retrieve Public URL
      const { data: publicUrlData } = supabase.storage
        .from('Shop')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      onChangeImages([...images, publicUrl]);
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      console.error('Storage Upload Error:', err);
      const isRls = err.message?.toLowerCase().includes('row-level security') || 
                    err.message?.toLowerCase().includes('violates row-level security') ||
                    err.message?.toLowerCase().includes('policy') ||
                    err.message?.toLowerCase().includes('failed to fetch');

      if (isRls) {
        setRlsErrorState({
          file,
          message: err.message || 'Row Level Security policy violation.'
        });
        toast.error('Supabase RLS Policy or connection issue blocks upload.');
      } else {
        toast.error(err.message || 'Image upload failed. Is your Shop bucket created?');
      }
    } finally {
      setUploadProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  // Move image left/right to reorder
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < images.length) {
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      onChangeImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const urlToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onChangeImages(newImages);

    // Attempt to delete from Supabase storage silently if it matches our project url
    try {
      if (urlToRemove.includes('/storage/v1/object/public/Shop/')) {
        const pathParts = urlToRemove.split('/Shop/');
        if (pathParts.length > 1) {
          const filePath = decodeURIComponent(pathParts[1]);
          const supabase = getSupabase();
          supabase.storage.from('Shop').remove([filePath]);
        }
      } else if (urlToRemove.includes('/storage/v1/object/public/product-images/')) {
        const pathParts = urlToRemove.split('/product-images/');
        if (pathParts.length > 1) {
          const filePath = decodeURIComponent(pathParts[1]);
          const supabase = getSupabase();
          supabase.storage.from('product-images').remove([filePath]);
        }
      }
    } catch (e) {
      console.warn('Silent storage delete failed:', e);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Product Images
      </label>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="image-file-input"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-white rounded-full border border-gray-150 shadow-xs">
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Max image size 500kb
            </p>
          </div>
        </div>

        {/* Upload Progress Loader */}
        {uploadProgress !== null && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* RLS Policy / Connection Troubleshooting Box */}
      {rlsErrorState && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Supabase Bucket Policy Alert
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                The image upload failed with a Row-Level Security (RLS) violation or fetch failure. By default, Supabase Storage buckets restrict uploads unless an explicit permission policy is created.
              </p>
            </div>
          </div>

          <div className="bg-white/85 p-3 rounded-lg border border-amber-150 text-[11px] text-amber-900 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-amber-950">How to authorize uploads on your 'Shop' bucket:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Navigate to your <strong className="text-amber-950">Supabase Dashboard &gt; Storage &gt; Policies</strong>.</li>
              <li>Under the <strong className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">Shop</strong> bucket section, click <strong className="text-amber-950">New Policy</strong>.</li>
              <li>Select <strong className="text-amber-950">"Allowed for anonymous/authenticated users"</strong> (or customize so <code>INSERT</code>, <code>SELECT</code>, and <code>UPDATE</code> permissions are checked).</li>
              <li>Click <strong className="text-amber-950">Save Policy</strong> and retry.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (rlsErrorState.file) {
                  convertFileToBase64(rlsErrorState.file).then((base64) => {
                    onChangeImages([...images, base64]);
                    toast.success('Bypassed to local offline image!');
                    setRlsErrorState(null);
                  });
                }
              }}
              type="button"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              Use Local Image (Demo Fallback)
            </button>
            <button
              onClick={() => setRlsErrorState(null)}
              type="button"
              className="px-3 py-1.5 bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden aspect-square flex items-center justify-center shadow-xs"
            >
              <img
                src={url}
                alt={`Preview ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 text-[9px] font-bold tracking-wider bg-gray-900 text-white uppercase px-1.5 py-0.5 rounded-md border border-gray-800">
                  Primary
                </span>
              )}

              {/* Action overlays */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    type="button"
                    className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(idx, 'left');
                    }}
                    type="button"
                    className="p-1 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  {idx !== 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Move to first (Primary)
                        const newImages = [...images];
                        const item = newImages.splice(idx, 1)[0];
                        newImages.unshift(item);
                        onChangeImages(newImages);
                      }}
                      type="button"
                      className="text-[10px] font-bold tracking-tight bg-white text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Primary
                    </button>
                  )}

                  <button
                    disabled={idx === images.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(idx, 'right');
                    }}
                    type="button"
                    className="p-1 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
