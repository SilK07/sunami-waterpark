import React from 'react';
import { Image } from 'lucide-react';
import { useGalleryData } from '../hooks/useGalleryData';

interface GallerySectionProps {
  onImageClick: (url: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  onImageClick
}) => {
  const { galleryItems, loading, error } = useGalleryData();

  if (loading) {
    return (
      <section id="gallery" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Experience the Fun</h2>
            <p className="text-xl text-gray-600">Take a glimpse of what awaits you at Sunami Water Park</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Experience the Fun</h2>
            <p className="text-xl text-red-600">Error loading gallery: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Experience the Fun</h2>
          <p className="text-xl text-gray-600">Take a glimpse of what awaits you at Sunami Water Park</p>
        </div>

        {/* Images Gallery */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <Image className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-800">Gallery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryItems.filter(item => item.file_type === 'image').map((image) => (
              <div 
                key={image.id}
                className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-video bg-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={image.file_url} 
                  alt={image.file_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onClick={() => onImageClick(image.file_url)}
                  onError={(e) => {
                    console.error('Image load error:', image.file_url);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyVjdBMiAyIDAgMCAwIDE5IDVINUEyIDIgMCAwIDAgMyA3VjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1YxMloiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTggMTBMMTMgMTVMMTYgMTJMMjEgMTciIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <Image className="w-8 h-8 text-white mb-2 mx-auto" />
                    <span className="text-white text-sm font-semibold">View Image</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};