'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { Search, Send, ShieldCheck, ShieldAlert, MapPin, Loader2, MessageSquare } from 'lucide-react';
import {
  fetchConversations,
  fetchMessages,
  sendChatMessageApi,
  getImageUrl,
  getOrCreateConversation,
} from '@/lib/sellBuyApi';
import { getSocket, joinConversationRoom, leaveConversationRoom } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';

export default function MarketplaceChatPage() {
  const searchParams = useSearchParams();
  const sellerIdParam = searchParams.get('sellerId');
  const listingIdParam = searchParams.get('listingId');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const messagesEndRef = useRef(null);

  const { user } = useAuth() || {};

  // Initialize Current User ID
  useEffect(() => {
    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (userStr) {
        try { activeUser = JSON.parse(userStr); } catch (e) {}
      }
    }
    
    if (activeUser) {
      const uid = activeUser._id || activeUser.id || '';
      setCurrentUserId(String(uid));
    } else {
      setLoading(false);
    }
  }, [user]);

  // Load Conversations
  useEffect(() => {
    loadConversations();
  }, [currentUserId, sellerIdParam, listingIdParam]);

  const loadConversations = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let convs = await fetchConversations(currentUserId);
    
    const sessionActiveConvId = sessionStorage.getItem('activeConvId');
    const sessionActiveConvDataStr = sessionStorage.getItem('activeConvData');
    
    if (sessionActiveConvId) {
      let existingConv = convs.find(c => String(c._id) === String(sessionActiveConvId));
      
      if (!existingConv && sessionActiveConvDataStr) {
        try {
          const parsedData = JSON.parse(sessionActiveConvDataStr);
          if (parsedData._id) {
            existingConv = parsedData;
            convs = [existingConv, ...convs];
          }
        } catch(e) {}
      }

      if (existingConv) {
        setActiveConv(existingConv);
      } else if (convs && convs.length > 0) {
        setActiveConv(convs[0]);
      }
      sessionStorage.removeItem('activeConvId');
      sessionStorage.removeItem('activeConvData');
    } else if (listingIdParam) {
      let existingConv = convs.find(c => String(c.listingId?._id || c.listingId) === String(listingIdParam));
      if (!existingConv) {
        const initRes = await getOrCreateConversation(currentUserId, listingIdParam);
        if (initRes.success && initRes.data) {
          existingConv = initRes.data;
          convs = [existingConv, ...convs];
        }
      }
      if (existingConv) {
        setActiveConv(existingConv);
      }
    } else if (convs && convs.length > 0 && !activeConv) {
      setActiveConv(convs[0]);
    }
    
    setConversations(convs);
    setLoading(false);
  };

  // Load Messages when Active Conversation changes & setup Socket
  useEffect(() => {
    if (!activeConv?._id) return;

    const convId = activeConv._id;

    // Load initial message history
    fetchMessages(convId).then((msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    // Join Socket Room for this conversation
    joinConversationRoom(convId);

    // Setup Socket.IO listener for real-time incoming messages
    const socket = getSocket();
    if (socket) {
      const handleNewMessage = (newMsg) => {
        if (String(newMsg.conversationId) === String(convId)) {
          setMessages((prev) => {
            // Avoid duplicate message if already added
            if (prev.some((m) => String(m._id) === String(newMsg._id))) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      };

      const handleChatNotification = (data) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (String(c._id) === String(data.conversationId)) {
              return {
                ...c,
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt || new Date().toISOString(),
              };
            }
            return c;
          })
        );
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('chatNotification', handleChatNotification);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('chatNotification', handleChatNotification);
        leaveConversationRoom(convId);
      };
    }
  }, [activeConv?._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv?._id || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic Message Append
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConv._id,
      senderId: currentUserId,
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    // Call REST API (which also emits Socket event to recipient)
    const res = await sendChatMessageApi({
      conversationId: activeConv._id,
      text: textToSend,
      senderId: currentUserId,
    });

    if (res?.success && res.data) {
      // Replace optimistic message with saved DB message
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? res.data : m))
      );
    }
    setSending(false);
  };

  // Helper to extract opposite party (other user in conversation)
  const getOtherUser = (conv) => {
    if (!conv) return { name: 'Marketplace Seller', image: '' };
    const isMeBuyer = String(conv.buyerId?._id || conv.buyerId) === String(currentUserId);
    const other = isMeBuyer ? conv.sellerId : conv.buyerId;
    return {
      name: typeof other === 'object' ? other?.name || 'Seller' : 'Seller',
      profilePic: typeof other === 'object' ? other?.profilePic : '',
    };
  };

  // Filter conversations search
  const filteredConvs = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const other = getOtherUser(c);
    const title = c.listingId?.title || '';
    return other.name.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[620px]">
          
          {/* Sidebar Conversations */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-white">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Marketplace Messages</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chats or listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-[#037166] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#037166]" />
                  <span className="text-xs font-medium">Loading conversations...</span>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">No conversations yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Chat messages with sellers will appear here</p>
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const otherUser = getOtherUser(conv);
                  const isSelected = activeConv?._id === conv._id;
                  const listing = conv.listingId || {};
                  const coverImg = listing.coverImage || listing.images?.[0];

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-[#037166]/5 border-l-4 border-[#037166]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative w-11 h-11 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <img
                          src={getImageUrl(coverImg)}
                          alt={listing.title || 'Listing'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{otherUser.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#037166] truncate">{listing.title || 'Advertisement'}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage || 'Start conversation...'}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Window */}
          <div className="lg:col-span-8 flex flex-col bg-slate-50/50">
            {activeConv ? (
              <>
                {/* Active Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img
                        src={getImageUrl(activeConv.listingId?.coverImage || activeConv.listingId?.images?.[0])}
                        alt="Listing"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-black text-slate-900">{getOtherUser(activeConv).name}</h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      </div>
                      <p className="text-[11px] font-semibold text-[#037166]">
                        {activeConv.listingId?.title} — ₹{Number(activeConv.listingId?.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {activeConv.listingId?.slug && (
                    <Link
                      href={`/sell-buy/categories`}
                      className="bg-[#037166]/10 text-[#037166] text-xs font-bold px-3 py-1.5 rounded-md hover:bg-[#037166]/20 transition-colors"
                    >
                      View Listing
                    </Link>
                  )}
                </div>

                {/* Safety & Financial Disclaimer Banner */}
                <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2 flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#037166] shrink-0" />
                  <p className="text-[11px] leading-snug">
                    <strong className="font-semibold text-slate-800">Safety Note:</strong> DoorStepHub is not responsible for payments between users. Never pay in advance. Inspect items in person before paying.
                  </p>
                </div>

                {/* Messages Timeline */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <p className="text-xs font-medium">No messages yet. Send a message to start chatting!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = String(msg.senderId?._id || msg.senderId) === String(currentUserId);
                      const timeStr = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now';

                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-md text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-[#037166] text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                              {timeStr}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-md py-2.5 px-4 text-xs font-medium focus:ring-2 focus:ring-[#037166] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="bg-[#037166] hover:bg-[#025951] disabled:opacity-50 text-white p-2.5 rounded-md shadow-xs transition-all flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">Select a conversation</h3>
                <p className="text-xs text-slate-400 mt-1">Pick a chat from the left panel to communicate with buyers or sellers.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
