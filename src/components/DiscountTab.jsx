import React, { useState, useEffect } from "react";
import { Tag, Plus, X, Copy, Check, Trash2, Clock, Users, Percent, IndianRupee, ToggleLeft, ToggleRight } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const DiscountTab = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage", // 'percentage' | 'flat'
    discountValue: "",
    maxUses: "",
    expiresAt: "",
    minOrderAmount: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_URL}/api/admin/discount-codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCodes(resp.data.codes || []);
    } catch (err) {
      console.error("Error fetching discount codes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "TULSI";
    for (let i = 0; i < 5; i++) result += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, code: result }));
  };

  const validate = () => {
    if (!form.code.trim()) return "Discount code is required";
    if (!/^[A-Z0-9_-]{3,20}$/.test(form.code.trim()))
      return "Code must be 3-20 uppercase letters/numbers";
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return "Discount value must be greater than 0";
    if (form.discountType === "percentage" && Number(form.discountValue) > 100)
      return "Percentage discount cannot exceed 100%";
    if (!form.maxUses || Number(form.maxUses) < 1)
      return "Max uses must be at least 1";
    if (!form.expiresAt) return "Expiry date is required";
    if (new Date(form.expiresAt) <= new Date()) return "Expiry date must be in the future";
    return null;
  };

  const handleCreate = async () => {
    const error = validate();
    if (error) return setFormError(error);
    setFormError("");
    setCreating(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/discount-codes`,
        { ...form, code: form.code.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowForm(false);
      setForm({
        code: "", discountType: "percentage", discountValue: "",
        maxUses: "", expiresAt: "", minOrderAmount: "", description: "",
      });
      fetchCodes();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create code");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/admin/discount-codes/${id}/toggle`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCodes();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount code?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/discount-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCodes();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Discount Codes</h3>
          <p className="text-blue-200 mt-1">Create and manage coupon codes for users</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
        >
          <Plus size={18} /> Create Code
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowForm(false); setFormError(""); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 hover:bg-red-600 transition"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Create Discount Code</h2>

            <div className="space-y-4">
              {/* Code Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">Discount Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. TULSI50OFF"
                    className="flex-grow px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition uppercase"
                  />
                  <button
                    onClick={generateCode}
                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-blue-300 rounded-xl text-sm font-medium transition whitespace-nowrap"
                  >
                    Auto Generate
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">Discount Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setForm((f) => ({ ...f, discountType: "percentage" }))}
                    className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border transition ${
                      form.discountType === "percentage"
                        ? "bg-purple-600/30 border-purple-500 text-purple-300"
                        : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <Percent size={16} /> Percentage
                  </button>
                  <button
                    onClick={() => setForm((f) => ({ ...f, discountType: "flat" }))}
                    className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border transition ${
                      form.discountType === "flat"
                        ? "bg-green-600/30 border-green-500 text-green-300"
                        : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <IndianRupee size={16} /> Flat Amount
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">
                  Discount Value * {form.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 100"}
                  min="1"
                  max={form.discountType === "percentage" ? "100" : undefined}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Max Uses & Min Order in grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    <Users size={14} className="inline mr-1" />Max Uses *
                  </label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    placeholder="e.g. 100"
                    min="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    <IndianRupee size={14} className="inline mr-1" />Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="e.g. 200 (optional)"
                    min="0"
                    className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">
                  <Clock size={14} className="inline mr-1" />Expiry Date *
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">Description (optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Diwali special offer"
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <span>⚠</span> {formError}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Discount Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-blue-200">Loading discount codes...</p>
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-16 border border-blue-500/20 text-center">
          <Tag size={48} className="text-blue-400/40 mx-auto mb-4" />
          <p className="text-blue-200 text-lg">No discount codes yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first code to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {codes.map((c) => {
            const expired = isExpired(c.expiresAt);
            const usagePercent = Math.min((c.usedCount / c.maxUses) * 100, 100);
            return (
              <div
                key={c._id}
                className={`bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border transition ${
                  !c.isActive || expired
                    ? "border-slate-600/30 opacity-60"
                    : "border-blue-500/20 hover:border-blue-500/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Code info */}
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {/* Code badge */}
                      <div className="flex items-center gap-2 bg-slate-700/60 border border-blue-500/30 rounded-lg px-3 py-1.5">
                        <span className="font-mono font-bold text-blue-300 text-lg tracking-widest">{c.code}</span>
                        <button
                          onClick={() => handleCopy(c.code, c._id)}
                          className="text-slate-400 hover:text-white transition"
                          title="Copy code"
                        >
                          {copiedId === c._id ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                        </button>
                      </div>

                      {/* Discount value badge */}
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        c.discountType === "percentage"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}>
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>

                      {/* Status badges */}
                      {expired && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">Expired</span>
                      )}
                      {!c.isActive && !expired && (
                        <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">Inactive</span>
                      )}
                      {c.isActive && !expired && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">Active</span>
                      )}
                    </div>

                    {c.description && (
                      <p className="text-slate-400 text-sm mb-3">{c.description}</p>
                    )}

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-4 text-sm text-blue-200">
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-blue-400" />
                        {c.usedCount} / {c.maxUses} used
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-400" />
                        Expires {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                      {c.minOrderAmount > 0 && (
                        <span className="flex items-center gap-1">
                          <IndianRupee size={14} className="text-blue-400" />
                          Min ₹{c.minOrderAmount}
                        </span>
                      )}
                    </div>

                    {/* Usage progress bar */}
                    <div className="mt-3 w-full bg-slate-700/50 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          usagePercent >= 100 ? "bg-red-500" : usagePercent >= 75 ? "bg-yellow-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <button
                      onClick={() => handleToggle(c._id, c.isActive)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                        c.isActive
                          ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                          : "bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
                      }`}
                    >
                      {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiscountTab;