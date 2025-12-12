import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Calendar, Clock, Users, ArrowRightLeft, Tag, X, IndianRupee,
    Plus, Minus, Timer
} from 'lucide-react'; 

const API_URL = import.meta.env.VITE_API_URL; 

// --- Utility Functions (No Change) ---

const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

const generateTimeSlots = (startHour, endHour, slotDurationMinutes, gapMinutes) => {
    const slots = [];
    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes + slotDurationMinutes <= endMinutes) {
        const startTime = minutesToTime(currentMinutes);
        const endTime = minutesToTime(currentMinutes + slotDurationMinutes);
        slots.push(`${startTime} - ${endTime}`);
        currentMinutes += slotDurationMinutes + gapMinutes;
    }
    return slots;
};

const getNextHourSlot = (currentSlot) => {
    if (!currentSlot) return null;
    const [startTimeStr] = currentSlot.split(' - ');
    const startTimeMinutes = timeToMinutes(startTimeStr);
    
    const turfEndTimeMinutes = startTimeMinutes + 60;
    const poolEndTimeMinutes = turfEndTimeMinutes + 60; 

    const poolStartTimeStr = minutesToTime(turfEndTimeMinutes);
    const poolEndTimeStr = minutesToTime(poolEndTimeMinutes);

    return `${poolStartTimeStr} - ${poolEndTimeStr}`;
}

const getPoolEndTime = (currentSlot) => {
    if (!currentSlot) return null;
    const [, endTimeStr] = currentSlot.split(' - ');
    const endTimeMinutes = timeToMinutes(endTimeStr);
    
    const finalEndTimeMinutes = endTimeMinutes + 180; 
    
    return minutesToTime(finalEndTimeMinutes);
}

// Time Slot Configuration 
const TURF_SLOTS = generateTimeSlots(6, 24, 60, 5);
const DEFAULT_POOL_SLOT_FOR_API = '9:00 AM - 10:00 AM';

// Helper to get today's date string
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// --- Sub Component: Date Selector UI (No Change) ---
const DateSelector = ({ selectedDate, setSelectedDate }) => {
    const todayString = useMemo(getTodayDateString, []);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const isDateSelected = !!selectedDate;

    return (
        <div className="relative">
            <div
                className={`
                    w-full p-4 rounded-xl flex items-center gap-3 font-semibold transition-all duration-300 cursor-pointer
                    ${isDateSelected
                        ? 'bg-gradient-to-r from-blue-700 to-indigo-600 shadow-xl shadow-blue-500/30 text-white transform hover:scale-[1.01]'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-blue-300 border border-blue-500/30'
                    }
                `}
            >
                <Calendar size={24} className={isDateSelected ? 'text-white' : 'text-blue-500'} />

                <span className={`flex-grow ${isDateSelected ? 'text-lg font-bold' : 'text-md'}`}>
                    {isDateSelected
                        ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Tap here to select your booking date'}
                </span>

                {isDateSelected && (
                    <Clock size={20} className="text-white ml-2" />
                )}

                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={todayString}
                    className="
                        absolute inset-0 w-full h-full opacity-0 cursor-pointer 
                        [&::-webkit-calendar-picker-indicator]:opacity-100 
                        [&::-webkit-calendar-picker-indicator]:absolute 
                        [&::-webkit-calendar-picker-indicator]:w-full 
                        [&::-webkit-calendar-picker-indicator]:h-full 
                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    "
                    aria-label="Select Date"
                />
            </div>
        </div>
    );
};

// --- Sub Component: Time Slot Selector UI ---
// 🚀 UPDATED PROP: existingBookings is replaced by blockedSlots
const TimeSlotSelector = ({ date, selectedSlots, setSelectedSlots, facilityType, blockedSlots, slots }) => {

    // 🚀 UPDATED LOGIC: Check against the master list of all blocked slots
    const isSlotBooked = useCallback((slot) => {
        // blockedSlots now contains all timeSlots booked by Turf or Combo on this date
        return blockedSlots.includes(slot);
    }, [blockedSlots]);

    const isSlotInPast = useCallback((slot) => {
        const todayString = getTodayDateString();
        if (!date || date !== todayString) {
            return false;
        }

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        const startTimeStr = slot.split(' - ')[0];
        const slotStartMinutes = timeToMinutes(startTimeStr);

        const SLOT_START_THRESHOLD = slotStartMinutes;

        // Slot is in the past if its start time is more than 5 minutes ago.
        return SLOT_START_THRESHOLD < nowMinutes - 5; 
        
    }, [date]);

 const handleSlotToggle = useCallback(
  (slot) => {
    const isSingleSelect = facilityType === 'combo' || facilityType === 'pool';

    if (isSingleSelect) {
      // keep single selection
      const isCurrentlySelected = selectedSlots.includes(slot);
      setSelectedSlots(isCurrentlySelected ? [] : [slot]);
      return;
    }

    // MULTIPLE SELECTION FOR TURF
    const isSelected = selectedSlots.includes(slot);

    if (isSelected) {
      // remove slot from list
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      // add slot to list
      setSelectedSlots([...selectedSlots, slot]);
    }
  },
  [setSelectedSlots, selectedSlots, facilityType]
);

    if (!date) {
        return (
            <div className="p-4 bg-slate-700/50 rounded-xl text-blue-300 text-center border border-blue-500/30">
                Please select a date first to view available time slots.
            </div>
        );
    }

    const currentSelectedSlots = Array.isArray(selectedSlots) ? selectedSlots : [];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
            {slots.map((slot) => {
                const isBooked = isSlotBooked(slot);
                const isInPast = isSlotInPast(slot);
                const isSelected = currentSelectedSlots.includes(slot);

                // Blocking logic depends on facility type
                let isDisabled = isBooked || isInPast;
                let blockReason = isBooked ? 'Booked' : isInPast ? 'Time Passed' : '';

                if (facilityType === 'combo' && !isDisabled) {
                    // Combo: If the current slot isn't blocked, check the next hour slot
                    const nextHourSlotBooked = isSlotBooked(getNextHourSlot(slot)); 
                    if (nextHourSlotBooked) {
                         isDisabled = true;
                         blockReason = 'Pool Time Blocked';
                    }
                }
                
                // Pool and Turf only require the current 1-hour slot to be free (which is handled by isBooked).

                return (
                    <button
                        key={slot}
                        onClick={() => handleSlotToggle(slot)} 
                        disabled={isDisabled}
                        className={`
                            p-3 rounded-xl font-semibold transition-all duration-150 text-sm h-16 flex flex-col items-center justify-center text-center relative
                            ${isDisabled
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed line-through'
                                : isSelected 
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 transform scale-[1.05]'
                                    : 'bg-slate-700/50 text-blue-200 hover:bg-slate-700 border border-blue-500/30'
                            }
                        `}
                    >
                        {isDisabled ? blockReason : slot}
                        {/* Indicate reason for blocking the slot */}
                        {facilityType === 'combo' && blockReason === 'Pool Time Blocked' && (
                            <span className='absolute bottom-1 text-[10px] font-medium text-red-300/80'>
                                {blockReason}
                            </span>
                        )}
                        {/* Pool 3-Hour Display (Visual hint) */}
                        {facilityType === 'pool' && !isDisabled && (
                             <span className='absolute bottom-1 text-[10px] font-medium text-blue-300/80'>
                                3-Hour Access
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- Booking Page Component ---
const BookingPage = ({ facility, setBookings, onClose }) => {
    // 🚀 UPDATED: We only need to store the array of all blocked slots
    const [blockedSlots, setBlockedSlots] = useState([]);
    if (!setBookings) setBookings = () => { };

// --- Configuration Hook based on Facility Type ---
    const facilityConfig = useMemo(() => {
        const baseConfig = {
            maxPersons: 4,
            isPerPerson: false,
            costPerUnit: 100, 
            playerLabel: 'Additional Players (Max 4)',
            costLabel: 'Additional Player Cost',
            initialCount: 0,
            slots: TURF_SLOTS,
            allowMultipleSlots: true, // 🚀 NEW: Allow multiple slot selection for turf
        };

        if (facility.type === "turf") {
            return { ...baseConfig, type: 'Turf', slots: TURF_SLOTS, maxPersons: 4, costPerUnit: 100, playerLabel: 'Additional Players (Max 4)', allowMultipleSlots: true };
        } else if (facility.type === "combo") {
            return { 
                ...baseConfig, 
                type: 'Turf + Pool (1hr + 1hr)', 
                slots: TURF_SLOTS,
                allowMultipleSlots: false, // Combo still single slot
            };
        } else if (facility.type === "pool") {
            return {
                type: 'Pool (3-Hour Access)',
                maxPersons: 4,
                isPerPerson: true, 
                costPerUnit: facility.price, 
                slots: TURF_SLOTS, 
                playerLabel: 'Number of Persons (Max 4)',
                costLabel: 'Per Person Cost',
                initialCount: 1,
                allowMultipleSlots: false, // Pool still single slot
            };
        }
        return { ...baseConfig, type: 'Default', slots: TURF_SLOTS };
    }, [facility.type, facility.price]);

    // --- State Initialization (No Change) ---
    const [formData, setFormData] = useState({
        date: '',
        timeSlots: [], 
        personsCount: facilityConfig.initialCount,
    });

    const [message, setMessage] = useState('');

    // Reset personsCount/timeSlots when facility type changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            personsCount: facilityConfig.initialCount,
            timeSlots: [], 
        }));
    }, [facilityConfig.initialCount, facility.type]);

    // Update time slot selection handler
    const handleTimeSlotsSelect = useCallback((updatedSlots) => {
        setFormData(prev => ({ ...prev, timeSlots: updatedSlots }));
    }, []);

    // Update date selection handler
    const handleDateSelect = useCallback((date) => {
        setFormData(prev => ({
            ...prev,
            date: date,
            timeSlots: [], 
        }));
    }, []);

    const PRICE_PER_SLOT = facility.price || 0;

    // --- Calculated Price & Breakdown (No Change) ---
    const totalPrice = useMemo(() => {
        const { isPerPerson, costPerUnit } = facilityConfig;
        
        const slotCount = isPerPerson ? 1 : formData.timeSlots.length;
        const personsCount = formData.personsCount;

        if (isPerPerson) {
            return personsCount * costPerUnit;
        } else {
            const baseCost = slotCount * PRICE_PER_SLOT; 
            const additionalCost = personsCount * costPerUnit;
            return baseCost + additionalCost;
        }
    }, [formData.timeSlots, formData.personsCount, PRICE_PER_SLOT, facilityConfig]);
    
    // --- Handler for Person Counter (No Change) ---
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
    
    // --- Fetch Booked Slots (UPDATED LOGIC) ---
 const fetchBookedSlots = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !formData.date) return;
            
            // 🚀 NEW ROUTE CALL
            const res = await fetch(`${API_URL}/api/bookings/by-date?date=${formData.date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("Failed to fetch bookings:", data.message);
                return;
            }

            // Extract all unique time slots from the fetched bookings
            const allBlockedSlots = data.bookings.flatMap((b) => b.timeSlots);
            
            // Set the master blocked list
            setBlockedSlots(Array.from(new Set(allBlockedSlots))); 

        } catch (err) {
            console.error("Fetch booked slots error:", err);
            setBlockedSlots([]);
        }
    };

    useEffect(() => {
        if (!formData.date || !facility) return;
        fetchBookedSlots();
    }, [formData.date, facility]);


    // --- Submission Logic (No Change) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!facility) return alert("Please select a facility first.");
            if (!formData.date) return alert("Please select a date.");
            
            let finalTimeSlots = formData.timeSlots;

            if (formData.timeSlots?.length === 0) {
                 return alert("Please select a time slot.");
            }

            // COMBO LOGIC: Prepare 2 slots for the API payload
            if (facility.type === 'combo' && formData.timeSlots.length === 1) {
                const turfSlot = formData.timeSlots[0];
                const poolSlot = getNextHourSlot(turfSlot);
                finalTimeSlots = [turfSlot, poolSlot];
            }
            
            if (facility.type === 'pool' && formData.personsCount < 1) {
                return alert("Please select at least 1 person for pool booking.");
            }
            
            const token = localStorage.getItem("token");
            if (!token) return alert("Please login first.");

            const payload = {
                facilityName: facility.name,
                facilityType: facility.type,
                date: formData.date,
                timeSlots: finalTimeSlots, 
                additionalPlayers: formData.personsCount || 0,
                basePrice: facility.price,
            };

            const res = await fetch(`${API_URL}/api/bookings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Booking failed");
                return;
            }

            alert(`Booking successful!`);

            setFormData({
                date: "",
                timeSlots: [],
                personsCount: facilityConfig.initialCount,
            });

            onClose();

        } catch (error) {
            console.error("Submit Error:", error);
            alert("Something went wrong while creating the booking.");
        }
    };

    // --- JSX Rendering Helpers (Passing blockedSlots to TimeSlotSelector) ---
    const { maxPersons, playerLabel, costLabel, isPerPerson, costPerUnit, slots } = facilityConfig;
    const personsCount = formData.personsCount;
    const minPersons = isPerPerson ? 1 : 0;
    const isCombo = facility.type === "combo";
    const isPool = facility.type === "pool";
    const slotCount = isPerPerson ? 1 : formData.timeSlots.length;
    const currentBaseCost = PRICE_PER_SLOT * slotCount;

    // Calculate the breakdown for Combo
    const comboBreakdown = useMemo(() => {
        if (isCombo && formData.timeSlots.length === 1) {
            const turfSlot = formData.timeSlots[0];
            const poolSlot = getNextHourSlot(turfSlot);
            
            return {
                turfSlot: turfSlot,
                poolSlot: poolSlot
            };
        }
        return null;
    }, [isCombo, formData.timeSlots]);

    // Calculate the 3-hour Pool end time for display
    const poolAccessTime = useMemo(() => {
        if (isPool && formData.timeSlots.length === 1) {
            const selectedSlot = formData.timeSlots[0];
            const endTime = getPoolEndTime(selectedSlot);
            return endTime;
        }
        return null;
    }, [isPool, formData.timeSlots]);


    return (
        <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 border border-blue-500/20">

            {/* Close Button & Header */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 text-white hover:bg-red-600 transition"
                aria-label="Close booking form"
            >
                <X size={20} />
            </button>

            <div className="border-b border-blue-600/30 pb-4 mb-6">
                <h2 className="text-3xl font-bold mb-1 text-white">Book: {facility.name}</h2>
                <div className="flex flex-wrap gap-x-4 text-blue-300 text-sm">
                    <span className="flex items-center gap-1"><Tag size={16} /> {facilityConfig.type}</span>
                    <span className="flex items-center gap-1 font-bold text-green-400">
                        <IndianRupee size={16} /> {PRICE_PER_SLOT}
                        {isPool ? " / Person" : " / Slot (Capacity: " + facility.capacity + ")"}
                    </span>
                </div>
            </div>

            {/* Form Sections */}
            <div className="space-y-8">

                {/* SECTION 1: Date Selection */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                        <Calendar size={20} className="text-blue-500" />
                        1. Select Date
                    </h3>
                    <DateSelector
                        selectedDate={formData.date}
                        setSelectedDate={handleDateSelect}
                    />
                </div>

                {/* SECTION 2: Time Slot Selection */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                        <Clock size={20} className="text-blue-500" />
                        2. Select Time Slot
                        {formData.timeSlots.length > 0 && (
                            <span className="text-sm font-normal text-green-400">
                                {isPool ? '(1hr Slot Selected)' : isCombo ? '(1hr Turf Selected)' : `(${formData.timeSlots.length} Selected)`}
                            </span>
                        )}
                    </h3>
                    <TimeSlotSelector
                        date={formData.date}
                        selectedSlots={formData.timeSlots}
                        setSelectedSlots={handleTimeSlotsSelect}
                        facilityType={facility.type}
                        blockedSlots={blockedSlots} // 🚀 PASSING MASTER BLOCKED LIST
                        slots={slots}
                    />
                </div>

                {/* SECTION 3: Additional Options & Players */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Persons Counter */}
                    <div>
                        <label className="block text-blue-100 mb-3 font-medium flex items-center gap-2">
                            <Users size={18} />
                            {playerLabel}
                        </label>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-blue-500/30">
                            <span className="text-white text-2xl font-extrabold">{personsCount}</span>
                            <div className="flex space-x-3">
                                <button
                                    onClick={decrementPerson}
                                    disabled={personsCount <= minPersons}
                                    className="p-3 bg-red-600/70 hover:bg-red-700 disabled:opacity-30 text-white rounded-lg transition transform hover:scale-110"
                                >
                                    <Minus size={20} />
                                </button>
                                <button
                                    onClick={incrementPerson}
                                    disabled={personsCount >= maxPersons}
                                    className="p-3 bg-green-600/70 hover:bg-green-700 disabled:opacity-30 text-white rounded-lg transition transform hover:scale-110"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Price Summary and Action */}
                <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-green-500/50 space-y-3">
                    
                    {/* COMBO BREAKDOWN DISPLAY */}
                    {comboBreakdown && (
                        <div className="p-3 mb-3 border border-indigo-500/50 rounded-lg bg-indigo-900/40">
                            <h4 className="text-lg font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                <ArrowRightLeft size={20} /> Combo Time Allocation
                            </h4>
                            <div className="flex justify-between text-white font-semibold text-base mb-1">
                                <span className='font-bold text-yellow-300'>Turf:</span>
                                <span className="text-white">{comboBreakdown.turfSlot}</span>
                            </div>
                            <div className="flex justify-between text-white font-semibold text-base">
                                <span className='font-bold text-teal-300'>Pool:</span>
                                <span className="text-white">{comboBreakdown.poolSlot}</span>
                            </div>
                        </div>
                    )}
                    {/* POOL 3-HOUR DISPLAY */}
                    {isPool && poolAccessTime && (
                        <div className="p-3 mb-3 border border-blue-500/50 rounded-lg bg-blue-900/40">
                             <h4 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
                                <Timer size={20} /> Pool Access Time
                            </h4>
                            <div className="flex justify-between text-white font-semibold text-base">
                                <span className='font-bold text-blue-300'>Available Until:</span>
                                <span className="text-white">{poolAccessTime}</span>
                            </div>
                        </div>
                    )}

                    {/* Price Details */}
                    <div className="space-y-1">
                        {/* Base Price Calculation */}
                        {!isPool && ( // Turf/Combo
                            <div className="flex justify-between text-blue-200">
                                <span>Base Slot Price ({slotCount} x ₹{PRICE_PER_SLOT}):</span>
                                <span className="font-semibold">₹{currentBaseCost}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-blue-200">
                            <span>{costLabel} (x{personsCount}):</span>
                            <span className="font-semibold">₹{totalPrice}</span>
                        </div>
                    </div>

                    <div className="h-px bg-green-500/30 my-3"></div>

                    <div className="flex justify-between text-white text-2xl font-extrabold items-center">
                        <span className="flex items-center gap-2">Total Payable</span>
                        <span className="flex items-center">
                            <IndianRupee size={22} />{totalPrice}
                        </span>
                    </div>

                    {/* Message Area and Submission Button */}
                    {message && (
                        <div className="p-3 bg-green-700/30 text-green-300 rounded-lg text-sm text-center font-medium">
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!formData.date || formData.timeSlots.length === 0}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-500/30"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;