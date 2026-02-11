import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Calendar, Clock, Users, ArrowRightLeft, Tag, X, IndianRupee,
    Plus, Minus, Timer, AlertCircle
} from 'lucide-react'; 

import toast, { Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL; 

// --- Utility Functions ---

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

// 🚀 Generate 3-hour pool slots
const generatePoolTimeSlots = () => {
    return [
        '9:00 AM - 12:00 PM',
        '12:00 PM - 3:00 PM',
        '3:00 PM - 6:00 PM',
        '6:00 PM - 9:00 PM'
    ];
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
    return endTimeStr;
}

// 🚀 NEW: Check if current time is past pool booking cutoff (9 PM)
const isPoolBookingAllowed = () => {
    const now = new Date();
    const currentHour = now.getHours();
    // Allow booking only before 9 PM (21:00)
    return currentHour < 21;
};

// 🚀 NEW: Check if a pool slot can still be booked based on current time
const canBookPoolSlot = (slot) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Get slot start time
    const [startTimeStr] = slot.split(' - ');
    const slotStartMinutes = timeToMinutes(startTimeStr);
    
    // Can book if slot hasn't started yet OR if we're within the slot time
    // (allowing mid-slot booking)
    return currentMinutes < slotStartMinutes + 180; // 180 minutes = 3 hours
};

// Time Slot Configuration 
const TURF_SLOTS = generateTimeSlots(6, 24, 60, 5);
const POOL_SLOTS = generatePoolTimeSlots();
const MAX_POOL_CAPACITY = 25; // 🚀 Maximum persons per pool slot

