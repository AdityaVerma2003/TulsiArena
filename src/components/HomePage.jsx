import { User, ArrowUpRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const linkClass =
    'text-slate-300 hover:text-white transition-colors cursor-pointer';
  const reviews = [
    {
      name: 'Rohit Sharma',
      review:
        'Absolutely loved the turf quality and lighting. The ground feels professional and well maintained. Booking was super smooth and the staff was very helpful. Will definitely come back again with my team!',
      rating: 5,
    },
    {
      name: 'Aman Verma',
      review:
        'One of the best turf arenas in the city. Clean washrooms, proper parking, and excellent playing conditions. Perfect place for weekend matches and practice sessions.',
      rating: 4,
    },
    {
      name: 'Neha Singh',
      review:
        'The ambiance is amazing, especially during night games. The turf feels premium and safe to play on. Highly recommended for both casual and competitive players.',
      rating: 5,
    },
    {
      name: 'Kunal Mehta',
      review:
        'We booked TulsiArena for a corporate match and everyone loved it. Very professional setup, smooth entry, and great facilities. Totally worth the price.',
      rating: 5,
    },
    {
      name: 'Priya Kapoor',
      review:
        'Loved the overall experience. From booking to playing, everything was seamless. The turf quality is top-notch and the lighting makes night matches super enjoyable.',
      rating: 4,
    },
    {
      name: 'Arjun Malhotra',
      review:
        'Hands down the best turf I’ve played on recently. Spacious ground, premium feel, and very well organized. This is now our go-to place for football.',
      rating: 5,
    },
  ];

  const [currentReview, setCurrentReview] = useState(0);

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

  return (
    <div
      id="hero-section"
      className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Top Right Login */}
        <nav className="relative z-20 flex justify-end px-4 sm:px-8 py-6">
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
          <h1 className="
            font-black text-white tracking-tight leading-none
            text-[4.5rem]
            sm:text-[6rem]
            md:text-[8rem]
            lg:text-[12rem]
            mb-8 sm:mb-12
          ">
            TulsiArena
          </h1>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/register')}
            className="
              group flex items-center gap-3
              px-10 sm:px-12 py-4 sm:py-5
              bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
              hover:from-blue-700 hover:via-purple-700 hover:to-pink-700
              text-white
              font-bold text-lg sm:text-xl
              rounded-full
              shadow-2xl
              transition-all duration-300
              hover:scale-105
              hover:shadow-blue-500/50
            "
          >
            <span>Book Your Arena</span>
            <ArrowUpRight
              size={22}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>

      {/* Description Section with Scroll Animation */}
      <div
        id="about-section"
        className=" relative py-20 px-4 sm:px-10 overflow-hidden">
        <div
          className={`max-w-4xl mx-auto transform transition-all duration-1000 ${scrollY > 200 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
        >
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-blue-500/20 shadow-2xl">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight text-center">
              Premium Turf Experience
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-6">
              Welcome to TulsiArena, where passion meets precision. Our state-of-the-art turf facilities offer the perfect playground for athletes of all levels. Whether you're here for a casual game with friends or serious training, we provide the ultimate sporting experience.
            </p>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              Located just 20 minutes from town, our arena features premium synthetic turf, professional lighting, and modern amenities. Book your slot today and elevate your game in an environment designed for champions.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div
        id="location-section"
        className=" relative py-20 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Gallery Title */}
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${scrollY > 600 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Activities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mx-auto rounded-full"></div>
          </div>

          {/* Gallery Images - Creative Layout */}
          <div className="space-y-8 sm:space-y-12">
            {/* First Image - Horizontal with Badge */}
            <div
              className={`transform transition-all duration-1000 ${scrollY > 800 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                }`}
            >
              <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-sm sm:max-w-4xl mx-auto">
                {/* 20min Badge */}
                <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10 bg-slate-100/95 backdrop-blur-md rounded-xl sm:rounded-3xl px-4 py-2 sm:px-8 sm:py-4 shadow-xl">
                  <p className="text-2xl sm:text-5xl font-black text-slate-900 leading-none">20min</p>
                  <p className="text-xs sm:text-xl font-semibold text-slate-700 mt-0.5 sm:mt-1">From town</p>
                </div>

                <img
                  src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=700&fit=crop"
                  alt="Arena exterior view"
                  className="w-full h-[200px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Second Image - Vertical */}
            <div
              className={`transform transition-all duration-1000 ${scrollY > 1000 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                }`}
            >
              <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-[250px] sm:max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=900&fit=crop"
                  alt="Arena night view"
                  className="w-full h-[350px] sm:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Third Image - Horizontal on Right */}
            <div
              className={`transform transition-all duration-1000 ${scrollY > 1200 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                }`}
            >
              <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-sm sm:max-w-4xl ml-auto">
                <img
                  src="https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200&h=700&fit=crop"
                  alt="Arena interior facilities"
                  className="w-full h-[200px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Fourth & Fifth Images - Side by Side */}
            <div
              className={`grid grid-cols-2 gap-3 sm:gap-6 transform transition-all duration-1000 ${scrollY > 1400 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
            >
              <div className="relative group overflow-hidden rounded-xl sm:rounded-3xl shadow-2xl border border-blue-500/20">
                <img
                  src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop"
                  alt="Players in action"
                  className="w-full h-[180px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>

              <div className="relative group overflow-hidden rounded-xl sm:rounded-3xl shadow-2xl border border-blue-500/20">
                <img
                  src="https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&h=600&fit=crop"
                  alt="Arena facilities"
                  className="w-full h-[180px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Sixth Image - Vertical Centered */}
            <div
              className={`transform transition-all duration-1000 ${scrollY > 1600 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
            >
              <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/20 w-full max-w-[250px] sm:max-w-md mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=900&fit=crop"
                  alt="Arena ambiance"
                  className="w-full h-[350px] sm:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Call to Action Section */}
      <div className="relative py-6 px-4 text-center">
        <div
          className={`transform transition-all duration-1000 ${scrollY > 2000 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Ready to Play?
          </h3>
          <button
            onClick={() => navigate('/register')}
            className="
              group flex items-center gap-3 mx-auto
              px-10 sm:px-12 py-4 sm:py-5
              bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
              hover:from-blue-700 hover:via-purple-700 hover:to-pink-700
              text-white
              font-bold text-lg sm:text-xl
              rounded-full
              shadow-2xl
              transition-all duration-300
              hover:scale-105
              hover:shadow-blue-500/50
            "
          >
            <span>Book Your Slot Now</span>
            <ArrowUpRight
              size={22}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>
      {/* What People Say nav Us - Continuous Slider */}
      <div
        id="reviews-section"
        className="relative py-20 px-4 sm:px-10 overflow-hidden">
        <h2 className="text-center text-4xl sm:text-5xl md:text-6xl font-black text-white mb-20 tracking-tight">
          What People Say About Us
        </h2>

        {/* Slider Wrapper */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-8 animate-review-scroll">

            {[...reviews, ...reviews].map((item, index) => (
              <div
                key={index}
                className="min-w-[300px] sm:min-w-[420px] bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6 shadow-2xl"
              >
                {/* Stars */}
                <div className="flex mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={22}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                  “{item.review}”
                </p>

                {/* Name */}
                <h4 className="text-white font-bold text-lg">
                  {item.name}
                </h4>
              </div>
            ))}

          </div>
        </div>
      </div>
      {/* Call to Action Section */}
      <div className="relative py-6 px-4 text-center">
        <div
          className={`transform transition-all duration-1000 ${scrollY > 2000 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Book Your Visit Now
          </h3>
          <Link
            to="https://www.airbnb.co.in/rooms/1357826579917889814?source_impression_id=p3_1765883001_P3Oh8rYQCabOHF0f"
            className="
  group inline-flex items-center gap-3 mx-auto
  w-fit
  px-10 sm:px-12 py-4 sm:py-5
  bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
  hover:from-blue-700 hover:via-purple-700 hover:to-pink-700
  text-white
  font-bold text-lg sm:text-xl
  rounded-full
  shadow-2xl
  transition-all duration-300
  hover:scale-105
  hover:shadow-blue-500/50
"
          >
            <span>Book Now</span>
            <ArrowUpRight
              size={22}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>
      </div>

      <footer className="relative bg-slate-950 border-t border-blue-500/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">

          <div className="grid grid-cols-2 gap-10 sm:gap-20 text-lg">

            {/* Left Column */}
            <div className="space-y-6">
              <p
                onClick={() => {
                  const section = document.getElementById('hero-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={linkClass}
              >
                Home
              </p>
              <p
                onClick={() => {
                  const section = document.getElementById('about-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={linkClass}
              >
                About
              </p>
              <p
                onClick={() => {
                  const section = document.getElementById('location-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={linkClass}
              >
                Location
              </p>

            </div>

            {/* Right Column */}
            <div className="space-y-6">

              <p
                onClick={() => {
                  const section = document.getElementById('location-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={linkClass}
              >
                Gallery
              </p>
              <p
                onClick={() => {
                  const section = document.getElementById('reviews-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={linkClass}
              >
                Reviews
              </p>
              <p onClick={() => navigate('/')} className={linkClass}>Contact</p>
            </div>

          </div>

          {/* Bottom Text */}
          <div className="mt-20 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} TulsiArena. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default HomePage;