import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Calendar, Clock, Users, Tag, X, IndianRupee,
    Plus, Minus, Timer, AlertCircle, Ticket, CheckCircle2, XCircle, Loader2
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

const generatePoolTimeSlots = () => [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM'
];

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
    return `${minutesToTime(turfEndTimeMinutes)} - ${minutesToTime(poolEndTimeMinutes)}`;
};

const getPoolEndTime = (currentSlot) => {
    if (!currentSlot) return null;
    return currentSlot.split(' - ')[1];
};

const isPoolBookingAllowed = () => new Date().getHours() < 21;

const canBookPoolSlot = (slot) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startTimeStr] = slot.split(' - ');
    return currentMinutes < timeToMinutes(startTimeStr) + 180;
};

const TURF_SLOTS = generateTimeSlots(6, 24, 60, 5);
const POOL_SLOTS = generatePoolTimeSlots();
const MAX_POOL_CAPACITY = 25;
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- Sub Component: Date Selector ---
const DateSelector = ({ selectedDate, setSelectedDate }) => {
    const todayString = useMemo(getTodayDateString, []);
    const isDateSelected = !!selectedDate;
    return (
        <div className="relative">
            <div className={`w-full p-4 rounded-xl flex items-center gap-3 font-semibold transition-all duration-300 cursor-pointer ${isDateSelected
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 shadow-xl shadow-blue-500/30 text-white transform hover:scale-[1.01]'
                : 'bg-slate-700/50 hover:bg-slate-700 text-blue-300 border border-blue-500/30'
                }`}>
                <Calendar size={24} className={isDateSelected ? 'text-white' : 'text-blue-500'} />
                <span className={`flex-grow ${isDateSelected ? 'text-lg font-bold' : 'text-md'}`}>
                    {isDateSelected
                        ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Tap here to select your booking date'}
                </span>
                {isDateSelected && <Clock size={20} className="text-white ml-2" />}
                <input
                    type="date" value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={todayString}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    aria-label="Select Date"
                />
            </div>
        </div>
    );
};

// --- Sub Component: Time Slot Selector ---
const TimeSlotSelector = ({ date, selectedSlots, setSelectedSlots, facilityType, blockedSlots, slots, poolCapacityData }) => {
    const isSlotBooked = useCallback((slot) => blockedSlots.includes(slot), [blockedSlots]);

    const isSlotInPast = useCallback((slot) => {
        if (!date || date !== getTodayDateString()) return false;
        const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        return nowMinutes > timeToMinutes(slot.split(' - ')[1]);
    }, [date]);

    const getPoolSlotCapacity = useCallback((slot) => {
        if (facilityType !== 'pool' || !poolCapacityData) return { available: MAX_POOL_CAPACITY, booked: 0 };
        const slotData = poolCapacityData[slot];
        if (!slotData) return { available: MAX_POOL_CAPACITY, booked: 0 };
        return { available: MAX_POOL_CAPACITY - slotData.totalPersons, booked: slotData.totalPersons };
    }, [facilityType, poolCapacityData]);

    const handleSlotToggle = useCallback((slot) => {
        const isSingleSelect = facilityType === 'combo' || facilityType === 'pool';
        if (isSingleSelect) { setSelectedSlots(selectedSlots.includes(slot) ? [] : [slot]); return; }
        setSelectedSlots(selectedSlots.includes(slot)
            ? selectedSlots.filter((s) => s !== slot)
            : [...selectedSlots, slot]);
    }, [setSelectedSlots, selectedSlots, facilityType]);

    if (!date) {
        return (
            <div className="p-4 bg-slate-700/50 rounded-xl text-blue-300 text-center border border-blue-500/30">
                Please select a date first to view available time slots.
            </div>
        );
    }

    const currentSelectedSlots = Array.isArray(selectedSlots) ? selectedSlots : [];
    const isToday = date === getTodayDateString();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
            {slots.map((slot) => {
                const isBooked = isSlotBooked(slot);
                const isInPast = isSlotInPast(slot);
                const isSelected = currentSelectedSlots.includes(slot);
                let poolCapacity = null, isPoolFull = false, canBookThisPoolSlot = true;

                if (facilityType === 'pool') {
                    poolCapacity = getPoolSlotCapacity(slot);
                    isPoolFull = poolCapacity.available <= 0;
                    if (isToday) canBookThisPoolSlot = canBookPoolSlot(slot);
                }

                let isDisabled = isBooked || isInPast || isPoolFull || (facilityType === 'pool' && !canBookThisPoolSlot);
                let blockReason = '';
                if (isBooked) blockReason = 'Booked';
                else if (isInPast) blockReason = 'Time Passed';
                else if (isPoolFull) blockReason = 'Fully Booked';
                else if (facilityType === 'pool' && !canBookThisPoolSlot) blockReason = 'Booking Closed';

                if (facilityType === 'combo' && !isDisabled && isSlotBooked(getNextHourSlot(slot))) {
                    isDisabled = true; blockReason = 'Pool Time Blocked';
                }

                return (
                    <button key={slot} type="button"
                        onClick={() => !isDisabled && handleSlotToggle(slot)}
                        disabled={isDisabled}
                        className={`p-4 rounded-xl font-semibold transition-all duration-150 text-base min-h-[100px] flex flex-col items-center justify-center text-center relative ${isDisabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : isSelected ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 transform scale-[1.05]'
                                : 'bg-slate-700/50 text-blue-200 hover:bg-slate-700 border border-blue-500/30'
                            }`}
                    >
                        <span className={isDisabled ? 'line-through' : ''}>{slot}</span>
                        {facilityType === 'pool' && poolCapacity && !isDisabled && (
                            <div className="mt-2 text-xs">
                                <div className={`font-bold ${poolCapacity.available <= 5 ? 'text-orange-300' : 'text-green-300'}`}>
                                    {poolCapacity.available} / {MAX_POOL_CAPACITY} Available
                                </div>
                                {poolCapacity.booked > 0 && <div className="text-slate-300 text-[10px]">({poolCapacity.booked} booked)</div>}
                            </div>
                        )}
                        {isDisabled && blockReason && (
                            <span className='absolute bottom-2 text-[11px] font-medium text-red-300/80'>{blockReason}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- NEW: Coupon Input Component ---
const CouponInput = ({ facilityType, timeSlots, additionalPlayers, basePrice, onCouponApplied, onCouponRemoved, appliedCoupon }) => {
    const [code, setCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return setError('Please enter a coupon code');
        if (!timeSlots || timeSlots.length === 0) return setError('Please select a time slot first');

        setValidating(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/auth/discount-codes/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    code: trimmed,
                    // Send booking params — backend calculates the real order amount
                    facilityType,
                    timeSlots,
                    additionalPlayers,
                    basePrice,
                }),
            });

            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Invalid coupon code'); return; }

            onCouponApplied({
                code: trimmed,
                discountAmount: data.discountAmount,
                finalAmount: data.finalAmount,
                orderAmount: data.orderAmount,
                message: data.message,
            });
            setCode('');
        } catch {
            setError('Failed to validate coupon. Please try again.');
        } finally {
            setValidating(false);
        }
    };

    // Applied state
    if (appliedCoupon) {
        return (
            <div className="p-4 bg-green-900/30 border border-green-500/40 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-green-300 font-bold text-sm">{appliedCoupon.code} applied!</p>
                            <p className="text-green-400/80 text-xs">{appliedCoupon.message}</p>
                        </div>
                    </div>
                    <button onClick={onCouponRemoved}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition flex-shrink-0"
                        title="Remove coupon">
                        <XCircle size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        placeholder="Enter coupon code"
                        className="w-full pl-9 pr-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono tracking-widest text-sm uppercase"
                    />
                </div>
                <button onClick={handleApply}
                    disabled={validating || !code.trim()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap">
                    {validating && <Loader2 size={16} className="animate-spin" />}
                    {validating ? 'Checking...' : 'Apply'}
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-xs flex items-center gap-1.5 pl-1">
                    <XCircle size={13} /> {error}
                </p>
            )}
        </div>
    );
};
// --- Main Booking Page Component ---
const BookingPage = ({ facility, setBookings, onClose }) => {
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [poolCapacityData, setPoolCapacityData] = useState({});
    const [appliedCoupon, setAppliedCoupon] = useState(null); // ← coupon state

    if (!setBookings) setBookings = () => { };

    const facilityConfig = useMemo(() => {
        const baseConfig = {
            maxPersons: 4, isPerPerson: false, costPerUnit: 100,
            playerLabel: 'Additional Players (Max 4)', costLabel: 'Additional Player Cost',
            initialCount: 0, slots: TURF_SLOTS, allowMultipleSlots: true,
        };
        if (facility.type === "turf") return { ...baseConfig, type: 'Turf', slots: TURF_SLOTS };
        if (facility.type === "combo") return { ...baseConfig, type: 'Turf + Pool (1hr + 1hr)', slots: TURF_SLOTS, allowMultipleSlots: false };
        if (facility.type === "pool") return {
            type: 'Pool (3-Hour Access)', maxPersons: 25, isPerPerson: true,
            costPerUnit: facility.price, slots: POOL_SLOTS,
            playerLabel: 'Number of Persons (Max 25)', costLabel: 'Per Person Cost',
            initialCount: 1, allowMultipleSlots: false,
        };
        return { ...baseConfig, type: 'Default', slots: TURF_SLOTS };
    }, [facility.type, facility.price]);

    const [formData, setFormData] = useState({ date: '', timeSlots: [], personsCount: facilityConfig.initialCount });

    useEffect(() => {
        setFormData(prev => ({ ...prev, personsCount: facilityConfig.initialCount, timeSlots: [] }));
    }, [facilityConfig.initialCount, facility.type]);

    // Auto-clear coupon if order amount changes
    useEffect(() => {
        if (appliedCoupon) setAppliedCoupon(null);
    }, [formData.timeSlots, formData.personsCount, formData.date]);

    const handleTimeSlotsSelect = useCallback((slots) => setFormData(prev => ({ ...prev, timeSlots: slots })), []);
    const handleDateSelect = useCallback((date) => setFormData(prev => ({ ...prev, date, timeSlots: [] })), []);

    const PRICE_PER_SLOT = facility.price || 0;

    const maxAllowedPersons = useMemo(() => {
        if (facility.type === 'pool' && formData.timeSlots.length > 0) {
            const capacity = poolCapacityData[formData.timeSlots[0]];
            if (capacity) return Math.min(MAX_POOL_CAPACITY - capacity.totalPersons, facilityConfig.maxPersons);
        }
        return facilityConfig.maxPersons;
    }, [facility.type, formData.timeSlots, poolCapacityData, facilityConfig.maxPersons]);

    // Base total BEFORE discount
    const baseTotal = useMemo(() => {
        const { isPerPerson, costPerUnit } = facilityConfig;
        if (isPerPerson) return formData.personsCount * costPerUnit;
        return formData.timeSlots.length * PRICE_PER_SLOT + formData.personsCount * costPerUnit;
    }, [formData.timeSlots, formData.personsCount, PRICE_PER_SLOT, facilityConfig]);

    // Final total AFTER discount
    const finalTotal = appliedCoupon ? appliedCoupon.finalAmount : baseTotal;

    const handlePersonChange = useCallback((change) => {
        setFormData(prev => {
            const newCount = prev.personsCount + change;
            const min = facilityConfig.isPerPerson ? 1 : 0;
            if (newCount >= min && newCount <= maxAllowedPersons) return { ...prev, personsCount: newCount };
            return prev;
        });
    }, [maxAllowedPersons, facilityConfig.isPerPerson]);

    const fetchBookedSlots = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !formData.date) return;
            const res = await fetch(`${API_URL}/api/bookings/by-date?date=${formData.date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) return;

            if (facility.type !== 'pool') {
                setBlockedSlots(Array.from(new Set(data.bookings.flatMap((b) => b.timeSlots))));
                return;
            }
            const capacityMap = {};
            data.bookings.forEach((booking) => {
                if (booking.facilityType === 'pool') {
                    booking.timeSlots.forEach((slot) => {
                        if (!capacityMap[slot]) capacityMap[slot] = { totalPersons: 0, bookings: [] };
                        capacityMap[slot].totalPersons += booking.additionalPlayers;
                        capacityMap[slot].bookings.push(booking._id);
                    });
                }
            });
            setPoolCapacityData(capacityMap);
            setBlockedSlots(Object.keys(capacityMap).filter(slot => capacityMap[slot].totalPersons >= MAX_POOL_CAPACITY));
        } catch {
            setBlockedSlots([]); setPoolCapacityData({});
        }
    };

    useEffect(() => { if (formData.date && facility) fetchBookedSlots(); }, [formData.date, facility]);

    useEffect(() => {
        if (facility.type === 'pool' && formData.timeSlots.length > 0) {
            const capacity = poolCapacityData[formData.timeSlots[0]];
            if (capacity && formData.personsCount > (MAX_POOL_CAPACITY - capacity.totalPersons)) {
                setFormData(prev => ({ ...prev, personsCount: 1 }));
            }
        }
    }, [formData.timeSlots, poolCapacityData, facility.type]);

    // Redeem coupon silently after booking succeeds
    const redeemCoupon = async (code) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/auth/discount-codes/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code }),
            });
        } catch (err) {
            console.error('Coupon redeem error:', err);
        }
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (!facility) return toast.error("Please select a facility.");
        if (!formData.date) return toast.error("Please select a date.");
        if (!formData.timeSlots.length) return toast.error("Please select a time slot.");

        const token = localStorage.getItem("token");
        if (!token) return toast.error("Please login first.");

        let finalTimeSlots = formData.timeSlots;

        if (facility.type === "combo" && formData.timeSlots.length === 1) {
            finalTimeSlots = [
                formData.timeSlots[0],
                getNextHourSlot(formData.timeSlots[0])
            ];
        }

        const payload = {
            facilityName: facility.name,
            facilityType: facility.type,
            date: formData.date,
            timeSlots: finalTimeSlots,
            additionalPlayers: formData.personsCount || 0,
            basePrice: facility.price,
            ...(appliedCoupon && { discountCode: appliedCoupon.code })
        };

        // 🔹 STEP 1: Create Razorpay Order
        const loadingToast = toast.loading("Preparing payment...");

        const orderRes = await fetch(`${API_URL}/api/bookings/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const orderData = await orderRes.json();
        toast.dismiss(loadingToast);

        if (!orderRes.ok) {
            toast.error(orderData.message || "Failed to create order");
            return;
        }

        // 🔹 STEP 2: Open Razorpay Checkout
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Tulsi Arena",
            description: "Facility Booking Payment",
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {

                // 🔹 STEP 3: Verify Payment
                const verifyRes = await fetch(`${API_URL}/api/bookings/verify-payment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...payload,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }),
                });

                const verifyData = await verifyRes.json();

                if (!verifyRes.ok) {
                    toast.error(verifyData.message || "Payment verification failed");
                    return;
                }

                toast.success("Booking Confirmed 🎉");

                setFormData({
                    date: "",
                    timeSlots: [],
                    personsCount: facilityConfig.initialCount,
                });

                setAppliedCoupon(null);

                setTimeout(() => onClose(), 1500);
            },
            theme: {
                color: "#16a34a",
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

    } catch (error) {
        console.error("Payment Flow Error:", error);
        toast.error("Something went wrong");
    }
};
    const { playerLabel, costLabel, isPerPerson, slots } = facilityConfig;
    const isPool = facility.type === "pool";

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 border border-blue-500/20">

                <button onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 text-white hover:bg-red-600 transition"
                    aria-label="Close">
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="border-b border-blue-600/30 pb-4 mb-6">
                    <h2 className="text-3xl font-bold mb-1 text-white">Book: {facility.name}</h2>
                    <div className="flex flex-wrap gap-x-4 text-blue-300 text-sm">
                        <span className="flex items-center gap-1"><Tag size={16} /> {facilityConfig.type}</span>
                        <span className="flex items-center gap-1 font-bold text-green-400">
                            <IndianRupee size={16} /> {PRICE_PER_SLOT}
                            {isPool ? " / Person" : ` / Slot (Capacity: ${facility.capacity})`}
                        </span>
                    </div>
                    {isPool && (
                        <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-start gap-2">
                            <AlertCircle size={18} className="text-orange-400 mt-0.5 flex-shrink-0" />
                            <p className="text-orange-200 text-sm">Pool bookings close at 9:00 PM daily.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Step 1: Date */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                            <Calendar size={20} className="text-blue-500" /> 1. Select Date
                        </h3>
                        <DateSelector selectedDate={formData.date} setSelectedDate={handleDateSelect} />
                    </div>

                    {/* Step 2: Time Slot */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                            <Clock size={20} className="text-blue-500" />
                            2. Select Time Slot {isPool && "(3-Hour Access)"}
                            {formData.timeSlots.length > 0 && <span className="text-sm font-normal text-green-400">(Selected)</span>}
                        </h3>
                        <TimeSlotSelector
                            date={formData.date} selectedSlots={formData.timeSlots}
                            setSelectedSlots={handleTimeSlotsSelect} facilityType={facility.type}
                            blockedSlots={blockedSlots} slots={slots} poolCapacityData={poolCapacityData}
                        />
                    </div>

                    {/* Step 3: Persons */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                            <Users size={20} className="text-blue-500" />
                            3. Number of Persons
                            {isPool && formData.timeSlots.length > 0 && (
                                <span className="text-sm font-normal text-green-400">({maxAllowedPersons} spots available)</span>
                            )}
                        </h3>
                        <label className="block text-blue-100 mb-3 font-medium flex items-center gap-2">
                            <Users size={18} /> {playerLabel}
                        </label>
                        <div className="flex items-center justify-between p-6 rounded-xl bg-slate-700/50 border border-blue-500/30">
                            <span className="text-white text-3xl font-extrabold">{formData.personsCount}</span>
                            <div className="flex space-x-3">
                                <button type="button" onClick={() => handlePersonChange(-1)}
                                    disabled={formData.personsCount <= (isPerPerson ? 1 : 0)}
                                    className="p-3 bg-red-600/70 hover:bg-red-700 disabled:opacity-30 text-white rounded-lg transition transform hover:scale-110">
                                    <Minus size={24} />
                                </button>
                                <button type="button" onClick={() => handlePersonChange(1)}
                                    disabled={formData.personsCount >= maxAllowedPersons}
                                    className="p-3 bg-green-600/70 hover:bg-green-700 disabled:opacity-30 text-white rounded-lg transition transform hover:scale-110">
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Coupon Code ── NEW */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-blue-300">
                            <Ticket size={20} className="text-blue-500" /> 4. Have a Coupon?
                        </h3>
                        <CouponInput
                            facilityType={facility.type}
                            timeSlots={formData.timeSlots}
                            additionalPlayers={formData.personsCount}
                            basePrice={facility.price}
                            onCouponApplied={setAppliedCoupon}
                            onCouponRemoved={() => setAppliedCoupon(null)}
                            appliedCoupon={appliedCoupon}
                        />
                    </div>

                    {/* Price Summary */}
                    <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-green-500/50 space-y-3">
                        {/* Pool slot display */}
                        {isPool && formData.timeSlots.length > 0 && (
                            <div className="p-4 mb-3 border border-blue-500/50 rounded-lg bg-blue-900/40">
                                <h4 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
                                    <Timer size={20} /> Selected Pool Time
                                </h4>
                                <div className="flex justify-between text-white font-semibold">
                                    <span className="text-blue-300">Time Slot:</span>
                                    <span>{formData.timeSlots[0]}</span>
                                </div>
                            </div>
                        )}

                        {/* Base cost */}
                        <div className="flex justify-between text-blue-200 text-lg">
                            <span>{costLabel || 'Base Cost'}:</span>
                            <span className="font-semibold">₹{PRICE_PER_SLOT} × {formData.personsCount}</span>
                        </div>

                        {/* Discount line */}
                        {appliedCoupon && (
                            <div className="flex justify-between text-green-400 text-base font-semibold">
                                <span className="flex items-center gap-2">
                                    <Ticket size={14} /> {appliedCoupon.code}
                                </span>
                                <span>− ₹{appliedCoupon.discountAmount}</span>
                            </div>
                        )}

                        <div className="h-px bg-green-500/30 my-3" />

                        {/* Strikethrough original if coupon applied */}
                        {appliedCoupon && (
                            <div className="flex justify-between text-slate-500 text-base line-through">
                                <span>Original Amount</span>
                                <span>₹{baseTotal}</span>
                            </div>
                        )}

                        {/* Final total */}
                        <div className="flex justify-between text-white text-2xl font-extrabold items-center">
                            <span>Total Payable</span>
                            <span className={`flex items-center ${appliedCoupon ? 'text-green-400' : ''}`}>
                                <IndianRupee size={22} />{finalTotal}
                            </span>
                        </div>

                        {appliedCoupon && (
                            <p className="text-center text-green-400 text-sm font-semibold bg-green-900/20 py-2 rounded-lg">
                                🎉 You're saving ₹{appliedCoupon.discountAmount}!
                            </p>
                        )}

                        <button type="button" onClick={handleSubmit}
                            disabled={!formData.date || formData.timeSlots.length === 0}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-500/30">
                            Confirm Booking {appliedCoupon ? `(₹${finalTotal})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingPage;