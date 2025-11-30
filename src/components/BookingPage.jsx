import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Calendar, Clock, Users, Home, BookOpen, User, LogOut, MapPin,
    Plus, Minus, ArrowRightLeft, Tag, X, IndianRupee
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;// Mock URL for fetch calls


// Utility Functions (No change)
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

// Time Slot Configuration (Updated: Added COMBO_SLOTS and API slot)
const TURF_SLOTS = generateTimeSlots(6, 24, 60, 5); // 1hr slots
const COMBO_SLOTS = generateTimeSlots(6, 24, 120, 5); // 2hr slots for Turf+Pool
const POOL_AVAILABILITY_TEXT = 'Available: 9:00 AM - 10:00 PM (Per Person)';
const DEFAULT_POOL_SLOT_FOR_API = '9:00 AM - 10:00 AM'; // Default slot to satisfy API for per-person booking

// Helper to get today's date string for the minimum date
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

// --- Sub Component: Time Slot Selector UI (FIXED LOGIC) ---
const TimeSlotSelector = ({ date, selectedSlots, setSelectedSlots, facilityType, existingBookings, slots }) => {

    const isSlotBooked = useCallback((slot) => {
        // Flatten all timeSlots from existing bookings for the date
        const bookedSlots = existingBookings?.flatMap(booking => booking.timeSlots);
        return bookedSlots.includes(slot);
    }, [date, existingBookings]);

    // Check if the slot is in the past for today's date
    const isSlotInPast = useCallback((slot) => {
        if (!date || date !== new Date().toISOString().split('T')[0]) {
            return false;
        }

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        const startTimeStr = slot.split(' - ')[0];
        const slotStartMinutes = timeToMinutes(startTimeStr);

        return slotStartMinutes < nowMinutes + 10;
    }, [date]);

    // Handler for toggling a slot selection
    const handleSlotToggle = useCallback((slot) => {
        setSelectedSlots(slot);
    }, [setSelectedSlots]);

    if (!date) {
        return (
            <div className="p-4 bg-slate-700/50 rounded-xl text-blue-300 text-center border border-blue-500/30">
                Please select a date first to view available time slots.
            </div>
        );
    }

    // Pool remains per-person (No selectable slots)
    if (facilityType === 'pool') {
        return (
            <div className="p-4 bg-slate-700/50 rounded-xl border border-blue-500/30 text-blue-200 text-sm font-medium text-center">
                {POOL_AVAILABILITY_TEXT}
                <p className='text-xs text-blue-400 mt-1'>
                    Booking automatically reserves a slot ({DEFAULT_POOL_SLOT_FOR_API}) for per-person entry.
                </p>
            </div>
        );
    }

    // Turf and Combo use selectable slots
    const currentSelectedSlots = Array.isArray(selectedSlots) ? selectedSlots : [];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
            {slots.map((slot) => {
                const isBooked = isSlotBooked(slot);
                const isInPast = isSlotInPast(slot);
                const isSelected = currentSelectedSlots.includes(slot);
                const isDisabled = isBooked || isInPast;

                return (
                    <button
                        key={slot}
                        onClick={() => handleSlotToggle(slot)} // Use the toggle handler
                        disabled={isDisabled}
                        className={`
                            p-3 rounded-xl font-semibold transition-all duration-150 text-sm h-16 flex items-center justify-center text-center
                            ${isDisabled
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed line-through'
                                : isSelected // Apply highlight based on isSelected
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 transform scale-[1.05]'
                                    : 'bg-slate-700/50 text-blue-200 hover:bg-slate-700 border border-blue-500/30'
                            }
                        `}
                    >
                        {isBooked ? 'Booked' : slot}
                    </button>
                );
            })}
        </div>
    );
};

