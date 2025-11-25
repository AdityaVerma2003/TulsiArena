import { User } from 'lucide-react';
import React , {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';


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
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      } else if (isDeleting && displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else if (isDeleting && displayText.length === 0) {
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, 1000);
      }
      
      return () => clearTimeout(timeout);
    }, [displayText, isDeleting]);

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }}>
                  <animate attributeName="stop-color" values="rgba(59, 130, 246, 0.3); rgba(14, 165, 233, 0.4); rgba(59, 130, 246, 0.3)" dur="8s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" style={{ stopColor: 'rgba(14, 165, 233, 0.2)', stopOpacity: 1 }}>
                  <animate attributeName="stop-color" values="rgba(14, 165, 233, 0.2); rgba(59, 130, 246, 0.3); rgba(14, 165, 233, 0.2)" dur="8s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path fill="url(#grad1)" d="M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z">
              <animate attributeName="d" dur="12s" repeatCount="indefinite" 
                values="M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z;
                        M0,280 Q360,350 720,300 T1440,280 L1440,800 L0,800 Z;
                        M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z" />
            </path>
            <path fill="url(#grad1)" opacity="0.5" d="M0,400 Q360,320 720,380 T1440,420 L1440,800 L0,800 Z">
              <animate attributeName="d" dur="15s" repeatCount="indefinite" 
                values="M0,400 Q360,320 720,380 T1440,420 L1440,800 L0,800 Z;
                        M0,380 Q360,450 720,400 T1440,380 L1440,800 L0,800 Z;
                        M0,400 Q360,320 720,380 T1440,420 L1440,800 L0,800 Z" />
            </path>
          </svg>
        </div>

        {/* Top Navigation Bar */}
        <nav className="relative z-20 flex justify-between items-center px-8 py-6">
          {/* Admin Login - Top Right */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800/60 backdrop-blur-md rounded-full border border-blue-500/30 hover:bg-slate-700/60 transition-all hover:scale-105"
          >
            <User size={20} className="text-blue-400" />
          </button>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
          <div className="text-center max-w-5xl mx-auto">
            {/* Tagline */}
            <div className="inline-block mb-8 px-6 py-3 bg-slate-800/60 backdrop-blur-md rounded-full border border-blue-500/30">
              <p className="text-blue-300 font-medium tracking-wider text-sm uppercase animate-pulse">
                PLAY. COMPETE. REPEAT.
              </p>
            </div>

            {/* Main Heading with Animation */}
            <h2 className="text-7xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tight leading-none">
              <span className="inline-block animate-fade-in-up">BOOK</span>{' '}
              <span className="inline-block animate-fade-in-up animation-delay-200">PREMIUM</span>{' '}
              <span className="inline-block animate-fade-in-up animation-delay-400">TURF</span>
            </h2>

            {/* Animated Brackets with Typing Text */}
            <div className="flex justify-center items-center mb-12 h-16">
              <div className="text-blue-400 text-5xl font-thin">
                <span>{'{ '}</span>
                <span className="text-blue-300 text-3xl font-normal tracking-wide">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
                <span>{' }'}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/register')}
              className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-xl rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 overflow-hidden"
            >
              <span className="relative z-10">Book Your Arena Now!</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Floating Animation Styles */}
        <style>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  };



  export default HomePage;