 import { BookOpen, Calendar, LogOut } from "lucide-react";
import React , {useState} from "react";
 
 const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState([
      // Sample booking data
      {
        id: 1,
        facilityName: 'Turf',
        date: '2024-06-15',
        timeSlot: '10:00 AM - 11:00 AM',
        players: 5,
        price: 1500,
        status: 'Confirmed',
      },
      {
        id: 2,
        facilityName: 'Turf + Swimming Pool',
        date: '2024-06-16',
        timeSlot: '02:00 PM - 03:00 PM',
        players: 8,
        price: 2500,
        status: 'Pending',      
        },
    ]);

    // Calculate statistics
    const totalBookings = bookings.length;
    const currentMonth = new Date().getMonth();
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === currentMonth;
    }).length;

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);
    const monthlyRevenue = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === currentMonth;
    }).reduce((sum, booking) => sum + booking.price, 0);

    // Bookings by facility
    const turfBookings = bookings.filter(b => b.facilityName === 'Turf');
    const comboBookings = bookings.filter(b => b.facilityName === 'Turf + Swimming Pool');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 text-white p-6 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Admin Dashboard</h2>
              <p className="text-blue-200 mt-1">Tulsi Arena Management</p>
            </div>
            <button
              onClick={() => {
                setIsAdmin(false);
                setCurrentPage('home');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/30 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                activeTab === 'facilities'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
              }`}
            >
              By Facility
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <BookOpen size={32} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Total Bookings</p>
                      <p className="text-4xl font-bold text-white">{totalBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Calendar size={32} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">This Month</p>
                      <p className="text-4xl font-bold text-white">{monthlyBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <span className="text-3xl">💰</span>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Total Revenue</p>
                      <p className="text-3xl font-bold text-white">₹{totalRevenue}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <span className="text-3xl">📊</span>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-white">₹{monthlyRevenue}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <p className="text-blue-200 text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(-5).reverse().map((booking) => (
                      <div key={booking.id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-semibold">{booking.facilityName}</p>
                            <p className="text-blue-200 text-sm">📅 {booking.date} • ⏰ {booking.timeSlot}</p>
                            <p className="text-blue-300 text-sm">👥 {booking.players} additional players</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-400">₹{booking.price}</p>
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">All Bookings ({totalBookings})</h3>
              {bookings.length === 0 ? (
                <p className="text-blue-200 text-center py-8">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold text-lg">{booking.facilityName}</p>
                          <p className="text-blue-200">📅 {booking.date}</p>
                          <p className="text-blue-200">⏰ {booking.timeSlot}</p>
                          <p className="text-blue-300">👥 {booking.players} additional players</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">₹{booking.price}</p>
                          <span className="inline-block mt-2 text-xs px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
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

          {/* By Facility Tab */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              {/* Turf Bookings */}
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">🏟️</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Turf</h3>
                    <p className="text-blue-200">Total: {turfBookings.length} bookings</p>
                  </div>
                </div>
                {turfBookings.length === 0 ? (
                  <p className="text-blue-200 text-center py-4">No bookings for this facility</p>
                ) : (
                  <div className="space-y-3">
                    {turfBookings.map((booking) => (
                      <div key={booking.id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-blue-200">📅 {booking.date} • ⏰ {booking.timeSlot}</p>
                            <p className="text-blue-300">👥 {booking.players} additional players</p>
                          </div>
                          <p className="text-xl font-bold text-blue-400">₹{booking.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Turf + Swimming Pool Bookings */}
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">🏊⚽</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Turf + Swimming Pool</h3>
                    <p className="text-blue-200">Total: {comboBookings.length} bookings</p>
                  </div>
                </div>
                {comboBookings.length === 0 ? (
                  <p className="text-blue-200 text-center py-4">No bookings for this facility</p>
                ) : (
                  <div className="space-y-3">
                    {comboBookings.map((booking) => (
                      <div key={booking.id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-blue-200">📅 {booking.date} • ⏰ {booking.timeSlot}</p>
                            <p className="text-blue-300">👥 {booking.players} additional players</p>
                          </div>
                          <p className="text-xl font-bold text-blue-400">₹{booking.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default AdminDashboard;