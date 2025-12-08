import { BookOpen, Calendar, LogOut, Eye, Mail, Phone, Users, Tag, IndianRupee, Clock, X, Building2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// --- Sub Component: Booking Details Modal ---
const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const { user, date, timeSlots, additionalPlayers, basePrice, totalPrice, status, paymentStatus, facilityName, facilityType, createdAt } = booking;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg lg:max-w-xl border border-blue-500/30 relative text-white max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 hover:bg-red-600 transition"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl font-bold mb-6 text-blue-300 border-b border-blue-500/20 pb-3">Booking Details</h2>

                    {/* Facility and Status */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-xl">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Tag size={20} className="text-blue-400" />
                                {facilityName}
                            </h3>
                            <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 font-medium">
                                {facilityType}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                                <p className="text-xs text-blue-300 mb-1">Status</p>
                                <span className="text-sm font-semibold text-green-400">
                                    {status}
                                </span>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                                <p className="text-xs text-blue-300 mb-1">Payment</p>
                                <span className={`text-sm font-semibold ${paymentStatus === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>
                                    {paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* User Information */}
                    <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-blue-500/20">
                        <h4 className="text-lg font-bold text-blue-200 mb-3 border-b border-blue-500/20 pb-2">Booked By:</h4>
                        <p className="text-white font-semibold flex items-center gap-2 mb-2">{user?.name || 'N/A'}</p>
                        <p className="text-blue-300 text-sm flex items-center gap-2 mb-1"><Mail size={16} /> {user?.email || 'N/A'}</p>
                        <p className="text-blue-300 text-sm flex items-center gap-2"><Phone size={16} /> {user?.mobile || 'N/A'}</p>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-blue-200 bg-slate-700/30 p-3 rounded-lg">
                            <Calendar size={18} className="text-blue-400" />
                            <span className="flex-grow ml-3">Date:</span>
                            <span className="font-semibold text-white">{new Date(date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-start justify-between text-blue-200 bg-slate-700/30 p-3 rounded-lg">
                            <Clock size={18} className="text-blue-400 mt-1" />
                            <span className="flex-grow ml-3">Time Slots:</span>
                            <div className="text-right space-y-1">
                                {timeSlots.map((time, idx) => (
                                    <span key={idx} className="block font-semibold text-white">{time}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-blue-200 bg-slate-700/30 p-3 rounded-lg">
                            <Users size={18} className="text-blue-400" />
                            <span className="flex-grow ml-3">Additional Players:</span>
                            <span className="font-semibold text-white">{additionalPlayers}</span>
                        </div>

                        <div className="flex items-center justify-between text-blue-200 bg-slate-700/30 p-3 rounded-lg">
                            <IndianRupee size={18} className="text-green-400" />
                            <span className="flex-grow ml-3">Base Price:</span>
                            <span className="font-semibold text-white">₹{basePrice}</span>
                        </div>

                        <div className="flex items-center justify-between text-white text-xl font-bold bg-green-900/40 p-3 rounded-lg border border-green-500/30">
                            <span className="flex items-center gap-2">Total Price:</span>
                            <span className="flex items-center">
                                <IndianRupee size={20} />{totalPrice}
                            </span>
                        </div>

                        <p className="text-xs text-blue-500 pt-2">Booked on: {new Date(createdAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [facilityStats, setFacilityStats] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [facilityBookings, setFacilityBookings] = useState([]);
    const [loadingFacilityBookings, setLoadingFacilityBookings] = useState(false);
    
    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const getDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.get(`${API_URL}/api/admin/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStats(resp.data.stats);
            setFacilityStats(resp.data.stats.facilityStats || []);
        } catch (error) {
            console.error("Error in fetching dashboard stats:", error);
        }
    };

    const getBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.get(`${API_URL}/api/admin/bookings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Sort by creation date descending (most recent first)
            const sortedBookings = resp.data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sortedBookings);
        } catch (error) {
            console.error("Error in fetching bookings:", error);
        }
    };

    const getUsers = async () => {
        setLoadingUsers(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.get(`${API_URL}/api/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (resp.data.success) {
                setUsers(resp.data.users);
            }
        } catch (error) {
            console.error("Error in fetching users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const getBookingsByFacility = async (facilityName) => {
        setLoadingFacilityBookings(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.get(`${API_URL}/api/admin/bookings/facility/${facilityName}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (resp.data.success) {
                setFacilityBookings(resp.data.bookings);
                setSelectedFacility(facilityName);
            }
        } catch (error) {
            console.error("Error in fetching facility bookings:", error);
        } finally {
            setLoadingFacilityBookings(false);
        }
    };

    const exportToExcel = () => {
        if (!bookings || bookings.length === 0) {
            alert("No bookings available to export");
            return;
        }

        // Clean data (remove _id & __v)
        const cleanedData = bookings.map((b) => ({
            Name: b.user?.name || "",
            Email: b.user?.email || "",
            Mobile: b.user?.mobile || "",
            FacilityName: b.facilityName,
            FacilityType: b.facilityType,
            Date: new Date(b.date).toLocaleDateString(),
            TimeSlots: b.timeSlots.join(", "),
            AdditionalPlayers: b.additionalPlayers,
            BasePrice: b.basePrice,
            AdditionalPlayersCost: b.additionalPlayersCost,
            TotalPrice: b.totalPrice,
            Status: b.status,
            PaymentStatus: b.paymentStatus,
            CreatedAt: new Date(b.createdAt).toLocaleString(),
        }));

        const ws = XLSX.utils.json_to_sheet(cleanedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, "Bookings.xlsx");
    };

    const exportFacilityBookingsToExcel = () => {
        if (!facilityBookings || facilityBookings.length === 0) {
            alert("No bookings available to export");
            return;
        }

        const cleanedData = facilityBookings.map((b) => ({
            Name: b.user?.name || "",
            Email: b.user?.email || "",
            Mobile: b.user?.mobile || "",
            Date: new Date(b.date).toLocaleDateString(),
            TimeSlots: b.timeSlots.join(", "),
            AdditionalPlayers: b.additionalPlayers,
            BasePrice: b.basePrice,
            TotalPrice: b.totalPrice,
            Status: b.status,
            PaymentStatus: b.paymentStatus,
            CreatedAt: new Date(b.createdAt).toLocaleString(),
        }));

        const ws = XLSX.utils.json_to_sheet(cleanedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedFacility);
        XLSX.writeFile(wb, `${selectedFacility}_Bookings.xlsx`);
    };

    const exportUsersToExcel = () => {
        if (!users || users.length === 0) {
            alert("No users available to export");
            return;
        }
        const cleanedData = users.map((u) => ({
            Name: u.name,
            Email: u.email,
            Mobile: u.mobile || 'N/A',
            JoinedAt: new Date(u.createdAt).toLocaleDateString()
        }));
        const worksheet = XLSX.utils.json_to_sheet(cleanedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "tulsi_arena_users.xlsx");
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    }, []);

    useEffect(() => {
        getDashboardStats();
        getBookings();
        getUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
            
            {/* Modal */}
            {isModalOpen && <BookingDetailsModal booking={selectedBooking} onClose={handleCloseModal} />}

            {/* Header */}
            <div className="bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 text-white p-6 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                        <p className="text-blue-200 mt-1">Tulsi Arena Management</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/30 transition"
                    >
                        <LogOut size={15} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base ${activeTab === 'overview'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base ${activeTab === 'bookings'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
                            }`}
                    >
                        All Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('facilities')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base flex items-center gap-2 ${activeTab === 'facilities'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
                            }`}
                    >
                        <Building2 size={18} />
                        Facilities
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base ${activeTab === 'users'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/40 text-blue-200 hover:bg-slate-800/60'
                            }`}
                    >
                        Users
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
                                        <p className="text-4xl font-bold text-white">{stats.totalBookings}</p>
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
                                        <p className="text-4xl font-bold text-white">{stats.monthlyBookings}</p>
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
                                        <p className="text-3xl font-bold text-white">₹{stats.totalRevenue}</p>
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
                                        <p className="text-3xl font-bold text-white">₹{stats.monthlyRevenue}</p>
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
                                    {bookings.slice(0, 5).map((booking) => (
                                        <div key={booking._id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10 flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-semibold">{booking.facilityName}</p>
                                                <p className="text-blue-200 text-sm">📅 {new Date(booking.date).toLocaleDateString()} </p>
                                                <p className="text-blue-300 text-sm">By: {booking.user?.name || 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-xl font-bold text-blue-400">₹{booking.totalPrice}</p>
                                                <button
                                                    onClick={() => handleViewDetails(booking)}
                                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-white">All Bookings ({bookings.length})</h3>
                            <button
                                onClick={exportToExcel}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg flex items-center gap-2"
                            >
                                📥 Export to Excel
                            </button>
                        </div>
                        {bookings.length === 0 ? (
                            <p className="text-blue-200 text-center py-8">No bookings yet</p>
                        ) : (
                            <div className="space-y-3">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10 flex justify-between items-center transition hover:bg-slate-700/50">
                                        <div className="flex-grow">
                                            <p className="text-white font-semibold flex items-center gap-2">
                                                <Tag size={16} className="text-blue-400" />{booking.facilityName}
                                            </p>
                                            <p className="text-blue-200 text-sm ml-6">
                                                📅 {new Date(booking.date).toLocaleDateString()} @ {booking.timeSlots[0]}
                                            </p>
                                            <p className="text-blue-300 text-xs ml-6 mt-1">
                                                By: {booking.user?.name || 'N/A'} | Total: ₹{booking.totalPrice}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${booking.status === 'Confirmed'
                                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <button
                                                onClick={() => handleViewDetails(booking)}
                                                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition transform hover:scale-105 shadow-md shadow-blue-500/30"
                                                title="View User and Booking Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Facilities Tab - NEW */}
                {activeTab === 'facilities' && (
                    <div className="space-y-6">
                        {/* Facility Stats Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {facilityStats.map((facility) => (
                                <div 
                                    key={facility._id} 
                                    onClick={() => getBookingsByFacility(facility._id)}
                                    className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 cursor-pointer hover:bg-slate-800/60 transition transform hover:scale-105"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-500/20 rounded-xl">
                                            <Building2 size={32} className="text-purple-400" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-blue-200">Total Bookings</p>
                                            <p className="text-3xl font-bold text-white">{facility.count}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{facility._id}</h3>
                                    <p className="text-green-400 text-lg font-semibold">₹{facility.revenue}</p>
                                    <p className="text-xs text-blue-300 mt-2">Click to view bookings →</p>
                                </div>
                            ))}
                        </div>

                        {/* Facility Bookings Details */}
                        {selectedFacility && (
                            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{selectedFacility} Bookings</h3>
                                        <p className="text-blue-200 mt-1">Total: {facilityBookings.length} bookings</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={exportFacilityBookingsToExcel}
                                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg flex items-center gap-2"
                                        >
                                            📥 Export
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedFacility(null);
                                                setFacilityBookings([]);
                                            }}
                                            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>

                                {loadingFacilityBookings ? (
                                    <div className="text-center py-8">
                                        <p className="text-blue-200">Loading bookings...</p>
                                    </div>
                                ) : facilityBookings.length === 0 ? (
                                    <p className="text-blue-200 text-center py-8">No bookings found</p>
                                ) : (
                                    <div className="space-y-3">
                                        {facilityBookings.map((booking) => (
                                            <div key={booking._id} className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/10 flex justify-between items-center transition hover:bg-slate-700/50">
                                                <div className="flex-grow">
                                                    <p className="text-white font-semibold">
                                                        {booking.user?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-blue-200 text-sm">
                                                        📅 {new Date(booking.date).toLocaleDateString()} @ {booking.timeSlots[0]}
                                                    </p>
                                                    <p className="text-blue-300 text-xs mt-1">
                                                        Total: ₹{booking.totalPrice} | {booking.status}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleViewDetails(booking)}
                                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition transform hover:scale-105 shadow-md shadow-blue-500/30"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">All Users</h3>
                                <p className="text-blue-200 mt-1">Total Users: {users.length}</p>
                            </div>
                            <button
                                onClick={exportUsersToExcel}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg flex items-center gap-2"
>
📥 Export to Excel
</button>
</div>
                    {loadingUsers ? (
                        <div className="text-center py-8">
                            <p className="text-blue-200">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-blue-200 text-center py-8">No users found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-blue-500/20">
                                        <th className="text-left py-3 px-4 text-blue-200 font-semibold">Name</th>
                                        <th className="text-left py-3 px-4 text-blue-200 font-semibold">Email</th>
                                        <th className="text-left py-3 px-4 text-blue-200 font-semibold">Mobile</th>
                                        <th className="text-left py-3 px-4 text-blue-200 font-semibold">Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-blue-500/10 hover:bg-slate-700/20 transition">
                                            <td className="py-4 px-4">
                                                <p className="text-white font-semibold">{user.name}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-blue-200">{user.email}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-blue-200">{user.mobile || 'N/A'}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-blue-200">{new Date(user.createdAt).toLocaleDateString()}</p>
                                                <p className="text-blue-300 text-xs">{new Date(user.createdAt).toLocaleTimeString()}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);
};
export default AdminDashboard;