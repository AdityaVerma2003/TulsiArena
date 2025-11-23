  import React, { useState } from 'react';
import { Calendar, Clock, Users, Home, BookOpen, User, LogOut, Waves, MapPin } from 'lucide-react';
  import BookingForm from './BookingForm.jsx';
  
  const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
      const [bookings, setBookings] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Sample turfs data
  const turfs = [
    { id: 1, name: 'Turf', type: 'turf', price: 1500, capacity: 12, image: '🏟️', available: true },
    { id: 2, name: 'Turf + Swimming Pool', type: 'combo', price: 1200, capacity: 12, image: '🏊 + ⚽', available: true },
  ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pb-20">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 text-white p-6 shadow-lg">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
                <p className="text-blue-200 mt-1">Ready for your next game?</p>
              </div>
              <button
                onClick={() => {
                  setUser(null);
                  setCurrentPage('home');
                  setBookings([]);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Turfs Section */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-400" />
                  Available Facilities
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {turfs.map((turf) => (
                    <div
                      key={turf.id}
                      className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-blue-500/20 hover:border-blue-500/40"
                    >
                      <div className="text-6xl mb-4 text-center">{turf.image}</div>
                      <h4 className="text-2xl font-bold text-white mb-3 text-center">{turf.name}</h4>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center flex-1">
                          <p className="text-blue-300 text-sm mb-1">Price</p>
                          <p className="text-blue-400 font-bold text-2xl">₹{turf.price}</p>
                          <p className="text-blue-300 text-xs">per hour</p>
                        </div>
                        <div className="h-12 w-px bg-blue-500/30"></div>
                        <div className="text-center flex-1">
                          <p className="text-blue-300 text-sm mb-1">Capacity</p>
                          <p className="text-blue-400 font-bold text-2xl">{turf.capacity}</p>
                          <p className="text-blue-300 text-xs">persons</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFacility(turf)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">My Bookings</h3>
              {bookings.length === 0 ? (
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-12 text-center shadow-xl border border-blue-500/20">
                  <BookOpen size={64} className="mx-auto text-blue-400 mb-4" />
                  <p className="text-blue-200 text-lg">No bookings yet. Start booking now!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-blue-500/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-white">{booking.facilityName}</h4>
                          <p className="text-blue-200 mt-1">📅 {booking.date}</p>
                          <p className="text-blue-200">⏰ {booking.timeSlot}</p>
                          <p className="text-blue-200">👥 {booking.players} additional players</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">₹{booking.price}</p>
                          <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold border border-green-500/30">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-blue-300 mb-2">Name</label>
                  <p className="text-xl font-semibold text-white">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-blue-300 mb-2">Email</label>
                  <p className="text-xl font-semibold text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-blue-300 mb-2">Total Bookings</label>
                  <p className="text-xl font-semibold text-white">{bookings.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md shadow-2xl border-t border-blue-500/20">
          <div className="container mx-auto px-4">
            <div className="flex justify-around py-3">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center p-2 rounded-lg transition ${
                  activeTab === 'home' ? 'text-blue-400' : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <Home size={24} />
                <span className="text-xs mt-1 font-medium">Home</span>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex flex-col items-center p-2 rounded-lg transition ${
                  activeTab === 'bookings' ? 'text-blue-400' : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <BookOpen size={24} />
                <span className="text-xs mt-1 font-medium">Bookings</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center p-2 rounded-lg transition ${
                  activeTab === 'profile' ? 'text-blue-400' : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <User size={24} />
                <span className="text-xs mt-1 font-medium">Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {selectedFacility && (
          <BookingForm facility={selectedFacility} onClose={() => setSelectedFacility(null)} />
        )}
      </div>
    );
    
  };


  export default Dashboard;