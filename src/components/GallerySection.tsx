import React, { useState } from 'react';
import { Edit, Save, X, Plus, Trash2, Upload, Image, Video, Play } from 'lucide-react';
import { GalleryItem } from '../lib/supabase';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  isAdminLoggedIn: boolean;
  onAddFile: (file: File) => Promise<void>;
  onAddUrl: (url: string, type: 'image' | 'video') => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onImageClick: (url: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  galleryItems,
  isAdminLoggedIn,
  onAddFile,
  onAddUrl,
  onRemoveItem,
  onImageClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newUrlType, setNewUrlType] = useState<'image' | 'video'>('image');
  const [uploading, setUploading] = useState(false);

  const images = galleryItems.filter(item => item.file_type === 'image').slice(0, 3);
  const videos = galleryItems.filter(item => item.file_type === 'video').slice(0, 3);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    setUploading(true);
    try {
      await onAddFile(file);
    } catch (error) {
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;

    try {
      await onAddUrl(newUrl.trim(), newUrlType);
      setNewUrl('');
    } catch (error) {
      alert('Failed to add URL. Please try again.');
    }
  };

  const renderMediaItem = (item: GalleryItem, index: number) => {
    if (item.file_type === 'image') {
      return (
        <div 
          key={item.id}
          className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-video"
        >
          <img 
            src={item.file_url} 
            alt={item.file_name}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            onClick={() => !isEditing && onImageClick(item.file_url)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            {isEditing ? (
              <button
                onClick={() => onRemoveItem(item.id)}
                className="bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                <Image className="w-8 h-8 text-white mb-2 mx-auto" />
                <span className="text-white text-sm font-semibold">View Image</span>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div 
          key={item.id}
          className="relative group overflow-hidden rounded-xl shadow-lg aspect-video"
        >
          <video 
            src={item.file_url}
            className="w-full h-full object-cover"
            controls={!isEditing}
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            {isEditing ? (
              <button
                onClick={() => onRemoveItem(item.id)}
                className="bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                <Play className="w-8 h-8 text-white mb-2 mx-auto" />
                <span className="text-white text-sm font-semibold">Play Video</span>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const renderEmptySlot = (type: 'image' | 'video', index: number) => (
    <div 
      key={`empty-${type}-${index}`}
      className="aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center"
    >
      <div className="text-center text-gray-400">
        {type === 'image' ? <Image className="w-12 h-12 mx-auto mb-2" /> : <Video className="w-12 h-12 mx-auto mb-2" />}
        <p className="text-sm">No {type} yet</p>
      </div>
    </div>
  );

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-16">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Experience the Fun</h2>
            <p className="text-xl text-gray-600">Take a glimpse of what awaits you at Sunami Water Park</p>
          </div>
          {isAdminLoggedIn && (
            <div className="ml-8">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Gallery</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Done</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add New Media (Admin Only) */}
        {isAdminLoggedIn && isEditing && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Add New Media</h3>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload from Computer
              </label>
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Images: PNG, JPG, GIF up to 10MB | Videos: MP4, WebM, MOV up to 50MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Add by URL
              </label>
              <div className="flex gap-4">
                <select
                  value={newUrlType}
                  onChange={(e) => setNewUrlType(e.target.value as 'image' | 'video')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Enter media URL"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddUrl}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Images Row */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Image className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-800">Images</h3>
            <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {images.length}/3
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, index) => 
              images[index] ? renderMediaItem(images[index], index) : renderEmptySlot('image', index)
            )}
          </div>
        </div>

        {/* Videos Row */}
        <div>
          <div className="flex items-center mb-6">
            <Video className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-800">Videos</h3>
            <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              {videos.length}/3
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, index) => 
              videos[index] ? renderMediaItem(videos[index], index) : renderEmptySlot('video', index)
            )}
          </div>
        </div>
      </div>
    </section>
  );
};