// Helper to get today's date string
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// --- Sub Component: Date Selector UI ---
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
const TimeSlotSelector = ({ 
    date, 
    selectedSlots, 
    setSelectedSlots, 
    facilityType, 
    blockedSlots, 
    slots,
    poolCapacityData // 🚀 NEW: Pool capacity data
}) => {

    const isSlotBooked = useCallback((slot) => {
        return blockedSlots.includes(slot);
    }, [blockedSlots]);

   const isSlotInPast = useCallback((slot) => {
    const todayString = getTodayDateString();
    if (!date || date !== todayString) {
        return false;
    }

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const [, endTimeStr] = slot.split(' - ');
    const slotEndMinutes = timeToMinutes(endTimeStr);

    return nowMinutes > slotEndMinutes; 
}, [date]);

    // 🚀 NEW: Get available capacity for a pool slot
    const getPoolSlotCapacity = useCallback((slot) => {
        if (facilityType !== 'pool' || !poolCapacityData) {
            return { available: MAX_POOL_CAPACITY, booked: 0 };
        }
        
        const slotData = poolCapacityData[slot];
        if (!slotData) {
            return { available: MAX_POOL_CAPACITY, booked: 0 };
        }
        
        return {
            available: MAX_POOL_CAPACITY - slotData.totalPersons,
            booked: slotData.totalPersons
        };
    }, [facilityType, poolCapacityData]);

    const handleSlotToggle = useCallback(
        (slot) => {
            const isSingleSelect = facilityType === 'combo' || facilityType === 'pool';

            if (isSingleSelect) {
                const isCurrentlySelected = selectedSlots.includes(slot);
                setSelectedSlots(isCurrentlySelected ? [] : [slot]);
                return;
            }

            const isSelected = selectedSlots.includes(slot);

            if (isSelected) {
                setSelectedSlots(selectedSlots.filter((s) => s !== slot));
            } else {
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
    const todayString = getTodayDateString();
    const isToday = date === todayString;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
            {slots.map((slot) => {
                const isBooked = isSlotBooked(slot);
                const isInPast = isSlotInPast(slot);
                const isSelected = currentSelectedSlots.includes(slot);
                
                // 🚀 Pool-specific logic
                let poolCapacity = null;
                let isPoolFull = false;
                let canBookThisPoolSlot = true;
                
                if (facilityType === 'pool') {
                    poolCapacity = getPoolSlotCapacity(slot);
                    isPoolFull = poolCapacity.available <= 0;
                    
                    // Check if booking is allowed based on time
                    if (isToday) {
                        canBookThisPoolSlot = canBookPoolSlot(slot);
                    }
                }

                let isDisabled = isBooked || isInPast || isPoolFull || (facilityType === 'pool' && !canBookThisPoolSlot);
                let blockReason = '';
                
                if (isBooked) blockReason = 'Booked';
                else if (isInPast) blockReason = 'Time Passed';
                else if (isPoolFull) blockReason = 'Fully Booked';
                else if (facilityType === 'pool' && !canBookThisPoolSlot) blockReason = 'Booking Closed';

                if (facilityType === 'combo' && !isDisabled) {
                    const nextHourSlotBooked = isSlotBooked(getNextHourSlot(slot)); 
                    if (nextHourSlotBooked) {
                         isDisabled = true;
                         blockReason = 'Pool Time Blocked';
                    }
                }

                return (
                    <button
                        key={slot}
                        type="button"
                        onClick={() => !isDisabled && handleSlotToggle(slot)} 
                        disabled={isDisabled}
                        className={`
                            p-4 rounded-xl font-semibold transition-all duration-150 text-base min-h-[100px] flex flex-col items-center justify-center text-center relative
                            ${isDisabled
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed line-through'
                                : isSelected 
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 transform scale-[1.05]'
                                    : 'bg-slate-700/50 text-blue-200 hover:bg-slate-700 border border-blue-500/30'
                            }
                        `}
                    >
                        {/* Slot time display */}
                        <span className={`${isDisabled ? 'line-through' : ''}`}>
                            {slot}
                        </span>
                        
                        {/* 🚀 Pool capacity indicator */}
                        {facilityType === 'pool' && poolCapacity && !isDisabled && (
                            <div className="mt-2 text-xs">
                                <div className={`font-bold ${
                                    poolCapacity.available <= 5 ? 'text-orange-300' : 'text-green-300'
                                }`}>
                                    {poolCapacity.available} / {MAX_POOL_CAPACITY} Available
                                </div>
                                {poolCapacity.booked > 0 && (
                                    <div className="text-slate-300 text-[10px]">
                                        ({poolCapacity.booked} booked)
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Disabled reason display */}
                        {isDisabled && blockReason && (
                            <span className='absolute bottom-2 text-[11px] font-medium text-red-300/80'>
                                {blockReason}
                            </span>
                        )}
                        
                        {/* 3-Hour Access label for pool */}
                        {facilityType === 'pool' && !isDisabled && !poolCapacity && (
                             <span className='absolute bottom-1 text-[10px] font-medium text-blue-300/80'>
                                3-Hour Access
                            </span>
                        )}
                        
                        {/* Combo pool time blocked indicator */}
                        {facilityType === 'combo' && blockReason === 'Pool Time Blocked' && (
                            <span className='absolute bottom-1 text-[10px] font-medium text-red-300/80'>
                                {blockReason}
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
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [poolCapacityData, setPoolCapacityData] = useState({}); // 🚀 NEW: Track pool capacity
    
    if (!setBookings) setBookings = () => { };

    // 🚀 UPDATED: Pool configuration with max 25 persons
    const facilityConfig = useMemo(() => {
        const baseConfig = {
            maxPersons: 4,
            isPerPerson: false,
            costPerUnit: 100, 
            playerLabel: 'Additional Players (Max 4)',
            costLabel: 'Additional Player Cost',
            initialCount: 0,
            slots: TURF_SLOTS,
            allowMultipleSlots: true,
        };

        if (facility.type === "turf") {
            return { 
                ...baseConfig, 
                type: 'Turf', 
                slots: TURF_SLOTS, 
                maxPersons: 4, 
                costPerUnit: 100, 
                playerLabel: 'Additional Players (Max 4)', 
                allowMultipleSlots: true 
            };
        } else if (facility.type === "combo") {
            return { 
                ...baseConfig, 
                type: 'Turf + Pool (1hr + 1hr)', 
                slots: TURF_SLOTS,
                allowMultipleSlots: false,
            };
        } else if (facility.type === "pool") {
            return {
                type: 'Pool (3-Hour Access)',
                maxPersons: 25, // 🚀 UPDATED: Max 25 persons
                isPerPerson: true, 
                costPerUnit: facility.price, 
                slots: POOL_SLOTS,
                playerLabel: 'Number of Persons (Max 25)', // 🚀 UPDATED
                costLabel: 'Per Person Cost',
                initialCount: 1,
                allowMultipleSlots: false,
            };
        }
        return { ...baseConfig, type: 'Default', slots: TURF_SLOTS };
    }, [facility.type, facility.price]);

    const [formData, setFormData] = useState({
        date: '',
        timeSlots: [], 
        personsCount: facilityConfig.initialCount,
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            personsCount: facilityConfig.initialCount,
            timeSlots: [], 
        }));
    }, [facilityConfig.initialCount, facility.type]);

    const handleTimeSlotsSelect = useCallback((updatedSlots) => {
        setFormData(prev => ({ ...prev, timeSlots: updatedSlots }));
    }, []);

    const handleDateSelect = useCallback((date) => {
        setFormData(prev => ({
            ...prev,
            date: date,
            timeSlots: [], 
        }));
    }, []);

    const PRICE_PER_SLOT = facility.price || 0;

    // 🚀 UPDATED: Calculate max allowed persons based on pool availability
    const maxAllowedPersons = useMemo(() => {
        if (facility.type === 'pool' && formData.timeSlots.length > 0) {
            const selectedSlot = formData.timeSlots[0];
            const capacity = poolCapacityData[selectedSlot];
            if (capacity) {
                return Math.min(MAX_POOL_CAPACITY - capacity.totalPersons, facilityConfig.maxPersons);
            }
        }
        return facilityConfig.maxPersons;
    }, [facility.type, formData.timeSlots, poolCapacityData, facilityConfig.maxPersons]);

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
    
    const handlePersonChange = useCallback((change) => {
        setFormData(prev => {
            const newCount = prev.personsCount + change;
            const max = maxAllowedPersons; // 🚀 Use dynamic max
            const min = facilityConfig.isPerPerson ? 1 : 0;

            if (newCount >= min && newCount <= max) {
                return { ...prev, personsCount: newCount };
            }
            return prev;
        });
    }, [maxAllowedPersons, facilityConfig.isPerPerson]);

    const incrementPerson = () => handlePersonChange(1);
    const decrementPerson = () => handlePersonChange(-1);
    
    // 🚀 UPDATED: Fetch booked slots AND pool capacity data
    const fetchBookedSlots = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !formData.date) return;
            
            const res = await fetch(`${API_URL}/api/bookings/by-date?date=${formData.date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("Failed to fetch bookings:", data.message);
                return;
            }

            // For turf and combo: just get blocked slots
            if (facility.type !== 'pool') {
                const allBlockedSlots = data.bookings.flatMap((b) => b.timeSlots);
                setBlockedSlots(Array.from(new Set(allBlockedSlots)));
                return;
            }

            // 🚀 For pool: calculate capacity per slot
            const capacityMap = {};
            
            data.bookings.forEach((booking) => {
                if (booking.facilityType === 'pool') {
                    booking.timeSlots.forEach((slot) => {
                        if (!capacityMap[slot]) {
                            capacityMap[slot] = {
                                totalPersons: 0,
                                bookings: []
                            };
                        }
                        capacityMap[slot].totalPersons += booking.additionalPlayers;
                        capacityMap[slot].bookings.push(booking._id);
                    });
                }
            });

            setPoolCapacityData(capacityMap);
            
            // Mark slots as "blocked" only if fully booked
            const fullyBookedSlots = Object.keys(capacityMap).filter(
                slot => capacityMap[slot].totalPersons >= MAX_POOL_CAPACITY
            );
            setBlockedSlots(fullyBookedSlots);

        } catch (err) {
            console.error("Fetch booked slots error:", err);
            setBlockedSlots([]);
            setPoolCapacityData({});
        }
    };

    useEffect(() => {
        if (!formData.date || !facility) return;
        fetchBookedSlots();
    }, [formData.date, facility]);

    // 🚀 Reset person count when slot changes (for pool)
    useEffect(() => {
        if (facility.type === 'pool' && formData.timeSlots.length > 0) {
            const selectedSlot = formData.timeSlots[0];
            const capacity = poolCapacityData[selectedSlot];
            
            // Reset to 1 if current count exceeds available capacity
            if (capacity && formData.personsCount > (MAX_POOL_CAPACITY - capacity.totalPersons)) {
                setFormData(prev => ({ ...prev, personsCount: 1 }));
            }
        }
    }, [formData.timeSlots, poolCapacityData, facility.type]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!facility) return toast.error("Please select a facility first.");
            if (!formData.date) return toast.error("Please select a date.");
            
            // 🚀 Check if pool booking is allowed (before 9 PM)
            if (facility.type === 'pool') {
                const todayString = getTodayDateString();
                if (formData.date === todayString && !isPoolBookingAllowed()) {
                    return toast.error("Pool bookings are closed after 9 PM. Please try again tomorrow.");
                }
            }
            
            let finalTimeSlots = formData.timeSlots;

            if (formData.timeSlots?.length === 0) {
                return toast.error("Please select a time slot.");
            }

            if (facility.type === 'combo' && formData.timeSlots.length === 1) {
                const turfSlot = formData.timeSlots[0];
                const poolSlot = getNextHourSlot(turfSlot);
                finalTimeSlots = [turfSlot, poolSlot];
            }
            
            if (facility.type === 'pool' && formData.personsCount < 1) {
                return toast.error("Please select at least 1 person for pool booking.");
            }
            
            // 🚀 Validate pool capacity
            if (facility.type === 'pool') {
                const selectedSlot = formData.timeSlots[0];
                const capacity = poolCapacityData[selectedSlot];
                const available = capacity ? MAX_POOL_CAPACITY - capacity.totalPersons : MAX_POOL_CAPACITY;
                
                if (formData.personsCount > available) {
                    return toast.error(`Only ${available} spots available for this slot.`);
                }
            }
            
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Please login first.");

            const payload = {
                facilityName: facility.name,
                facilityType: facility.type,
                date: formData.date,
                timeSlots: finalTimeSlots, 
                additionalPlayers: formData.personsCount || 0,
                basePrice: facility.price,
            };

            const loadingToast = toast.loading("Creating your booking...");

            const res = await fetch(`${API_URL}/api/bookings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            toast.dismiss(loadingToast); 

            if (!res.ok) {
                toast.error(data.message || "Booking failed");
                return;
            }

            toast.success(`Booking successful!`);

            setFormData({
                date: "",
                timeSlots: [],
                personsCount: facilityConfig.initialCount,
            });

            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error("Submit Error:", error);
            toast.error("Something went wrong while creating the booking.");
        }
    };

    const { maxPersons, playerLabel, costLabel, isPerPerson, costPerUnit, slots } = facilityConfig;
    const personsCount = formData.personsCount;
    const minPersons = isPerPerson ? 1 : 0;
    const isCombo = facility.type === "combo";
    const isPool = facility.type === "pool";
    const slotCount = isPerPerson ? 1 : formData.timeSlots.length;
    const currentBaseCost = PRICE_PER_SLOT * slotCount;

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

    const poolAccessTime = useMemo(() => {
        if (isPool && formData.timeSlots.length === 1) {
            const selectedSlot = formData.timeSlots[0];
            const endTime = getPoolEndTime(selectedSlot);
            return endTime;
        }
        return null;
    }, [isPool, formData.timeSlots]);

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 border border-blue-500/20">

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
                    
                    {/* 🚀 Pool booking time warning */}
                    {isPool && (
                        <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-start gap-2">
                            <AlertCircle size={18} className="text-orange-400 mt-0.5 flex-shrink-0" />
                            <p className="text-orange-200 text-sm">
                                Pool bookings close at 9:00 PM daily. You can book mid-slot if space is available.
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
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

                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                            <Clock size={20} className="text-blue-500" />
                            2. Select Time Slot {isPool && "(3-Hour Access)"}
                            {formData.timeSlots.length > 0 && (
                                <span className="text-sm font-normal text-green-400">
                                    (Selected)
                                </span>
                            )}
                        </h3>
                        <TimeSlotSelector
                            date={formData.date}
                            selectedSlots={formData.timeSlots}
                            setSelectedSlots={handleTimeSlotsSelect}
                            facilityType={facility.type}
                            blockedSlots={blockedSlots}
                            slots={slots}
                            poolCapacityData={poolCapacityData} // 🚀 Pass capacity data
                        />
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                            <Users size={20} className="text-blue-500" />
                            3. Number of Persons
                            {/* 🚀 Show available spots for pool */}
                            {isPool && formData.timeSlots.length > 0 && (
                                <span className="text-sm font-normal text-green-400">
                                    ({maxAllowedPersons} spots available)
                                </span>
                            )}
                        </h3>
                        <div>
                            <label className="block text-blue-100 mb-3 font-medium flex items-center gap-2">
                                <Users size={18} />
                                {playerLabel}
                            </label>
                            <div className="flex items-center justify-between p-6 rounded-xl bg-slate-700/50 border border-blue-500/30">
                                <span className="text-white text-3xl font-extrabold">{personsCount}</span>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={decrementPerson}
                                        disabled={personsCount <= minPersons}
                                        className="p-3 bg-red-600/70 hover:bg-red-700 disabled:opacity-30 text-white rounded-lg transition transform hover:scale-110"
                                    >
                                        <Minus size={24} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={incrementPerson}
                                        disabled={personsCount >= maxAllowedPersons} // 🚀 Use dynamic max
                                        className="p-3 bg-green-600/70 hover:bg-green-700 disabled:opacity-30 text-white rounded-lg transition transform hover:scale-110"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-green-500/50 space-y-3">
                        {isPool && poolAccessTime && formData.timeSlots.length > 0 && (
                            <div className="p-4 mb-3 border border-blue-500/50 rounded-lg bg-blue-900/40">
                                <h4 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
                                    <Timer size={20} /> Selected Pool Time
                                </h4>
                                <div className="flex justify-between text-white font-semibold text-base">
                                    <span className='font-bold text-blue-300'>Time Slot:</span>
                                    <span className="text-white">{formData.timeSlots[0]}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between text-blue-200 text-lg">
                                <span>{costLabel}:</span>
                                <span className="font-semibold">₹{PRICE_PER_SLOT} × {personsCount}</span>
                            </div>
                        </div>

                        <div className="h-px bg-green-500/30 my-3"></div>

                        <div className="flex justify-between text-white text-2xl font-extrabold items-center">
                            <span className="flex items-center gap-2">Total Payable</span>
                            <span className="flex items-center">
                                <IndianRupee size={22} />{totalPrice}
                            </span>
                        </div>

                        {message && (
                            <div className="p-3 bg-green-700/30 text-green-300 rounded-lg text-sm text-center font-medium">
                                {message}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!formData.date || formData.timeSlots.length === 0}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-500/30"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingPage;