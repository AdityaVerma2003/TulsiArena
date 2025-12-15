import { User, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = 'IN JUST FEW CLICKS';
  const navigate = useNavigate();

  React.useEffect(() => {
    let timeout;

    if (!isDeleting && displayText.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, 100);
    } else if (!isDeleting && displayText.length === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, 50);
    } else if (isDeleting && displayText.length === 0) {
      timeout = setTimeout(() => setIsDeleting(false), 1000);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
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
      <div className="relative z-10 flex flex-col justify-center min-h-[85vh] px-4 sm:px-10">

        {/* Brand Name */}
        <h1 className="
          font-black text-white tracking-tight leading-none
          text-[3.5rem]
          sm:text-[6rem]
          md:text-[8rem]
          lg:text-[12rem]
        ">
          TulsiArena
        </h1>

        {/* CTA */}
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 ">
          <button
            onClick={() => navigate('/register')}
            className="
              group flex items-center gap-3
              px-8 sm:px-12 py-4 sm:py-5
             bg-gradient-to-r from-blue-900 via-slate-400 to-slate-200 text-white
              font-bold text-lg sm:text-xl
              rounded-full
              shadow-xl
              transition-all duration-300
              hover:scale-105 hover:bg-gray-200
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
    </div>
  );
};

export default HomePage;