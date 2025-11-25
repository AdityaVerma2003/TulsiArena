import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, Users, Plus, Minus, IndianRupee, ArrowRightLeft } from 'lucide-react';

// --- Utility Functions for Dynamic Time Slot Generation ---
const generateTimeSlots = (startHour, endHour, slotDurationMinutes, gapMinutes) => {
    const slots = [];
    let currentMinutes = startHour * 60; // Convert to minutes from midnight
    const endMinutes = endHour * 60;

    while (currentMinutes + slotDurationMinutes <= endMinutes) {
        const startTime = minutesToTime(currentMinutes);
        const endTime = minutesToTime(currentMinutes + slotDurationMinutes);
        slots.push(`${startTime} - ${endTime}`);
        currentMinutes += slotDurationMinutes + gapMinutes;
    }

    return slots;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

// --- Main Component ---
const BookingForm = ({ facility, onClose, bookings, setBookings }) => {
    
    // --- Dynamic Time Slot Generation ---
    const TURF_SLOTS = useMemo(() => 
        generateTimeSlots(6, 24, 60, 5), // 6 AM to 12 AM, 1hr slots, 5min gap
        []
    );

    const TURF_POOL_SLOTS = useMemo(() => 
        generateTimeSlots(6, 24, 120, 5), // 6 AM to 12 AM, 2hr slots, 5min gap
        []
    );

    const POOL_AVAILABILITY_TEXT = 'Available: 9:00 AM to 10:00 PM';

    // --- State for Combo Order Selection ---
    const [comboOrder, setComboOrder] = useState('pool-first'); // 'pool-first' or 'turf-first'

    // --- Configuration Hook based on Facility Type ---
    const facilityConfig = useMemo(() => {
        if (facility.type === "combo") {
            return {
                type: 'Turf+Pool',
                maxPersons: 4,
                isPerPerson: false,
                costPerUnit: 100,
                slots: TURF_POOL_SLOTS, 
                playerLabel: 'Additional Players (Max 4)',
                costLabel: 'Additional Player Cost',
                initialCount: 0,
            };
        } else if (facility.type === "turf") {
            return {
                type: 'Turf',
                maxPersons: 4,
                isPerPerson: false,
                costPerUnit: 100,
                slots: TURF_SLOTS, 
                playerLabel: 'Additional Players (Max 4)',
                costLabel: 'Additional Player Cost',
                initialCount: 0,
            };
        } else if (facility.type === "pool") {
            return {
                type: 'Pool',
                maxPersons: 12,
                isPerPerson: true,
                costPerUnit: 100,
                slots: [],
                playerLabel: 'Number of Persons (Max 12)',
                costLabel: 'Per Person Cost',
                initialCount: 1,
                availabilityText: POOL_AVAILABILITY_TEXT,
            };
        }
        return {
            type: 'Default',
            maxPersons: 0,
            isPerPerson: false,
            costPerUnit: 0,
            slots: [],
            playerLabel: 'Persons',
            costLabel: 'Extra Cost',
            initialCount: 0,
            availabilityText: 'No specific time slots defined.',
        };
    }, [facility.type, TURF_SLOTS, TURF_POOL_SLOTS]);

    // --- State Initialization ---
    const [formData, setFormData] = useState({
        date: '',
        timeSlot: facilityConfig.isPerPerson ? POOL_AVAILABILITY_TEXT : '',
        personsCount: facilityConfig.initialCount, 
    });

    // Reset when facility changes
    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            personsCount: facilityConfig.initialCount,
            timeSlot: facilityConfig.isPerPerson ? POOL_AVAILABILITY_TEXT : '',
        }));
    }, [facilityConfig.initialCount, facilityConfig.isPerPerson]);

    const BASE_PRICE = facility.price || 0;

    // --- Parse Combo Time Slot Breakdown ---
    const getComboBreakdown = useCallback((timeSlot) => {
        if (facility.type !== "combo" || !timeSlot) return null;

        // Parse the time slot (e.g., "6:00 AM - 8:00 AM")
        const [startTimeStr, endTimeStr] = timeSlot.split(' - ');
        
        const parseTime = (timeStr) => {
            const [time, period] = timeStr.trim().split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const startMinutes = parseTime(startTimeStr);
        const midMinutes = startMinutes + 60; // 1 hour later
        const endMinutes = midMinutes + 5 + 60; // 5 min gap + 1 hour

        const startTime = minutesToTime(startMinutes);
        const midTime = minutesToTime(midMinutes);
        const turfStartTime = minutesToTime(midMinutes + 5);
        const endTime = minutesToTime(endMinutes);

        if (comboOrder === 'pool-first') {
            return {
                first: { type: 'Swimming Pool', time: `${startTime} - ${midTime}` },
                second: { type: 'Turf', time: `${turfStartTime} - ${endTime}` }
            };
        } else {
            return {
                first: { type: 'Turf', time: `${startTime} - ${midTime}` },
                second: { type: 'Swimming Pool', time: `${turfStartTime} - ${endTime}` }
            };
        }
    }, [facility.type, comboOrder]);

    const comboBreakdown = getComboBreakdown(formData.timeSlot);

    // --- Calculated Price ---
    const totalPrice = useMemo(() => {
        const { isPerPerson, costPerUnit } = facilityConfig;
        const count = formData.personsCount;

        if (isPerPerson) {
            return count * costPerUnit; 
        } else {
            return BASE_PRICE + (count * costPerUnit);
        }
    }, [formData.personsCount, BASE_PRICE, facilityConfig]);

    // --- Handler for Player Counter ---
    const handlePersonChange = useCallback((change) => {
        setFormData(prev => {
            const newCount = prev.personsCount + change;
            const max = facilityConfig.maxPersons;
            const min = facilityConfig.isPerPerson ? 1 : 0; 
            
            if (newCount >= min && newCount <= max) {
                return { ...prev, personsCount: newCount };
            }
            return prev;
        });
    }, [facilityConfig.maxPersons, facilityConfig.isPerPerson]);

    const incrementPerson = () => handlePersonChange(1);
    const decrementPerson = () => handlePersonChange(-1);

    // --- Submission Logic ---
    const handleSubmit = () => {
        if (!formData.date || (!facilityConfig.isPerPerson && !formData.timeSlot)) {
            alert('Please select date and time slot');
            return;
        }
        
        const newBooking = {
            id: (bookings?.length || 0) + 1,
            facilityName: facility.name,
            date: formData.date,
            timeSlot: formData.timeSlot,
            comboOrder: facility.type === "combo" ? comboOrder : null,
            personsCount: formData.personsCount,
            price: totalPrice,
            status: 'Confirmed',
        };
        
        if (setBookings) {
            setBookings(prev => [...(prev || []), newBooking]);
        }
        
        console.log('Booking created:', newBooking);
        onClose();
    };

    // --- JSX Rendering ---
    const { maxPersons, playerLabel, costLabel, isPerPerson, costPerUnit, slots, availabilityText } = facilityConfig;
    const personsCount = formData.personsCount;
    const minPersons = isPerPerson ? 1 : 0; 

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

                    {/* Time Slot Selection */}
                    <div>
                        <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                            <Clock size={20} />
                            {isPerPerson ? 'Availability' : 'Select Time Slot'}
                        </label>
                        
                        {isPerPerson ? (
                            <div className="p-4 bg-slate-700/50 rounded-xl border border-blue-500/30 text-blue-200 text-sm font-medium">
                                {availabilityText}
                            </div>
                        ) : (
                            <select
                                value={formData.timeSlot}
                                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" className="bg-slate-800">Select a time slot</option>
                                {slots.map((slot) => (
                                    <option key={slot} value={slot} className="bg-slate-800">
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Combo Order Toggle (Only for Turf + Pool) */}
                    {facility.type === "combo" && formData.timeSlot && (
                        <div className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/30">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-blue-100 font-medium">Activity Order:</span>
                                <button
                                    onClick={() => setComboOrder(prev => 
                                        prev === 'pool-first' ? 'turf-first' : 'pool-first'
                                    )}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition"
                                >
                                    <ArrowRightLeft size={16} />
                                    Switch Order
                                </button>
                            </div>
                            
                            {comboBreakdown && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">1</div>
                                        <div>
                                            <p className="text-white font-semibold">{comboBreakdown.first.type}</p>
                                            <p className="text-blue-200 text-sm">{comboBreakdown.first.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-purple-900/30 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">2</div>
                                        <div>
                                            <p className="text-white font-semibold">{comboBreakdown.second.type}</p>
                                            <p className="text-blue-200 text-sm">{comboBreakdown.second.time}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Persons Counter */}
                    <div>
                        <label className="block text-blue-100 mb-2 font-medium flex items-center gap-2">
                            <Users size={20} />
                            {playerLabel}
                        </label>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/50 border border-blue-500/30">
                            <span className="text-white text-xl font-semibold">{personsCount}</span>
                            <div className="flex space-x-3">
                                <button
                                    onClick={decrementPerson}
                                    disabled={personsCount <= minPersons} 
                                    className="p-2 bg-red-600/70 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition transform hover:scale-105"
                                >
                                    <Minus size={20} />
                                </button>
                                <button
                                    onClick={incrementPerson}
                                    disabled={personsCount >= maxPersons}
                                    className="p-2 bg-green-600/70 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition transform hover:scale-105"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Price Summary */}
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/30 space-y-2">
                        {!isPerPerson && (
                            <div className="flex justify-between text-blue-100">
                                <span>Base Price:</span>
                                <span className="font-semibold">₹{BASE_PRICE}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-blue-100">
                            <span>{costLabel}:</span>
                            <span className="font-semibold">₹{personsCount * costPerUnit}</span>
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