'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, DollarSign, Star, Play, ChevronRight, Calendar, X } from 'lucide-react';
import { GlobalNav } from '@/components/layout/GlobalNav';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function ServiceDetail() {
  const [activeTab, setActiveTab] = useState('rates');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Electronics', href: '/appliances/electronics' },
    { label: 'LED TV Repair', href: '/appliances/electronics/tv-repair' },
  ];

  const serviceIssues = [
    {
      title: 'TV Completely Dead',
      description: 'No power, no lights, completely unresponsive',
      price: '$80 - $150',
      icon: '⚡',
    },
    {
      title: 'Red Standby Light Blinking',
      description: 'Power indicator blinking but TV won\'t turn on',
      price: '$60 - $120',
      icon: '🔴',
    },
    {
      title: 'Turns On and Off Repeatedly',
      description: 'TV powers on then immediately shuts down',
      price: '$70 - $140',
      icon: '🔄',
    },
    {
      title: 'Remote or Buttons Not Working',
      description: 'Unable to control TV functions',
      price: '$40 - $80',
      icon: '🎮',
    },
    {
      title: 'No Display / Black Screen',
      description: 'TV powers on but screen remains black',
      price: '$90 - $180',
      icon: '📺',
    },
    {
      title: 'Sound Issues',
      description: 'No audio or distorted sound output',
      price: '$50 - $100',
      icon: '🔊',
    },
  ];

  const portfolioImages = [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
    'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=800',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
  ];

  const reviews = [
    {
      name: 'John Anderson',
      rating: 5,
      date: '2 days ago',
      comment: 'Excellent service! Fixed my TV power issue quickly and professionally. Highly recommend!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    {
      name: 'Sarah Mitchell',
      rating: 5,
      date: '1 week ago',
      comment: 'Very knowledgeable technician. Diagnosed the problem instantly and repaired it on the spot.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      name: 'Michael Chen',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Good service overall. Arrived on time and fixed the remote issue efficiently.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
  ];

  const dates = [
    { date: 'Jan 15', day: 'Mon', available: true },
    { date: 'Jan 16', day: 'Tue', available: true },
    { date: 'Jan 17', day: 'Wed', available: true },
    { date: 'Jan 18', day: 'Thu', available: true },
    { date: 'Jan 19', day: 'Fri', available: false },
    { date: 'Jan 20', day: 'Sat', available: true },
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <GlobalNav currentPage="services" breadcrumbs={breadcrumbs} />

      {/* Service Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d1410] to-[#0a0a0a]" />

          {/* Animated Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#037166] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Service Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#037166]/10 border border-[#037166]/30 rounded-full mb-6"
              >
                <Star className="w-4 h-4 text-[#037166]" />
                <h6 className="text-sm text-[#037166] font-medium">Top Rated Service</h6>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="block text-white mb-2">LED TV Repair</span>
                <span className="block bg-gradient-to-r from-[#037166] to-[#02b39a] bg-clip-text text-transparent">
                  Not Powering On
                </span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Expert diagnosis and repair for all LED TV power-related issues. Same-day service available.
              </p>

              {/* Metadata Badges */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-2xl"
                >
                  <Clock className="w-6 h-6 text-[#037166] mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">2hrs</div>
                  <div className="text-xs text-gray-400">Last Booking</div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-2xl"
                >
                  <Users className="w-6 h-6 text-[#037166] mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">2.3K</div>
                  <div className="text-xs text-gray-400">Total Bookings</div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-2xl"
                >
                  <DollarSign className="w-6 h-6 text-[#037166] mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">$25</div>
                  <div className="text-xs text-gray-400">Inspection Fee</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Service Icon Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Floating Glass Card */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a]/60 to-[#0f0f0f]/60 backdrop-blur-2xl border-2 border-[#037166]/30 rounded-3xl overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#037166]/10 to-transparent" />

                  {/* TV Icon Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-9xl">📺</div>
                  </div>

                  {/* Animated Sketch Strokes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <motion.rect
                      x="10%"
                      y="10%"
                      width="80%"
                      height="80%"
                      stroke="#037166"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </svg>

                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/20 to-[#02b39a]/20 blur-2xl -z-10" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Animated Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#037166]/50 to-transparent" />
        </motion.div>
      </section>

      {/* Tabbed Content Section */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center space-x-2 mb-12 overflow-x-auto pb-4"
          >
            {[
              { id: 'rates', label: 'Service Rates (Approx.)' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-6 py-3 whitespace-nowrap"
              >
                <span className={`text-sm font-semibold transition-colors ${activeTab === tab.id ? 'text-[#037166]' : 'text-gray-400'
                  }`}>
                  {tab.label}
                </span>

                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#037166] to-[#02b39a]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {activeTab === tab.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[#037166]/5 rounded-xl -z-10"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'rates' && (
              <motion.div
                key="rates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {serviceIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group relative"
                  >
                    <div className="h-full p-6 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-2xl hover:border-[#037166]/40 transition-all">
                      {/* Icon */}
                      <div className="text-5xl mb-4">{issue.icon}</div>

                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#037166] transition-colors">
                        {issue.title}
                      </h4>

                      <p className="text-sm text-gray-400 mb-4">{issue.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#037166]">{issue.price}</div>
                        <ChevronRight className="w-5 h-5 text-[#037166] group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Glow on Hover */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/0 via-[#037166]/20 to-[#037166]/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {portfolioImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Glass Frame Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Play Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-[#037166]/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    {/* Sketch Highlight */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <rect
                        x="5%"
                        y="5%"
                        width="90%"
                        height="90%"
                        stroke="#037166"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5 5"
                      />
                    </svg>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-2xl"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#037166]/30 flex-shrink-0">
                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{review.name}</h4>
                            <p className="text-sm text-gray-400">{review.date}</p>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.1 + i * 0.05 }}
                              >
                                <Star
                                  className={`w-5 h-5 ${i < review.rating
                                    ? 'text-[#037166] fill-[#037166]'
                                    : 'text-gray-600'
                                    }`}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Sticky Booking Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-[#037166]/20"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1">
              {selectedDate && selectedTime ? (
                <span className="text-[#037166] font-medium">
                  {selectedDate} at {selectedTime}
                </span>
              ) : (
                'Select your preferred date & time'
              )}
            </div>
            <div className="text-xs text-gray-500">Doorstep inspection: $25</div>
          </div>

          <motion.button
            onClick={() => setShowBookingModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-2xl text-white font-semibold shadow-xl shadow-[#037166]/40 hover:shadow-2xl hover:shadow-[#037166]/50 transition-all flex items-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>{selectedDate ? 'Continue' : 'Book Now'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Date & Time Selection Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-[#037166]/30 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-[#1a1a1a] border border-[#037166]/30 hover:bg-[#037166]/20 transition-all"
              >
                <X className="w-5 h-5 text-[#037166]" />
              </button>

              <h2 className="text-3xl font-bold text-white mb-2">Select Date & Time</h2>
              <p className="text-gray-400 mb-8">Choose your preferred appointment slot</p>

              {/* Date Selection */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4">Select Date</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {dates.map((dateItem, index) => (
                    <motion.button
                      key={index}
                      onClick={() => dateItem.available && setSelectedDate(dateItem.date)}
                      disabled={!dateItem.available}
                      whileHover={dateItem.available ? { y: -4 } : {}}
                      whileTap={dateItem.available ? { scale: 0.95 } : {}}
                      className={`p-4 rounded-xl transition-all ${selectedDate === dateItem.date
                        ? 'bg-gradient-to-r from-[#037166] to-[#025951] border-2 border-[#037166] shadow-lg shadow-[#037166]/40'
                        : dateItem.available
                          ? 'bg-[#1a1a1a] border border-[#037166]/20 hover:border-[#037166]/40'
                          : 'bg-[#1a1a1a]/50 border border-gray-800 opacity-50 cursor-not-allowed'
                        }`}
                    >
                      <div className={`text-sm ${selectedDate === dateItem.date ? 'text-white' : 'text-gray-400'}`}>
                        {dateItem.day}
                      </div>
                      <div className={`text-lg font-bold ${selectedDate === dateItem.date ? 'text-white' : 'text-white'}`}>
                        {dateItem.date.split(' ')[1]}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-4">Select Time</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {timeSlots.map((time, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedTime(time)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        className={`py-3 rounded-xl transition-all ${selectedTime === time
                          ? 'bg-gradient-to-r from-[#037166] to-[#025951] border-2 border-[#037166] shadow-lg shadow-[#037166]/40 text-white'
                          : 'bg-[#1a1a1a] border border-[#037166]/20 hover:border-[#037166]/40 text-gray-300'
                          }`}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Confirm Button */}
              {selectedDate && selectedTime && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowBookingModal(false);
                    // Handle booking confirmation
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-2xl text-white font-semibold shadow-xl shadow-[#037166]/40 hover:shadow-2xl hover:shadow-[#037166]/50 transition-all"
                >
                  Confirm Booking
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Padding for Sticky Bar */}
      <div className="h-24" />
    </div>
  );
}
