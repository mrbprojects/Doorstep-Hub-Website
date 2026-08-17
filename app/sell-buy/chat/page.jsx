'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { Search, Send, Image as ImageIcon, ShieldCheck, DollarSign, ArrowLeft } from 'lucide-react';

const SAMPLE_CONVERSATIONS = [
  {
    id: 'conv_1',
    sellerName: 'Rakesh Verma',
    listingTitle: 'Maruti Suzuki Swift VXI 2022',
    price: 545000,
    lastMessage: 'Is the price negotiable?',
    time: '10:45 AM',
    unread: 2,
    image: '/uploads/thumbn_ph_image/default_image.jpg',
  },
  {
    id: 'conv_2',
    sellerName: 'Priya Sharma',
    listingTitle: 'iPhone 13 128GB Blue',
    price: 38999,
    lastMessage: 'Yes, available for inspection today',
    time: 'Yesterday',
    unread: 0,
    image: '/uploads/thumbn_ph_image/default_image.jpg',
  },
];

export default function MarketplaceChatPage() {
  const [activeConv, setActiveConv] = useState(SAMPLE_CONVERSATIONS[0]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'seller', text: 'Hello! Thanks for reaching out about the Maruti Swift.', time: '10:40 AM' },
    { id: 2, sender: 'me', text: 'Hi! Is the car still available in Gachibowli?', time: '10:42 AM' },
    { id: 3, sender: 'seller', text: 'Yes, it is available for inspection today.', time: '10:45 AM' },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'me', text: inputText.trim(), time: 'Just now' },
    ]);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[600px]">
          {/* Sidebar Conversations */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Marketplace Messages</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chats or listings..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-[#037166] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {SAMPLE_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    activeConv?.id === conv.id ? 'bg-[#037166]/5 border-l-4 border-[#037166]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    <Image src={conv.image} alt={conv.listingTitle} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{conv.sellerName}</span>
                      <span className="text-[10px] text-slate-400">{conv.time}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#037166] truncate">{conv.listingTitle}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Window */}
          <div className="lg:col-span-8 flex flex-col bg-slate-50/50">
            {/* Active Header */}
            {activeConv && (
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    <Image src={activeConv.image} alt={activeConv.listingTitle} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black text-slate-900">{activeConv.sellerName}</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <p className="text-[11px] font-semibold text-[#037166]">{activeConv.listingTitle} — ₹{activeConv.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <Link
                  href="/sell-buy/categories"
                  className="bg-[#037166]/10 text-[#037166] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#037166]/20 transition-colors"
                >
                  View Listing
                </Link>
              </div>
            )}

            {/* Timeline */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'me'
                        ? 'bg-[#037166] text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[10px] block mt-1 text-right ${msg.sender === 'me' ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Composer */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message to seller..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-2 focus:ring-[#037166] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#037166] hover:bg-[#025951] text-white p-2.5 rounded-xl shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
