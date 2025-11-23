import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const navigate= useNavigate();
  return (
     <nav className="relative z-20 flex justify-between items-center px-8 py-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <h1 className="text-2xl font-black text-white tracking-wider">
              TULSI ARENA
            </h1>
          </button>
        </nav>
  )
}

export default Navbar