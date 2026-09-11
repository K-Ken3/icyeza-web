import { useRef, useState } from 'react';
import { Upload, ImagePlus, Loader2, X } from 'lucide-react';
import { contentService } from '../../services/contentService';

export const ImageUpload = ({ value, onChange, label = 'Photo' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await contentService.uploadImage(file);
      onChange(res.url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <div className="flex gap-3">
        <div className="flex-1">
          {value ? (
            <div className="relative rounded-xl border border-stone-200 overflow-hidden h-40 bg-stone-50">
              <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span className="text-sm">Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <ImagePlus size={22} />
                  <span className="text-sm font-medium">Click to upload {label.toLowerCase()}</span>
                  <span className="text-xs">JPEG, PNG or WebP up to 5MB</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            aria-label={`${label} file`}
          />
        </div>
      </div>
      <input
        type="url"
        value={value.startsWith('http') || value.startsWith('/') ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="...or paste an image URL"
        className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        aria-label={`${label} URL`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-1 text-xs text-stone-400">
        <Upload size={12} />
        Uploads are stored on Cloudinary when the Cloudinary keys are set.
      </div>
    </div>
  );
};

export default ImageUpload;