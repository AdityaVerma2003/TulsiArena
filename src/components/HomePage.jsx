import { User, ArrowUpRight, Star, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bornFireImage from '../assets/bornfire.jpeg';
import tulsiVillaImage from '../assets/tulsivilla.jpeg';
import tulsiVillaImage2 from '../assets/tulsivlla2.jpeg';
import villaPartyImage from '../assets/villaparty.jpeg';
import tulsiVillaLogo from '../assets/tulsiarena-logo.png';
import backgroundImage from '../assets/backgroundImage.jpeg'
import airbnb from '../assets/airbnb.jpeg';
import eventvenue from '../assets/eventvenue.jpeg';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [btnsVisible, setBtnsVisible] = useState(false);

 useEffect(() => {
  if (!loading) {
    const timer = setTimeout(() => setBtnsVisible(true), 300);
    return () => clearTimeout(timer);
  }
}, [loading]);

  // Booking Popup States
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    maxPersons: '',
    contactNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Loading images - luxury villas and resorts
  const loadingImages = [
    eventvenue,
    airbnb,
    tulsiVillaImage
  ];

  const linkClass = 'text-slate-300 hover:text-white transition-colors cursor-pointer';

  const reviews = [
    {
      name: 'Rohit Sharma',
      review: 'Absolutely loved the turf quality and lighting. The ground feels professional and well maintained. Booking was super smooth and the staff was very helpful. Will definitely come back again with my team!',
      rating: 5,
    },
    {
      name: 'Aman Verma',
      review: 'One of the best turf arenas in the city. Clean washrooms, proper parking, and excellent playing conditions. Perfect place for weekend matches and practice sessions.',
      rating: 4,
    },
    {
      name: 'Neha Singh',
      review: 'The ambiance is amazing, especially during night games. The turf feels premium and safe to play on. Highly recommended for both casual and competitive players.',
      rating: 5,
    },
    {
      name: 'Kunal Mehta',
      review: 'We booked TulsiArena for a corporate match and everyone loved it. Very professional setup, smooth entry, and great facilities. Totally worth the price.',
      rating: 5,
    },
    {
      name: 'Priya Kapoor',
      review: 'Loved the overall experience. From booking to playing, everything was seamless. The turf quality is top-notch and the lighting makes night matches super enjoyable.',
      rating: 4,
    },
    {
      name: 'Arjun Malhotra',
      review: "Hands down the best turf I've played on recently. Spacious ground, premium feel, and very well organized. This is now our go-to place for football.",
      rating: 5,
    },
  ];

  const [currentReview, setCurrentReview] = useState(0);

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name should only contain letters';
    }

    // Event type validation
    if (!formData.eventType) {
      errors.eventType = 'Event type is required';
    }

    // Max persons validation
    if (!formData.maxPersons) {
      errors.maxPersons = 'Number of guests is required';
    } else if (formData.maxPersons < 1) {
      errors.maxPersons = 'Must be at least 1 guest';
    } else if (formData.maxPersons > 1000) {
      errors.maxPersons = 'Maximum 1000 guests allowed';
    }

    // Contact number validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (!phoneRegex.test(formData.contactNumber.trim())) {
      errors.contactNumber = 'Enter valid 10-digit number (starting with 6-9)';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For contact number, only allow digits
    if (name === 'contactNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Booking submitted:', formData);

      setSubmitSuccess(true);

      // Reset form after 2.5 seconds
      setTimeout(() => {
        setShowBookingPopup(false);
        setSubmitSuccess(false);
        setFormData({
          name: '',
          eventType: '',
          maxPersons: '',
          contactNumber: ''
        });
        setFormErrors({});
      }, 2500);

    } catch (error) {
      console.error('Error submitting form:', error);
      setFormErrors({ submit: 'Failed to submit booking. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setShowBookingPopup(false);
    setFormErrors({});
    setSubmitSuccess(false);
    setFormData({
      name: '',
      eventType: '',
      maxPersons: '',
      contactNumber: ''
    });
  };

  // Loading animation effect
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev < loadingImages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearInterval(imageInterval);
      clearTimeout(loadingTimer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (showBookingPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showBookingPopup]);

  // Loading Screen - New Design
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden z-50">
        {/* Fixed width container for images */}
        <div className="relative w-[400px] h-[500px] overflow-hidden rounded-3xl shadow-2xl border-4 border-blue-500/30">
          {loadingImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${index === currentImageIndex
                ? 'translate-y-0 opacity-100'
                : index < currentImageIndex
                  ? '-translate-y-full opacity-0'
                  : 'translate-y-full opacity-0'
                }`}
            >
              <img
                src={img}
                alt={`Loading ${index + 1}`}
                className="w-full h-full object-contain bg-slate-900"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
          ))}

          {/* Loading Text Overlay */}
          <div className="absolute bottom-8 left-0 right-0 z-10 text-center px-6">
            <div className="flex gap-2 justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="hero-section"
      className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 animate-fadeInUp"
    >
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Top Navigation with Logo and Login */}
        <nav className="relative z-20 flex justify-between items-center px-4 sm:px-8 py-6">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate("/")}
              src={tulsiVillaLogo}
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-full flex items-center justify-center cursor-pointer" alt="Logo" />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-3 bg-slate-800/60 backdrop-blur-md rounded-full border border-blue-500/30 hover:bg-slate-700/60 transition-all"
          >
            <User size={20} className="text-blue-400" />
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[85vh] px-4 sm:px-10">
          {/* Brand Name */}
          <h1 className="font-black text-white tracking-tight leading-none text-[4.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] mb-8 sm:mb-12">
            TulsiArena
          </h1>

          {/* CTA Button */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center items-center mt-12 transform transition-all duration-700
    ${btnsVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
          >
            {/* Public Pool Button */}
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-base sm:text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
            >
              <span>Tulsi Villa Public Pool</span>
              <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            {/* Private Pool Button */}
            <a
              href="https://wa.me/918368446067?text=Hi,%20I%20would%20like%20to%20book%20the%20Tulsi%20Villa%20Private%20Pool"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 justify-center px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-base sm:text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
            >
              <span>Tulsi Villa Private Pool</span>
              <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>

            {/* Book Venue Button */}
            <button
              onClick={() => setShowBookingPopup(true)}
              className="group inline-flex items-center gap-3 justify-center px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-bold text-base sm:text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50"
            >
              <span>Book Venue</span>
              <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>

            {/* Book Slot Button */}
            <button
              onClick={() => navigate('/register')}
              className="group inline-flex items-center gap-3 justify-center px-8 py-4 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-700 hover:via-sky-700 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50"
            >
              <span>Book Your Slot Now</span>
              <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div id="about-section" className="relative py-20 px-4 sm:px-10 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">

          {/* Line 1 */}
          <p
            className={`text-lg sm:text-xl text-slate-300 leading-relaxed text-center mb-2
      transform transition-all duration-1000 
      ${scrollY > 260 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
          >
            Tulsi Villa, Prayagraj is a premium lifestyle destination that blends serene living with recreation and celebration.
            {/* Line 2 (0.2s delay) */}
            <span
              className={`text-lg sm:text-xl text-slate-300 leading-relaxed mb-2
      transform transition-all duration-1000 delay-300
      ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            >
              Set amidst peaceful surroundings, it offers a wedding lawn, farmhouse stays, Airbnb rentals, a public swimming pool, private pool, Private Villas,futsal turf, and box cricket turf—making it ideal for family living, events, sports, and leisure.
            </span>

            {/* Line 3 (0.5s delay) */}
            <span
              className={`text-lg sm:text-xl text-slate-300 leading-relaxed
      transform transition-all duration-1000 delay-700
      ${scrollY > 340 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            >
              Tulsi Villa is where comfort, community, and memorable experiences come together.
            </span>
          </p>

        </div>
      </div>

      {/* Gallery Section */}
      <div id="location-section" className="relative py-20 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${scrollY > 600 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Activities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {/* Image 1 - With animated overlay from bottom */}
            <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-sm sm:max-w-4xl mx-auto">
              <img src={bornFireImage} alt="Arena exterior view" className="w-full h-[200px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

              {/* Animated overlay from bottom */}
              <div className={`absolute top-3 left-3 sm:top-6 sm:left-6 z-10 bg-slate-100/95 backdrop-blur-md rounded-xl sm:rounded-3xl px-4 py-2 sm:px-8 sm:py-4 shadow-xl transform transition-all duration-1000 ${scrollY > 800 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <p className="text-2xl sm:text-5xl font-black text-slate-900 leading-none">20min</p>
                <p className="text-xs sm:text-xl font-semibold text-slate-700 mt-0.5 sm:mt-1">From town</p>
              </div>
            </div>

            {/* Image 2 - Slide from left */}
            <div className={`transform transition-all duration-1000 ${scrollY > 1000 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-[250px] sm:max-w-md">
                <img src={eventvenue} alt="Arena night view" className="w-full h-[350px] sm:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Image 3 - With animated overlay from bottom, image slides from right */}
            <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-sm sm:max-w-4xl ml-auto">
              <img src={airbnb} alt="Arena interior facilities" className="w-full h-[200px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

              {/* Animated overlay from bottom */}
              <div className={`absolute top-3 left-3 sm:top-6 sm:left-6 z-10 bg-slate-100/95 backdrop-blur-md rounded-xl sm:rounded-3xl px-4 py-2 sm:px-8 sm:py-4 shadow-xl transform transition-all duration-1000 delay-300 ${scrollY > 1200 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <p className="text-2xl sm:text-5xl font-black text-slate-900 leading-none">Private Villa</p>
                <p className="text-xs sm:text-xl font-semibold text-slate-700 mt-0.5 sm:mt-1">Airbnb Rental</p>
              </div>
            </div>

            {/* Grid images - Slide from left and right */}
            <div className={`grid grid-cols-2 gap-3 sm:gap-6 transform transition-all duration-1000 ${scrollY > 1400 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className={`relative group overflow-hidden rounded-xl sm:rounded-3xl shadow-2xl border border-blue-500/20 transform transition-all duration-1000 ${scrollY > 1400 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                <img src={tulsiVillaImage2} alt="Players in action" className="w-full h-[180px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
              <div className={`relative group overflow-hidden rounded-xl sm:rounded-3xl shadow-2xl border border-blue-500/20 transform transition-all duration-1000 ${scrollY > 1400 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <img src={villaPartyImage} alt="Arena facilities" className="w-full h-[180px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Image 4 - FUTSAL with animated overlay from bottom */}
            <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-[250px] sm:max-w-md mx-auto">
              <img src="https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=900&fit=crop" alt="FUTSAL Turf" className="w-full h-[350px] sm:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

              {/* Animated overlay from bottom */}
              <div className={`absolute top-3 left-3 sm:top-6 sm:left-6 z-10 bg-slate-100/95 backdrop-blur-md rounded-xl sm:rounded-3xl px-4 py-2 sm:px-8 sm:py-4 shadow-xl transform transition-all duration-1000 delay-200 ${scrollY > 1600 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <p className="text-2xl sm:text-5xl font-black text-slate-900 leading-none">FIFA Approved</p>
                <p className="text-xs sm:text-xl font-semibold text-slate-700 mt-0.5 sm:mt-1">FUTSAL Turf</p>
              </div>
            </div>

            {/* Image 5 - Box Cricket with animated overlay from bottom - FULL WIDTH */}
            <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-sm sm:max-w-4xl mx-auto">
              <img src="https://images.unsplash.com/photo-1761757106344-441482b56693?w=1200&h=700&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym94JTIwY3JpY2tldHxlbnwwfHwwfHx8MA%3D%3D" alt="Box Cricket" className="w-full h-[200px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

              {/* Animated overlay from bottom */}
              <div className={`absolute top-3 left-3 sm:top-6 sm:left-6 z-10 bg-slate-100/95 backdrop-blur-md rounded-xl sm:rounded-3xl px-4 py-2 sm:px-8 sm:py-4 shadow-xl transform transition-all duration-1000 delay-300 ${scrollY > 1800 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <p className="text-2xl sm:text-5xl font-black text-slate-900 leading-none">Box Cricket</p>
                <p className="text-xs sm:text-xl font-semibold text-slate-700 mt-0.5 sm:mt-1">Play with friends</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative py-6 px-4 text-center">
        <div className={`transform transition-all duration-1000 ${scrollY > 2000 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-8">Ready to Play?</h3>
          <button onClick={() => navigate('/register')}
            className="group flex items-center gap-3 mx-auto px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg sm:text-xl rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50">
            <span>Book Your Slot Now</span>
            <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="relative py-20 px-4 sm:px-10 overflow-hidden">
        <h2 className="text-center text-4xl sm:text-5xl md:text-6xl font-black text-white mb-20 tracking-tight">
          What People Say About Us
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-8 animate-scroll-infinite">
            {[...reviews, ...reviews].map((item, index) => (
              <div key={index} className="min-w-[300px] sm:min-w-[420px] bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={22} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">"{item.review}"</p>
                <h4 className="text-white font-bold text-lg">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Book Venue */}
      <div className="relative py-6 px-4 text-center">
        <div className={`transform transition-all duration-1000 ${scrollY > 2000 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-8">Book Your Venue Now</h3>
          <button
            onClick={() => setShowBookingPopup(true)}
            className="group inline-flex items-center gap-3 mx-auto w-fit px-10 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg sm:text-xl rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
          >
            <span>Book Venue</span>
            <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>

      {/* Booking Popup Modal */}
      {showBookingPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Success Message */}
            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Booking Submitted!</h3>
                <p className="text-slate-300">We'll contact you shortly to confirm your booking.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-black text-white mb-2">Book Venue</h2>
                  <p className="text-slate-400">Fill in your details and we'll get back to you</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-slate-800/50 border ${formErrors.name ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Event Type Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Event Type <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-slate-800/50 border ${formErrors.eventType ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="Enter event type (e.g. Wedding, Party, Sports)"
                    />
                    {formErrors.eventType && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {formErrors.eventType}
                      </p>
                    )}
                  </div>

                  {/* Max Persons Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Number of Guests <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxPersons"
                      value={formData.maxPersons}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-slate-800/50 border ${formErrors.maxPersons ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="Expected number of guests"
                      min="1"
                    />
                    {formErrors.maxPersons && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {formErrors.maxPersons}
                      </p>
                    )}
                  </div>

                  {/* Contact Number Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-slate-800/50 border ${formErrors.contactNumber ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {formErrors.contactNumber && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span> {formErrors.contactNumber}
                      </p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {formErrors.submit && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg">
                      {formErrors.submit}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-full shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative bg-slate-950 border-t border-blue-500/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
          <div className="grid grid-cols-2 gap-10 sm:gap-20 text-lg">
            <div className="space-y-6">
              <p onClick={() => { const section = document.getElementById('hero-section'); section?.scrollIntoView({ behavior: 'smooth' }); }} className={linkClass}>Home</p>
              <p onClick={() => { const section = document.getElementById('about-section'); section?.scrollIntoView({ behavior: 'smooth' }); }} className={linkClass}>About</p>
              <p onClick={() => { const section = document.getElementById('location-section'); section?.scrollIntoView({ behavior: 'smooth' }); }} className={linkClass}>Location</p>
            </div>
            <div className="space-y-6">
              <p onClick={() => { const section = document.getElementById('location-section'); section?.scrollIntoView({ behavior: 'smooth' }); }} className={linkClass}>Gallery</p>
              <p onClick={() => { const section = document.getElementById('reviews-section'); section?.scrollIntoView({ behavior: 'smooth' }); }} className={linkClass}>Reviews</p>
              <p onClick={() => navigate('/contact')} className={linkClass}>Contact</p>
            </div>
          </div>
          <div className="mt-20 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} TulsiArena. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scrollInfinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }

        .animate-scroll-infinite {
          animation: scrollInfinite 30s linear infinite;
        }

        .animate-scroll-infinite:hover {
          animation-play-state: paused;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        /* Custom scrollbar for popup */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}
      </style>
    </div>
  );
};

export default HomePage;