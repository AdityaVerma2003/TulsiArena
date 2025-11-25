import React from 'react';
import {Link} from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-4  border border-blue-900/50 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-blue-300 font-light tracking-wide">
          Developed by <span className="font-semibold text-blue-400"><Link to="https://divyashdigital.co.in/" target="_blank" rel="noopener noreferrer">DivyashDigital</Link></span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;