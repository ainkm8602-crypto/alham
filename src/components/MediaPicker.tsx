import React, { useState, useRef } from 'react';
import { useCms } from '../context/CmsContext';
import { storage, db } from '../firebase';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import {
  UploadCloud,
  FolderOpen,
  X,
  Check,
  Film,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  Play,
  Eye
} from 'lucide-react';
import { MediaItem } from '../types';

interface MediaPickerProps {
  label?: string;
  value?: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  mediaType?: 'image' | 'video' | 'any';
  category?: string;
  className?: string;
  helpText?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  label,
  value,
  onChange,
  multiple = false,
  mediaType = 'any',
  category = 'General',
  className = '',
  helpText
}) => {
  const { mediaLibrary, setMediaLibrary } = useCms();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'image' | 'video'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Helper to test if URL is a video
  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return (
      url.match(/\.(mp4|webm|ogv|mov)$/i) ||
      url.includes('video/') ||
      url.includes('data:video/')
    );
  };

  // Convert current value to array for uniform handling
  const urls: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  // Helper to compress images before uploading
  const compressImageFile = async (file: File): Promise<{ name: string; fileData: string }> => {
    // Preserve exact raw binary/vector content for SVGs, ICOs, PNGs, WebPs, GIFs, logos, favicons, or files <= 3MB.
    // Canvas conversion breaks SVG vector rendering, strips alpha channel transparency, or corrupts ICO/PNG favicons.
    const isRawFormat =
      file.type === 'image/svg+xml' ||
      file.type === 'image/x-icon' ||
      file.type.includes('icon') ||
      file.type === 'image/png' ||
      file.type === 'image/webp' ||
      file.type === 'image/gif' ||
      file.size < 3000000;

    if (!file.type.startsWith('image/') || isRawFormat) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, fileData: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            resolve({ name: file.name, fileData: compressedDataUrl });
          } else {
            resolve({ name: file.name, fileData: e.target?.result as string });
          }
        };
        img.onerror = () => {
          resolve({ name: file.name, fileData: e.target?.result as string });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload a single file to Firebase Storage & Firestore with full fallback safety
  const processSingleFileUpload = async (file: File, fileCategory: string): Promise<{ url: string; item: MediaItem }> => {
    const compressed = await compressImageFile(file);
    const mediaId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let finalUrl = '';

    // 1. Try server API /api/upload if available (and returns valid JSON)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: compressed.fileData,
          name: file.name,
          category: fileCategory,
          alt: file.name.split('.')[0]
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.url) {
          const item: MediaItem = {
            id: mediaId,
            name: file.name,
            url: data.url,
            alt: file.name.split('.')[0] || 'Uploaded Media',
            category: fileCategory,
            createdAt: new Date().toISOString()
          };
          return { url: data.url, item };
        }
      }
    } catch (e) {
      console.warn('Server upload endpoint /api/upload unavailable or non-JSON response, using cloud/base64 fallback strategy:', e);
    }

    // 2. Direct upload to Firebase Storage
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${cleanName}`);
      if (compressed.fileData.startsWith('data:')) {
        await uploadString(storageRef, compressed.fileData, 'data_url');
      } else {
        await uploadBytes(storageRef, file);
      }
      finalUrl = await getDownloadURL(storageRef);
    } catch (storageErr) {
      console.warn('Firebase Storage upload notice, fallback to compressed data URL:', storageErr);
      finalUrl = compressed.fileData;
    }

    // 3. Save Media metadata to Firestore so it appears in Media Library
    const newItem: MediaItem = {
      id: mediaId,
      name: file.name,
      url: finalUrl,
      alt: file.name.split('.')[0] || 'Uploaded Media',
      category: fileCategory,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'media', mediaId), newItem);
    } catch (fsErr) {
      console.warn('Firestore media item save notice:', fsErr);
    }

    return { url: finalUrl, item: newItem };
  };

  // Handle direct upload from device
  const handleDeviceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon'
    ];
    const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico'];
    const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB limit

    const fileList: File[] = Array.from(files);

    for (const file of fileList) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidFormat = ALLOWED_TYPES.includes(file.type.toLowerCase()) || ALLOWED_EXTS.includes(ext);

      if (!isValidFormat) {
        alert(`File "${file.name}" is not an allowed format. Only .jpg, .png, .webp, .svg, and .ico files are allowed.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        alert(`File "${file.name}" exceeds the 1MB (1024 KB) size limit. Please choose a smaller file.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    setIsUploading(true);

    try {
      const results = await Promise.all(
        fileList.map(file => processSingleFileUpload(file, category))
      );

      const newItems = results.map(r => r.item);
      const newUrls = results.map(r => r.url);

      // Instantly update local Media Library state
      setMediaLibrary(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const filteredNew = newItems.filter(item => !existingIds.has(item.id));
        return [...filteredNew, ...prev];
      });

      if (multiple) {
        onChange([...urls, ...newUrls]);
      } else if (newUrls.length > 0) {
        onChange(newUrls[0]);
      }
    } catch (err) {
      console.error('Device media upload error details:', err);
      alert(`An error occurred during upload: ${err instanceof Error ? err.message : String(err)}. Please try again.`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove a specific URL
  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const updated = urls.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  // Select from Library
  const handleSelectFromLibrary = (item: MediaItem) => {
    if (multiple) {
      if (!urls.includes(item.url)) {
        onChange([...urls, item.url]);
      }
    } else {
      onChange(item.url);
      setIsLibraryOpen(false);
    }
  };

  // Filter Media Library items
  const filteredLibrary = mediaLibrary.filter(item => {
    const matchesCategory =
      selectedCategoryFilter === 'All' ||
      item.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();

    const isVid = item.type === 'video' || isVideoUrl(item.url);
    const matchesType =
      selectedTypeFilter === 'All' ||
      (selectedTypeFilter === 'video' && isVid) ||
      (selectedTypeFilter === 'image' && !isVid);

    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className={`space-y-2 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#E8DCC8] flex items-center justify-between">
          <span>{label}</span>
          {helpText && <span className="text-[10px] font-normal text-[#E8DCC8]/60">{helpText}</span>}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDeviceUpload}
        accept={
          mediaType === 'image'
            ? 'image/*,.jpg,.jpeg,.png,.webp,.svg,.gif'
            : mediaType === 'video'
            ? 'video/*,.mp4,.webm,.mov,.ogv'
            : 'image/*,video/*,.jpg,.jpeg,.png,.webp,.svg,.gif,.mp4,.webm,.mov,.ogv'
        }
        multiple={multiple}
        className="hidden"
      />

      {/* Live Previews Container */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {urls.map((url, idx) => {
            const isVid = isVideoUrl(url);
            return (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#C8A96B]/30 bg-[#1F1A17] shadow-inner">
                {isVid ? (
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <video src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                      <Film className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-[#29231F] overflow-hidden">
                    <img src={url} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Overlay Badge & Actions */}
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono text-[#C8A96B] uppercase">
                  {isVid ? 'VIDEO' : 'IMAGE'}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(url)}
                    className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all"
                    title="Preview Fullscreen"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white rounded-lg transition-all"
                    title="Replace from Device"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3.5 py-2 bg-[#6F7655] hover:bg-[#29231F] text-white text-xs font-bold rounded-xl border border-[#6F7655] shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5 text-[#E8DCC8]" />
          )}
          <span>{urls.length > 0 ? (multiple ? 'Upload More from Device' : 'Replace from Device') : 'Upload from Device'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsLibraryOpen(true)}
          className="px-3.5 py-2 bg-[#29231F] hover:bg-[#3d3530] text-[#E8DCC8] text-xs font-medium rounded-xl border border-[#C8A96B]/30 flex items-center gap-1.5 transition-all"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>Choose from Media Library</span>
        </button>
      </div>

      {/* Fullscreen Media Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#1F1A17] border border-[#C8A96B]/40 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl text-left">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#F7F2E8]/10 flex items-center justify-between bg-[#29231F]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#F7F2E8] flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#C8A96B]" />
                  <span>Central Media Library</span>
                </h3>
                <p className="text-xs text-[#E8DCC8]/70">
                  Select any previously uploaded image or video, or upload new files directly from your device.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 text-[#E8DCC8] hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Upload Toolbar */}
            <div className="p-4 bg-[#29231F]/50 border-b border-[#F7F2E8]/10 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#C8A96B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search media assets..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-white placeholder-[#E8DCC8]/40"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <div className="flex items-center bg-[#1F1A17] p-1 rounded-xl border border-[#F7F2E8]/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedTypeFilter('All')}
                      className={`px-2.5 py-1 rounded-lg ${selectedTypeFilter === 'All' ? 'bg-[#C8A96B] text-[#29231F] font-bold' : 'text-[#E8DCC8]'}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTypeFilter('image')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${selectedTypeFilter === 'image' ? 'bg-[#C8A96B] text-[#29231F] font-bold' : 'text-[#E8DCC8]'}`}
                    >
                      <ImageIcon className="w-3 h-3" /> Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTypeFilter('video')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${selectedTypeFilter === 'video' ? 'bg-[#C8A96B] text-[#29231F] font-bold' : 'text-[#E8DCC8]'}`}
                    >
                      <Film className="w-3 h-3" /> Videos
                    </button>
                  </div>

                  {/* Upload from Device directly in Modal */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              {/* Category Sub-Filters */}
              <div className="flex gap-1.5 overflow-x-auto text-[11px]">
                {['All', 'General', 'Hero', 'Product', 'Ingredient', 'Journal', 'Logo'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedCategoryFilter === cat
                        ? 'bg-[#6F7655] text-white font-bold'
                        : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Items Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-16 text-[#E8DCC8]/50 space-y-3">
                  <FolderOpen className="w-12 h-12 mx-auto text-[#C8A96B]/40" />
                  <p className="text-sm font-medium">No media files found matching filter.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#6F7655] text-white text-xs font-bold rounded-xl"
                  >
                    Upload File from Device
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredLibrary.map(item => {
                    const isVid = item.type === 'video' || isVideoUrl(item.url);
                    const isSelected = urls.includes(item.url);

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectFromLibrary(item)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer bg-[#29231F] flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#C8A96B] ring-2 ring-[#C8A96B] shadow-lg'
                            : 'border-[#F7F2E8]/10 hover:border-[#6F7655]'
                        }`}
                      >
                        <div className="relative aspect-video bg-[#1F1A17] overflow-hidden">
                          {isVid ? (
                            <div className="w-full h-full flex items-center justify-center bg-black relative">
                              <video src={item.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white/90 fill-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}

                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-[#C8A96B] uppercase">
                            {isVid ? 'VIDEO' : 'IMAGE'}
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 bg-[#C8A96B] text-[#29231F] rounded-full">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="p-3 space-y-1 text-left bg-[#29231F]">
                          <p className="text-xs font-bold text-[#F7F2E8] truncate">{item.name}</p>
                          <div className="flex justify-between text-[10px] text-[#E8DCC8]/60">
                            <span>{item.category || 'General'}</span>
                            <span>{item.size || ''}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#F7F2E8]/10 bg-[#29231F] flex justify-between items-center text-xs">
              <span className="text-[#E8DCC8]/70">
                {urls.length > 0 ? `${urls.length} media item(s) selected` : 'No item selected'}
              </span>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-6 py-2 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-[#C8A96B]"
            >
              <X className="w-6 h-6" />
            </button>
            {isVideoUrl(previewModalUrl) ? (
              <video src={previewModalUrl} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" />
            ) : (
              <img src={previewModalUrl} alt="Fullscreen Preview" className="w-full max-h-[80vh] object-contain rounded-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
