import React, { useState } from 'react';
import { MapPin, Clock, Phone, Mail, Star, Waves, Users, Coffee, Shirt, Lock, Map, LogIn, LogOut, Edit, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { useParkData } from './hooks/useParkData';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [isEditing, setIsEditing] = useState({ timings: false, prices: false, gallery: false });
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Use the custom hook for database operations
  const {
    parkSettings,
    galleryImages,
    loading,
    error,
    updateParkSettings,
    addGalleryImage,
    removeGalleryImage
  } = useParkData();

  // Temporary data for editing
  const [tempData, setTempData] = useState({
    timings: {
      openTime: '10:00 AM',
      closeTime: '5:00 PM',
      days: 'Monday - Sunday'
    },
    prices: {
      weekday: 400,
      weekend: 500
    }
  });

  // Update temp data when park settings load
  React.useEffect(() => {
    if (parkSettings) {
      setTempData({
        timings: parkSettings.timings,
        prices: parkSettings.prices
      });
    }
  }, [parkSettings]);

  // Simple hash function for password
  const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const ADMIN_CREDENTIALS = {
    username: 'admin',
    passwordHash: '7b4b64a1' // Hash of "admin123"
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const hashedInputPassword = hashPassword(adminCredentials.password);
    
    if (adminCredentials.username === ADMIN_CREDENTIALS.username && 
        hashedInputPassword === ADMIN_CREDENTIALS.passwordHash) {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setAdminCredentials({ username: '', password: '' });
      setAdminClickCount(0);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsEditing({ timings: false, prices: false, gallery: false });
    if (parkSettings) {
      setTempData({
        timings: parkSettings.timings,
        prices: parkSettings.prices
      });
    }
    setAdminClickCount(0);
  };

  const handleLogoClick = () => {
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setShowAdminLogin(true);
        return 0;
      }
      return newCount;
    });
  };

  const startEditing = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: true }));
    if (parkSettings) {
      setTempData({
        timings: parkSettings.timings,
        prices: parkSettings.prices
      });
    }
  };

  const cancelEditing = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
    if (parkSettings) {
      setTempData({
        timings: parkSettings.timings,
        prices: parkSettings.prices
      });
    }
  };

  const saveChanges = async (section: string) => {
    try {
      if (section === 'timings' || section === 'prices') {
        await updateParkSettings(tempData);
      }
      setIsEditing(prev => ({ ...prev, [section]: false }));
    } catch (error) {
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleAddNewImage = async () => {
    if (newImageUrl.trim()) {
      try {
        await addGalleryImage(newImageUrl.trim());
        setNewImageUrl('');
      } catch (error) {
        alert('Failed to add image. Please try again.');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        try {
          await addGalleryImage(result);
        } catch (error) {
          alert('Failed to upload image. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      await removeGalleryImage(imageId);
    } catch (error) {
      alert('Failed to remove image. Please try again.');
    }
  };

  const facilities = [
    {
      icon: <Lock className="w-6 h-6" />,
      name: "Locker Room",
      price: "₹50",
      description: "Secure storage for your belongings"
    },
    {
      icon: <Shirt className="w-6 h-6" />,
      name: "Swimming Costumes",
      price: "₹100",
      description: "Rental swimming costumes available"
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      name: "Food Court",
      price: "Free Access",
      description: "Variety of food and beverages"
    }
  ];

  const founders = [
    {
      name: "Rajesh Kumar Singh",
      role: "Co-Founder",
      image: "/rajesh.jpeg",
      description: "With over 15 years in education industry and social work, Mr. Rajesh envisioned creating the ultimate water park experience for the people of Purvanchal."
    },
    {
      name: "Abhay Kumar Singh",
      role: "Co-Founder",
      image: "/abhay.jpeg",
      description: "Mr. Abhay brings expertise in facility management and customer experience optimization, with over 17 years of experience in the millitary and business management."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Sunami Water Park...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <X className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please make sure Supabase is connected and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navbar */}
      <Navbar 
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        onLogoClick={handleLogoClick}
      />

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Admin Access</h2>
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminClickCount(0);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 z-10"></div>
        <img 
          src="/2.jpeg" 
          alt="Water Park" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            Sunami Water Park
          </h2>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
            Experience the Ultimate Water Adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#gallery"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-cyan-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all text-center"
            >
              View Gallery
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Paradise</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dive into a world of endless fun and excitement at Sunami Water Park. With thrilling water slides, 
              relaxing pools, and family-friendly attractions, we offer the perfect escape for all ages.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Waves className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Thrilling Slides</h3>
              <p className="text-gray-600">Experience adrenaline-pumping water slides designed for maximum excitement.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Users className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Family Fun</h3>
              <p className="text-gray-600">Safe and enjoyable attractions for families with children of all ages.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Star className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Experience</h3>
              <p className="text-gray-600">Top-notch facilities and services for an unforgettable day out.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div className="text-center flex-1">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Experience the Fun</h2>
              <p className="text-xl text-gray-600">Take a glimpse of what awaits you at Sunami Water Park</p>
            </div>
            {isAdminLoggedIn && (
              <div className="ml-8">
                {!isEditing.gallery ? (
                  <button
                    onClick={() => startEditing('gallery')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Gallery</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveChanges('gallery')}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => cancelEditing('gallery')}
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

          {/* Add New Image (Admin Only) */}
          {isAdminLoggedIn && isEditing.gallery && (
            <div className="mb-8 bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Add New Images</h3>
              
              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Computer</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Add by URL</label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddNewImage}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <div 
                key={image.id}
                className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
              >
                <img 
                  src={image.image_url} 
                  alt={`Water Park Gallery`}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                  onClick={() => !isEditing.gallery && setSelectedImage(image.image_url)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  {isEditing.gallery ? (
                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      View Image
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Pricing & Timings</h2>
            <p className="text-xl text-gray-600">Affordable fun for everyone, every day of the week</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Timings Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="text-center flex-1">
                  <Clock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800">Operating Hours</h3>
                </div>
                {isAdminLoggedIn && (
                  <div className="ml-4">
                    {!isEditing.timings ? (
                      <button
                        onClick={() => startEditing('timings')}
                        className="text-blue-600 hover:text-blue-700 p-2"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => saveChanges('timings')}
                          className="text-green-600 hover:text-green-700 p-2"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => cancelEditing('timings')}
                          className="text-gray-600 hover:text-gray-700 p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {isEditing.timings ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                    <input
                      type="text"
                      value={tempData.timings.days}
                      onChange={(e) => setTempData(prev => ({
                        ...prev,
                        timings: { ...prev.timings, days: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Open Time</label>
                      <input
                        type="text"
                        value={tempData.timings.openTime}
                        onChange={(e) => setTempData(prev => ({
                          ...prev,
                          timings: { ...prev.timings, openTime: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Close Time</label>
                      <input
                        type="text"
                        value={tempData.timings.closeTime}
                        onChange={(e) => setTempData(prev => ({
                          ...prev,
                          timings: { ...prev.timings, closeTime: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">{parkSettings?.timings.days}</span>
                    <span className="text-cyan-600 font-bold">{parkSettings?.timings.openTime} - {parkSettings?.timings.closeTime}</span>
                  </div>
                  <p className="text-gray-600 text-center">Open all days of the week!</p>
                </div>
              )}
            </div>
            
            {/* Pricing Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="text-center flex-1">
                  <Star className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800">Ticket Prices</h3>
                </div>
                {isAdminLoggedIn && (
                  <div className="ml-4">
                    {!isEditing.prices ? (
                      <button
                        onClick={() => startEditing('prices')}
                        className="text-blue-600 hover:text-blue-700 p-2"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => saveChanges('prices')}
                          className="text-green-600 hover:text-green-700 p-2"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => cancelEditing('prices')}
                          className="text-gray-600 hover:text-gray-700 p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {isEditing.prices ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monday - Friday (₹)</label>
                    <input
                      type="number"
                      value={tempData.prices.weekday}
                      onChange={(e) => setTempData(prev => ({
                        ...prev,
                        prices: { ...prev.prices, weekday: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Saturday - Sunday (₹)</label>
                    <input
                      type="number"
                      value={tempData.prices.weekend}
                      onChange={(e) => setTempData(prev => ({
                        ...prev,
                        prices: { ...prev.prices, weekend: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">Monday - Friday</span>
                    <span className="text-green-600 font-bold text-xl">₹{parkSettings?.prices.weekday}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold">Saturday - Sunday</span>
                    <span className="text-green-600 font-bold text-xl">₹{parkSettings?.prices.weekend}</span>
                  </div>
                  <p className="text-gray-600 text-center text-sm">Includes access to all water attractions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Premium Facilities</h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect day at the water park</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-cyan-600">{facility.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{facility.name}</h3>
                  <p className="text-2xl font-bold text-cyan-600 mb-2">{facility.price}</p>
                  <p className="text-gray-600">{facility.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="founders" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Founders</h2>
            <p className="text-xl text-gray-600">The visionaries behind Sunami Water Park</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={founder.image} 
                    alt={founder.name}
                    className="w-32 h-32 rounded-full object-cover object-top mb-6"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{founder.name}</h3>
                  <p className="text-cyan-600 font-semibold mb-4">{founder.role}</p>
                  <p className="text-gray-600 leading-relaxed">{founder.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Find Us</h2>
            <p className="text-xl text-gray-600">Located in the heart of the city for easy access</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3590.9522417065414!2d83.54667487655884!3d25.838118977303957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3991f55d20cd8ef7%3A0xa4bda0ffeeb20df6!2sSunami%20Waterpark!5e0!3m2!1sen!2sin!4v1751472742101!5m2!1sen!2sin"
                width="100%"
                height="384"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-96"
              ></iframe>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Address</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Sunami Water Park<br />
                      Azamgarh Service Lane Pruvanchal Expressway right beside NH 24 (Ghazipur - Mau Road)<br />
                      Haiderganj Kelahi, Ghazipur<br />
                      Uttar Pradesh - 233226
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Directions</h3>
                    <p className="text-gray-600 leading-relaxed">
                      • 15-20 minutes from Mau<br />
                      • Free parking available<br />
                      • Accessible by Mau - Ghazipur Road<br />
                      • Very near to Pruvanchal Expressway service lane.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Waves className="w-6 h-6" />
                <span className="text-xl font-bold">Sunami Water Park</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Experience the ultimate water adventure with thrilling slides, family fun, and premium facilities.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#gallery" className="hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#facilities" className="hover:text-white transition-colors">Facilities</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+91 7838553022</li>
                <li>Sunami Water Park Azamgarh Service Lane Pruvanchal Expressway right beside NH 24(Ghazipur - Mau Road)<br />
                  Haiderganj Kelahi Ghazipur
                  Uttar Pradesh - 233226</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hours</h4>
              <p className="text-gray-400">
                {parkSettings?.timings.days}<br />
                {parkSettings?.timings.openTime} - {parkSettings?.timings.closeTime}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">© 2025 Sunami Water Park. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Water Park" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;