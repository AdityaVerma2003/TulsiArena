import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowLeft, Clock, User } from 'lucide-react';
import tulsiVillaLogo from '../assets/tulsiarena-logo.png';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Enter valid 10-digit number (starting with 6-9)';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Contact form submitted:', formData);
      
      setSubmitSuccess(true);
      
      // Reset form after 2.5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setFormErrors({});
      }, 2500);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header with Logo */}
      <nav className="relative z-20 flex justify-between items-center px-4 sm:px-8 py-6">
        <div className="flex items-center gap-3">
          <img 
            onClick={() => navigate("/")}
            src={tulsiVillaLogo}
            className="w-16 h-16 rounded-full cursor-pointer hover:scale-105 transition-transform" 
            alt="TulsiArena Logo" 
          />
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800/60 backdrop-blur-md rounded-full border border-blue-500/30 hover:bg-slate-700/60 transition-all"
        >
          <ArrowLeft size={20} className="text-blue-400" />
          <span className="text-white font-semibold hidden sm:inline">Back to Home</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Get In Touch
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="space-y-8 animate-slideInLeft">
            {/* Contact Cards */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="text-blue-400" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Phone</h3>
                  <a href="tel:+918368446067" className="text-slate-300 hover:text-blue-400 transition-colors text-lg">
                    +91 1234567891
                  </a>
                  <p className="text-slate-400 text-sm mt-1">Mon-Sun, 8:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="text-purple-400" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                  <a href="mailto:info@tulsiarena.com" className="text-slate-300 hover:text-purple-400 transition-colors text-lg break-all">
                    info@tulsiarena.com
                  </a>
                  <p className="text-slate-400 text-sm mt-1">We'll respond within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-pink-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-pink-400" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Location</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Tulsi Villa, Prayagraj<br />
                    Uttar Pradesh, India
                  </p>
                  <a 
                    href="https://maps.google.com/?q=Tulsi+Villa+Prayagraj" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm mt-2"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-emerald-400" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">Business Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">8:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Saturday - Sunday</span>
                      <span className="font-semibold">7:00 AM - 11:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slideInRight">
            <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 shadow-2xl">
              {submitSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Message Sent!</h3>
                  <p className="text-slate-300 text-lg">Thank you for contacting us. We'll get back to you soon!</p>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2">Send Us a Message</h2>
                  <p className="text-slate-400 mb-8">Fill out the form below and we'll get in touch with you shortly.</p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${
                          formErrors.name ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span>⚠</span> {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${
                          formErrors.email ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span>⚠</span> {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${
                          formErrors.phone ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                      {formErrors.phone && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span>⚠</span> {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Your Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="5"
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${
                          formErrors.message ? 'border-red-500' : 'border-blue-500/30'
                        } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none`}
                        placeholder="Tell us how we can help you..."
                      />
                      {formErrors.message && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span>⚠</span> {formErrors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Error */}
                    {formErrors.submit && (
                      <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg">
                        {formErrors.submit}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-full shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="mt-16 animate-fadeInUp">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-8 text-center">
            Find Us Here
          </h2>
          <div className="bg-slate-900/60 backdrop-blur-md border border-blue-500/20 rounded-3xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.2746934647443!2d81.84653431501458!3d25.435800883763844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398534c9b20bd49f%3A0xa2237856ad4041a!2sPrayagraj%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
              title="TulsiArena Location"
            ></iframe>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ContactUs;