// --- Booking Page Component ---
const BookingPage = ({ facility, setBookings, onClose }) => {
    const [existingBookings , setExistingBookings] = useState([]);
    const [blockedSlots, setBlockedSlots] = useState([]);
    if (!setBookings) setBookings = () => { };

    // --- Configuration Hook based on Facility Type (FIXED SLOTS) ---
    const facilityConfig = useMemo(() => {
        const baseConfig = {
            maxPersons: 4,
            isPerPerson: false,
            costPerUnit: 100, // Cost per additional player
            playerLabel: 'Additional Players (Max 4)',
            costLabel: 'Additional Player Cost',
            initialCount: 0,
            slots: TURF_SLOTS, // Default to 1hr
        };

        if (facility.type === "turf") {
            return { ...baseConfig, type: 'Turf', slots: TURF_SLOTS };
        } else if (facility.type === "combo") {
            return { 
                ...baseConfig, 
                type: 'Turf+Pool (2hr Slot)', // Updated label
                slots: COMBO_SLOTS, // Use the 2-hour slots
            };
        } else if (facility.type === "pool") {
            return {
                type: 'Pool (Per Person)',
                maxPersons: 12,
                isPerPerson: true,
                costPerUnit: facility.price, // Pool price is per person
                slots: [], // Pool does not use selectable slots
                playerLabel: 'Number of Persons (Max 12)',
                costLabel: 'Per Person Cost',
                initialCount: 1,
            };
        }
        return { ...baseConfig, type: 'Default', slots: TURF_SLOTS };
    }, [facility.type, facility.price]);

    // --- State Initialization (FIXED TIME SLOTS FOR API) ---
    const [formData, setFormData] = useState({
        date: '',
        // FIX: If it's a Pool, use the single API-friendly slot. Otherwise, use an empty array for selection (Turf/Combo).
        timeSlots: facility.type === 'pool' ? [DEFAULT_POOL_SLOT_FOR_API] : [],
        personsCount: facilityConfig.initialCount,
    });

    const [comboOrder, setComboOrder] = useState('pool-first');
    const [message, setMessage] = useState('');

    // Reset personsCount/timeSlots when facility type changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            personsCount: facilityConfig.initialCount,
            // FIX: If it's a Pool, use the single API-friendly slot. Otherwise, use an empty array for selection (Turf/Combo).
            timeSlots: facility.type === 'pool' ? [DEFAULT_POOL_SLOT_FOR_API] : [],
        }));
    }, [facilityConfig.initialCount, facility.type]);

    // Update time slot selection handler (Handles the array)
    const handleTimeSlotsSelect = useCallback((slot) => {
        setFormData(prev => {
            const current = Array.isArray(prev.timeSlots) ? prev.timeSlots : [];
            const updated = current.includes(slot)
                ? current.filter(s => s !== slot)
                : [...current, slot];

            return { ...prev, timeSlots: updated };
        });
    }, []);

    // Update date selection handler (resets time slots if date changes)
    const handleDateSelect = useCallback((date) => {
        setFormData(prev => ({
            ...prev,
            date: date,
            // FIX: If it's a Pool, use the single API-friendly slot. Otherwise, reset to empty array for selection.
            timeSlots: facility.type === 'pool' ? [DEFAULT_POOL_SLOT_FOR_API] : [],
        }));
    }, [facility.type]);

    // The price provided in the facility object is assumed to be the price PER SLOT
    const PRICE_PER_SLOT = facility.price || 0;

    // --- Calculated Price & Combo Breakdown (MODIFIED for multiple slots) ---
    const totalPrice = useMemo(() => {
        const { isPerPerson, costPerUnit } = facilityConfig;
        // If per-person, slot count is 1 for base price calculation
        const slotCount = isPerPerson ? 1 : formData.timeSlots.length;
        const personsCount = formData.personsCount;

        if (isPerPerson) {
            // Pool: Total is (personsCount * costPerUnit)
            return personsCount * costPerUnit;
        } else {
            // Turf/Combo: 
            // 1. Base cost is (Slots booked * PRICE_PER_SLOT)
            const baseCost = slotCount * PRICE_PER_SLOT;
            // 2. Additional players cost is (additional players * costPerUnit)
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

const fetchBookedSlots = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setExistingBookings(data.bookings)
    if (!res.ok) return;

    // Filter bookings matching SAME facility + SAME date
    const sameDayBookings = data.bookings.filter((b) => {
      // NOTE: For combo bookings, you might need to adjust this filter if the facility name changes,
      // but based on the provided dashboard data, facility.name is consistent.
      return (
        b.facilityName === facility.name &&
        new Date(b.date).toDateString() === new Date(formData.date).toDateString()
      );
    });

    // Merge all booked slots
    const booked = sameDayBookings.flatMap((b) => b.timeSlots);

    setBlockedSlots(booked); // Stored but not used currently in TimeSlotSelector

  } catch (err) {
    console.log("Fetch booked slots error:", err);
  }
};

    useEffect(() => {
        if (!formData.date || !facility) return;
        fetchBookedSlots();
    }, [formData.date, facility]);


    // --- Submission Logic
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!facility) return alert("Please select a facility first.");
            if (!formData.date) return alert("Please select a date.");
            
            // Check if slots are selected only for non-per-person facilities
            if (facility.type !== 'pool' && !formData.timeSlots?.length) {
                 return alert("Please select at least one time slot.");
            }

            // For Pool-only, we skip the slot selection check as the slot is fixed.
            if (facility.type === 'pool' && formData.personsCount < 1) {
                return alert("Please select at least 1 person for pool booking.");
            }


            const token = localStorage.getItem("token");
            if (!token) return alert("Please login first.");

            const payload = {
                facilityName: facility.name,
                facilityType: facility.type,
                date: formData.date,
                timeSlots: formData.timeSlots, // Will contain [DEFAULT_POOL_SLOT_FOR_API] for pool, or selected slots for turf/combo
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
                // If API returns an error, use the provided message or a generic one
                // alert() is used here as requested by the original code structure, but custom modal is preferred.
                alert(data.message || "Booking failed");
                return;
            }

            alert(`Booking successful for ${facility.type === 'pool' ? 'Pool Entry' : `${formData.timeSlots.length} slot(s)`}!`);

            // RESET FORM
            setFormData({
                date: "",
                // Ensure reset state is correct for next load
                timeSlots: facility.type === 'pool' ? [DEFAULT_POOL_SLOT_FOR_API] : [],
                personsCount: facilityConfig.initialCount,
            });

            // Close modal
            onClose();

        } catch (error) {
            console.error("Submit Error:", error);
            alert("Something went wrong while creating the booking.");
        }
    };
    // --- JSX Rendering ---
    const { maxPersons, playerLabel, costLabel, isPerPerson, costPerUnit, slots } = facilityConfig;
    const personsCount = formData.personsCount;
    const minPersons = isPerPerson ? 1 : 0;
    const isCombo = facility.type === "combo";
    const slotCount = isPerPerson ? 1 : formData.timeSlots.length;
    const currentBaseCost = PRICE_PER_SLOT * slotCount;

    return (
        <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 border border-blue-500/20">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 text-white hover:bg-red-600 transition"
                aria-label="Close booking form"
            >
                <X size={20} />
            </button>

            {/* Facility Details Header */}
            <div className="border-b border-blue-600/30 pb-4 mb-6">
                <h2 className="text-3xl font-bold mb-1 text-white">Book: {facility.name}</h2>
                <div className="flex flex-wrap gap-x-4 text-blue-300 text-sm">
                    <span className="flex items-center gap-1"><Tag size={16} /> {facilityConfig.type}</span>
                    <span className="flex items-center gap-1 font-bold text-green-400">
                        <IndianRupee size={16} /> {PRICE_PER_SLOT}
                        {!isPerPerson && " / Slot"}
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
                        2. Select Time Slot(s)
                        {!isPerPerson && formData.timeSlots && formData.timeSlots.length > 0 && (
                            <span className="text-sm font-normal text-green-400">({formData.timeSlots.length} Selected)</span>
                        )}
                    </h3>
                    <TimeSlotSelector
                        date={formData.date}
                        selectedSlots={formData.timeSlots}
                        setSelectedSlots={handleTimeSlotsSelect}
                        facilityType={facility.type}
                        existingBookings={existingBookings}
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

                    {/* Combo Order Toggle (Only for Turf + Pool) - simplified placeholder */}
                    {isCombo && (
                        <div className="bg-slate-700/30 rounded-xl p-4 border border-blue-500/30 self-stretch flex flex-col justify-between">
                            <div>
                                <span className="text-blue-100 font-medium flex items-center gap-2 mb-2">
                                    <ArrowRightLeft size={18} /> Activity Order
                                </span>
                                <p className="text-blue-200 text-sm mb-3">
                                    Total 2-hour slot (1hr Turf + 1hr Pool).
                                </p>
                            </div>

                            <button
                                onClick={() => setComboOrder(prev =>
                                    prev === 'pool-first' ? 'turf-first' : 'pool-first'
                                )}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition transform hover:scale-[1.01]"
                            >
                                {comboOrder === 'pool-first' ? 'Pool First' : 'Turf First'} (Click to Switch)
                            </button>
                        </div>
                    )}
                </div>

                {/* SECTION 4: Price Summary and Action */}
                <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-green-500/50 space-y-3">
                    {/* Price Details */}
                    <div className="space-y-1">
                        {/* Base Price Calculation based on slots */}
                        {!isPerPerson && (
                            <div className="flex justify-between text-blue-200">
                                <span>Base Slot Price ({slotCount} x ₹{PRICE_PER_SLOT}):</span>
                                <span className="font-semibold">₹{currentBaseCost}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-blue-200">
                            <span>{costLabel} (x{personsCount}):</span>
                            <span className="font-semibold">₹{isPerPerson ? totalPrice : personsCount * costPerUnit}</span>
                        </div>
                    </div>

                    <div className="h-px bg-green-500/30 my-3"></div>

                    <div className="flex justify-between text-white text-2xl font-extrabold items-center">
                        <span className="flex items-center gap-2">Total Payable</span>
                        <span className="flex items-center">
                            <IndianRupee size={22} />{totalPrice}
                        </span>
                    </div>

                    {/* Message Area */}
                    {message && (
                        <div className="p-3 bg-green-700/30 text-green-300 rounded-lg text-sm text-center font-medium">
                            {message}
                        </div>
                    )}

                    {/* Submission Button */}
                    <button
                        onClick={handleSubmit}
                        // Disable if no date OR (not per-person AND no slots)
                        disabled={!formData.date || (!isPerPerson && formData.timeSlots.length === 0)}
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