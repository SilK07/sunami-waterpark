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
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const images = galleryItems.filter(item => item.file_type === 'image');
  const videos = galleryItems.filter(item => item.file_type === 'video');

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
      await onAddUrl(newUrl.trim(), activeTab === 'images' ? 'image' : 'video');
      setNewUrl('');
    } catch (error) {
      alert('Failed to add URL. Please try again.');
    }
  };

  const renderMediaItem = (item: GalleryItem) => {
    if (item.file_type === 'image') {
      return (
        <div 
          key={item.id}
          className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
        >
          <img 
            src={item.file_url} 
            alt={item.file_name}
            className="w-full h-64 object-cover transition-transform group-hover:scale-110"
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
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Image className="w-8 h-8 text-white mb-2" />
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
          className="relative group overflow-hidden rounded-xl shadow-lg"
        >
          <video 
            src={item.file_url}
            className="w-full h-64 object-cover"
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
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-8 h-8 text-white mb-2" />
                <span className="text-white text-sm font-semibold">Play Video</span>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

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

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'images'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Image className="w-5 h-5" />
              <span>Images ({images.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Videos ({videos.length})</span>
            </button>
          </div>
        </div>

        {/* Add New Media (Admin Only) */}
        {isAdminLoggedIn && isEditing && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">
              Add New {activeTab === 'images' ? 'Images' : 'Videos'}
            </h3>
            
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
                      {activeTab === 'images' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, WebM, MOV up to 50MB'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={activeTab === 'images' ? 'image/*' : 'video/*'}
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
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={`Enter ${activeTab === 'images' ? 'image' : 'video'} URL`}
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
        
        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'images' 
            ? images.map(renderMediaItem)
            : videos.map(renderMediaItem)
          }
        </div>

        {/* Empty State */}
        {((activeTab === 'images' && images.length === 0) || 
          (activeTab === 'videos' && videos.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === 'images' ? <Image className="w-16 h-16 mx-auto" /> : <Video className="w-16 h-16 mx-auto" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-500">
              {isAdminLoggedIn 
                ? `Start by adding some ${activeTab} to showcase your water park!`
                : `${activeTab} will appear here soon.`
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};