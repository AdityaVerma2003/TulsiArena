import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, BookOpen, Plus, Minus, DollarSign, IndianRupee } from 'lucide-react';

const BookingForm = ({ facility, onClose, bookings, setBookings }) => {
    // Define constants
    const ADDITIONAL_PLAYER_COST = 100;
    const MAX_PLAYERS = 4;
    const BASE_PRICE = facility.price || 0;

    // State initialization
    const [formData, setFormData] = useState({
      date: '',
      timeSlot: '',
      additionalPlayers: 0, // Now controlled by buttons
      purpose: '', // New field for booking purpose
      manualPurpose: '', // New field for 'Other' purpose
    });

    const timeSlots = [
      '06:00 AM - 07:15 AM',
      '07:30 AM - 08:30 AM',
      '08:45 AM - 09:45 AM',
      '10:00 AM - 11:00 AM',
      '11:15 AM - 12:15 PM',
      '12:30 PM - 01:30 PM',
      '01:45 PM - 02:45 PM',
      '03:00 PM - 04:00 PM',
      '04:15 PM - 05:15 PM',
      '05:30 PM - 06:30 PM',
      '06:45 PM - 07:45 PM',
      '08:00 PM - 09:00 PM',
      '09:15 PM - 10:15 PM',
    ];
    
    // Calculated total price using useMemo to optimize
    const totalPrice = useMemo(() => {
        const playerCost = formData.additionalPlayers * ADDITIONAL_PLAYER_COST;
        return BASE_PRICE + playerCost;
    }, [formData.additionalPlayers, BASE_PRICE]);

    // Handler for player counter buttons
    const handlePlayerChange = (change) => {
        setFormData(prev => {
            const newCount = prev.additionalPlayers + change;
            // Ensure the count stays within the 0 to MAX_PLAYERS range
            if (newCount >= 0 && newCount <= MAX_PLAYERS) {
                return { ...prev, additionalPlayers: newCount };
            }
            return prev;
        });
    };

    const incrementPlayer = () => handlePlayerChange(1);
    const decrementPlayer = () => handlePlayerChange(-1);

    // Submission logic
    const handleSubmit = () => {
      // Input Validation checks
      if (!formData.date || !formData.timeSlot) {
        // Using console.error instead of alert as per general guidelines
        console.error('Please select date and time slot');
        return;
      }

      if (!formData.purpose) {
        console.error('Please select a booking purpose.');
        return;
      }

      if (formData.purpose === 'Other' && !formData.manualPurpose.trim()) {
        console.error('Please specify the purpose for booking.');
        return;
      }
      
      const bookingPurpose = formData.purpose === 'Other' 
        ? formData.manualPurpose.trim() 
        : formData.purpose;

      // Logic assuming `bookings` and `setBookings` are available from context/props
      const newBooking = {
        id: (bookings?.length || 0) + 1,
        facilityName: facility.name,
        date: formData.date,
        timeSlot: formData.timeSlot,
        additionalPlayers: formData.additionalPlayers,
        purpose: bookingPurpose,
        price: totalPrice, // Use the calculated total price
        status: 'Confirmed',
      };
      
      // Update the parent state if setBookings is available
      if (setBookings) {
          setBookings(prev => [...(prev || []), newBooking]);
      } else {
          console.log('Booking object created:', newBooking);
      }
      
      console.log('Booking created! Total price:', totalPrice);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-blue-500/20 max-h-[90vh] overflow-y-auto">
          <h3 className="text-3xl font-bold text-white mb-6">Book {facility.name}</h3>
          <div className="space-y-6">

            {/* Date Input */}
            <div>
              <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                <Calendar size={20} />
                Select Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Slot Select */}
            <div>
              <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                <Clock size={20} />
                Select Time Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-800">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot} className="bg-slate-800">
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Players Counter */}
            <div>
              <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                <Users size={20} />
                Additional Players (Max {MAX_PLAYERS})
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/50 border border-blue-500/30">
                <span className="text-white text-xl font-semibold">{formData.additionalPlayers}</span>
                <div className="flex space-x-3">
                  <button
                    onClick={decrementPlayer}
                    disabled={formData.additionalPlayers === 0}
                    className="p-2 bg-red-600/70 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition transform hover:scale-105"
                    aria-label="Remove player"
                  >
                    <Minus size={20} />
                  </button>
                  <button
                    onClick={incrementPlayer}
                    disabled={formData.additionalPlayers === MAX_PLAYERS}
                    className="p-2 bg-green-600/70 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition transform hover:scale-105"
                    aria-label="Add player"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Booking Purpose Dropdown (New Field) */}
            <div>
              <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                <BookOpen size={20} />
                Booking Purpose
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value, manualPurpose: '' })}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-800">Select purpose (Required)</option>
                <option value="Cricket" className="bg-slate-800">Cricket Match</option>
                <option value="Small Event" className="bg-slate-800">Small Event / Party</option>
                <option value="Wedding" className="bg-slate-800">Wedding Ceremony / Reception</option>
                <option value="Other" className="bg-slate-800">Other</option>
              </select>
            </div>

            {/* Conditional Manual Purpose Input */}
            {formData.purpose === 'Other' && (
              <div>
                <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                  <BookOpen size={20} />
                  Specify Purpose
                </label>
                <input
                  type="text"
                  value={formData.manualPurpose}
                  onChange={(e) => setFormData({ ...formData, manualPurpose: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Corporate Team Building"
                />
              </div>
            )}


            {/* Price Summary */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/30 space-y-2">
              <div className="flex justify-between text-blue-100">
                <span>Base Price:</span>
                <span className="font-semibold">₹{BASE_PRICE}</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Additional Player Cost ({formData.additionalPlayers} x ₹{ADDITIONAL_PLAYER_COST}):</span>
                <span className="font-semibold">₹{formData.additionalPlayers * ADDITIONAL_PLAYER_COST}</span>
              </div>
              <div className="h-px bg-blue-500/30 my-2"></div>
              <div className="flex justify-between text-white text-xl font-extrabold items-center">
                <span className="flex items-center gap-2">
                  <IndianRupee size={24} className="text-green-400" />
                  Total Payable:
                </span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-white font-semibold rounded-xl border border-blue-500/30 transition transform hover:scale-[1.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform transition hover:scale-105"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default BookingForm;