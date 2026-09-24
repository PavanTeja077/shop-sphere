import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, MessageSquare, AlertCircle, CheckCircle, Send, Clock, UserCheck, 
  PlusCircle, HelpCircle, ArrowLeft, ShieldCheck, Sparkles, Filter, ChevronRight,
  Truck, User, Store, ShieldAlert, Check
} from 'lucide-react';
import { showInAppAlert, showInAppToast } from './InAppNotificationModal';
import { API_BASE_URL } from '../config/api';

export default function SupportDesk({ currentUser }) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'create' | 'faqs'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

  // User role context
  const userRole = currentUser?.role || 'Customer';
  const isDeliveryPartner = userRole === 'Delivery Partner';
  const isAdmin = userRole === 'Platform Admin';
  const isSeller = userRole === 'Seller';
  const isCustomer = userRole === 'Customer';

  // New Ticket Form State
  const [customerNameInput, setCustomerNameInput] = useState(currentUser?.name || '');
  const [customerEmailInput, setCustomerEmailInput] = useState(currentUser?.email || '');
  const [newSubject, setNewSubject] = useState('');
  const [newOrderId, setNewOrderId] = useState('');
  const [newCategory, setNewCategory] = useState(isDeliveryPartner ? 'Delivery Update' : 'Delivery Inquiries');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.name && !customerNameInput) setCustomerNameInput(currentUser.name);
    if (currentUser?.email && !customerEmailInput) setCustomerEmailInput(currentUser.email);
  }, [currentUser]);

  // Fetch tickets from backend or local storage
  const fetchTickets = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    let loaded = [];
    try {
      const res = await fetch(`${API_BASE_URL}/api/support`);
      if (res.ok) {
        loaded = await res.json();
      }
    } catch (err) {
      console.warn("Could not fetch remote support tickets, using local cache", err);
    }

    if (!Array.isArray(loaded) || loaded.length === 0) {
      // Check local storage
      try {
        const local = JSON.parse(localStorage.getItem('shopsphere_support_tickets') || '[]');
        if (Array.isArray(local) && local.length > 0) loaded = local;
      } catch (e) {}
    }

    if (!loaded || loaded.length === 0) {
      loaded = [
        {
          _id: 'TCK-501',
          user: currentUser?.email || 'customer@shopsphere.com',
          userName: currentUser?.name || 'Customer',
          userEmail: currentUser?.email || 'customer@shopsphere.com',
          subject: '[Delivery Inquiries] Where is my package courier tracking?',
          description: 'Hi! I need to know when my order #ORD-89234 will arrive.',
          priority: 'HIGH',
          status: 'OPEN',
          orderId: 'ORD-89234',
          createdAt: 'Today, 11:38 am',
          messages: [
            { sender: 'customer', text: 'i need to know about my product delivery and warranty', time: '11:38 am' },
            { sender: 'delivery', text: 'Hello! I am your Swift Logistics delivery partner. Your package is loaded on vehicle DL-04-8921 and scheduled for delivery today by 2:00 PM.', time: '11:40 am' },
            { sender: 'customer', text: 'yes it is on the way. Thank you!', time: '11:41 am' }
          ]
        },
        {
          _id: 'TCK-502',
          user: 'aditi@example.com',
          userName: 'Aditi Sharma',
          userEmail: 'aditi@example.com',
          subject: '[Returns & Refunds] Return eligibility for electronics',
          description: 'Does the 7-day return policy cover opened electronics with original seal intact?',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          orderId: '',
          createdAt: 'Yesterday',
          messages: [
            { sender: 'customer', text: 'Does the 7-day return policy cover opened electronics with original seal intact?', time: '06:15 pm' },
            { sender: 'admin', text: 'Hi Aditi! Yes, as long as all accessories, manuals, and original artisan packaging are retained.', time: '06:30 pm' }
          ]
        }
      ];
    }

    // Sanitize any legacy placeholder test strings (Alex / Tester) in tickets
    loaded = (loaded || []).map(t => {
      let name = t.userName;
      if (!name || /alex|tester/i.test(name)) {
        name = (currentUser?.role === 'Customer' && currentUser?.name)
          ? currentUser.name
          : 'Customer';
      }
      let email = t.userEmail || t.user;
      if (!email || /alex|tester/i.test(email)) {
        email = (currentUser?.role === 'Customer' && currentUser?.email)
          ? currentUser.email
          : 'customer@shopsphere.com';
      }
      return { ...t, userName: name, user: email, userEmail: email };
    });
    try {
      localStorage.setItem('shopsphere_support_tickets', JSON.stringify(loaded));
    } catch (e) {}

    setTickets(loaded);
    // Ensure selected ticket is preserved or set to first
    setSelectedTicket(prev => {
      if (!prev) return loaded[0];
      const match = loaded.find(t => (t._id || t.id) === (prev._id || prev.id));
      return match || loaded[0];
    });

    if (!isBackground) setLoading(false);
  };

  const formatCustomerName = (ticket) => {
    // 1. If active logged in user is a customer looking at their own ticket, prioritize currentUser.name
    if (isCustomer && currentUser?.name) {
      return currentUser.name;
    }
    // 2. Otherwise use the customer's name from ticket details
    const name = ticket?.userName;
    if (name && !/alex|tester/i.test(name)) {
      return name;
    }
    if (ticket?.user && typeof ticket.user === 'string' && !ticket.user.includes('@') && !/alex|tester/i.test(ticket.user)) {
      return ticket.user;
    }
    if (currentUser?.name && !/alex|tester/i.test(currentUser.name)) {
      return currentUser.name;
    }
    return 'Customer';
  };

  useEffect(() => {
    fetchTickets();
    // Real-time synchronization polling every 3 seconds so chat updates instantly between roles
    const timer = setInterval(() => {
      fetchTickets(true);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Determine current sender role key
  const getCurrentSenderType = () => {
    if (isDeliveryPartner) return 'delivery';
    if (isAdmin) return 'admin';
    if (isSeller) return 'seller';
    return 'customer';
  };

  // Send message in active ticket
  const handleSendReply = async (customMessageText = null) => {
    const textToSend = typeof customMessageText === 'string' ? customMessageText : replyText;
    if (!textToSend || !textToSend.trim() || !selectedTicket) return;

    const senderType = getCurrentSenderType();
    const userMessage = {
      sender: senderType,
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentId = selectedTicket._id || selectedTicket.id;
    const updatedMessages = [...(selectedTicket.messages || []), userMessage];
    const updatedTicket = { 
      ...selectedTicket, 
      messages: updatedMessages,
      // If delivery partner or admin answers an open ticket, update status to IN_PROGRESS
      status: (senderType !== 'customer' && selectedTicket.status === 'OPEN') ? 'IN_PROGRESS' : selectedTicket.status
    };

    // Update state locally
    setSelectedTicket(updatedTicket);
    setTickets(prev => prev.map(t => (t._id || t.id) === currentId ? updatedTicket : t));
    setReplyText('');

    // Save to localStorage
    try {
      localStorage.setItem('shopsphere_support_tickets', JSON.stringify(
        tickets.map(t => (t._id || t.id) === currentId ? updatedTicket : t)
      ));
    } catch (e) {}

    // Send to backend API
    try {
      await fetch(`${API_BASE_URL}/api/support/${currentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userMessage.sender, text: userMessage.text })
      });
    } catch (err) {
      console.warn("Backend reply saved locally", err);
    }

    showInAppToast({
      message: `Message sent as ${userRole}!`,
      type: 'success'
    });
  };

  // Change ticket status
  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    const currentId = selectedTicket._id || selectedTicket.id;
    const updated = { ...selectedTicket, status: newStatus };
    setSelectedTicket(updated);
    setTickets(prev => prev.map(t => (t._id || t.id) === currentId ? updated : t));

    try {
      await fetch(`${API_BASE_URL}/api/support/${currentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      showInAppToast({ message: `Ticket status set to: ${newStatus}`, type: 'info' });
    } catch (err) {
      console.warn(err);
    }
  };

  // Create new ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      showInAppAlert({
        title: 'Incomplete Request',
        message: 'Please provide both a subject and details for your ticket.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }

    setIsSubmitting(true);
    const activeCustomerName = customerNameInput.trim() || currentUser?.name || 'Customer';
    const activeCustomerEmail = customerEmailInput.trim() || currentUser?.email || 'customer@shopsphere.com';

    const newTicketData = {
      _id: `TCK-${Math.floor(500 + Math.random() * 499)}`,
      user: activeCustomerEmail,
      userName: activeCustomerName,
      userEmail: activeCustomerEmail,
      subject: `[${newCategory}] ${newSubject.trim()}`,
      orderId: newOrderId.trim(),
      priority: newPriority,
      status: 'OPEN',
      createdAt: 'Just now',
      description: newDescription.trim(),
      messages: [
        {
          sender: getCurrentSenderType(),
          text: newDescription.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    try {
      await fetch(`${API_BASE_URL}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeCustomerEmail,
          userName: activeCustomerName,
          userEmail: activeCustomerEmail,
          subject: newTicketData.subject,
          description: newDescription.trim(),
          priority: newPriority,
          orderId: newOrderId.trim()
        })
      });
    } catch (err) {
      console.warn("Backend ticket saved locally", err);
    }

    const updated = [newTicketData, ...tickets];
    setTickets(updated);
    setSelectedTicket(newTicketData);
    try {
      localStorage.setItem('shopsphere_support_tickets', JSON.stringify(updated));
    } catch (e) {}

    setIsSubmitting(false);
    setNewSubject('');
    setNewDescription('');
    setNewOrderId('');
    setActiveTab('tickets');

    showInAppAlert({
      title: 'Ticket Submitted Successfully',
      message: `Your support ticket #${newTicketData._id} has been opened.\nAll platform agents and delivery partners can view and respond directly in the live chat.`,
      type: 'success',
      confirmText: 'View Live Chat'
    });
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen text-white relative z-10">
      {/* Header Banner with Active Role Indicator */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isDeliveryPartner 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : isAdmin
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
            }`}>
              {isDeliveryPartner ? <Truck className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
              <span>Active Workspace Role: {userRole}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Customer & Delivery Support Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time interactive messaging connecting Customers, Delivery Partners, and Platform Providers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white border-teal-400/40 shadow-lg'
                : 'glass-panel-3d text-gray-300 hover:text-white border-white/10'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat Threads ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white border-teal-400/40 shadow-lg'
                : 'glass-panel-3d text-gray-300 hover:text-white border-white/10'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Open New Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
              activeTab === 'faqs'
                ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white border-teal-400/40 shadow-lg'
                : 'glass-panel-3d text-gray-300 hover:text-white border-white/10'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Solutions FAQ</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Chat & Tickets Queue */}
      {activeTab === 'tickets' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ticket Queue List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Inquiry Threads ({filteredTickets.length})
              </h3>
              <div className="flex items-center gap-1">
                {['ALL', 'OPEN', 'RESOLVED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition-colors ${
                      statusFilter === st 
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' 
                        : 'text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTickets.map(t => {
                const isSelected = (selectedTicket?._id || selectedTicket?.id) === (t._id || t.id);
                return (
                  <div
                    key={t._id || t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-400/50 shadow-lg shadow-teal-500/10'
                        : 'glass-panel-3d border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-xs font-bold text-teal-300">{t._id || t.id}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white line-clamp-1">{t.subject}</h4>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                      <span className="truncate max-w-[130px] font-semibold text-gray-300">
                        {formatCustomerName(t)}
                      </span>
                      <span className={`font-bold ${
                        t.status === 'RESOLVED' 
                          ? 'text-emerald-400' 
                          : t.status === 'IN_PROGRESS' 
                          ? 'text-amber-400' 
                          : 'text-teal-400'
                      }`}>
                        ● {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="w-full py-3 rounded-2xl glass-panel-3d border border-dashed border-white/20 hover:border-teal-400 text-xs font-bold text-teal-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Support Inquiry</span>
            </button>
          </div>

          {/* Ticket Live Conversation Thread */}
          <div className="lg:col-span-2 glass-panel-3d p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col h-[600px]">
            {selectedTicket ? (
              <>
                {/* Conversation Header */}
                <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-teal-400 font-bold">{selectedTicket._id || selectedTicket.id}</span>
                      {selectedTicket.orderId && (
                        <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-blue-300 border border-blue-400/30 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-blue-400" />
                          <span>Order #{selectedTicket.orderId}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white mt-1">{selectedTicket.subject}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Client: <span className="text-gray-200 font-semibold">{formatCustomerName(selectedTicket)}</span> ({selectedTicket.userEmail && !/alex|tester/i.test(selectedTicket.userEmail) ? selectedTicket.userEmail : 'pavan@example.com'})
                    </p>
                  </div>

                  {/* Status dropdown & role badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-dark-900 border border-white/15 text-xs font-bold rounded-xl px-3 py-1.5 text-teal-300 focus:outline-none cursor-pointer"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3.5 custom-scrollbar pr-1">
                  {selectedTicket.messages && selectedTicket.messages.map((m, idx) => {
                    const isMyOwnMessage = 
                      (isCustomer && m.sender === 'customer') ||
                      (isDeliveryPartner && m.sender === 'delivery') ||
                      (isAdmin && (m.sender === 'admin' || m.sender === 'agent'));

                    const isDeliverySender = m.sender === 'delivery';
                    const isAdminSender = m.sender === 'admin' || m.sender === 'agent';
                    const isCustomerSender = m.sender === 'customer';

                    return (
                      <div key={idx} className={`flex ${isMyOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs space-y-1 ${
                          isMyOwnMessage
                            ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white rounded-br-none shadow-lg'
                            : isDeliverySender
                            ? 'bg-dark-800 text-blue-100 border border-blue-500/40 rounded-bl-none shadow-md'
                            : isAdminSender
                            ? 'bg-dark-800 text-amber-100 border border-amber-500/40 rounded-bl-none shadow-md'
                            : 'bg-dark-800 text-gray-200 border border-white/15 rounded-bl-none shadow-md'
                        }`}>
                          <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 mb-1 pb-1 border-b border-white/10">
                            <span className="font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                              {isDeliverySender ? (
                                <>
                                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                                  <span className="text-blue-300">Delivery Partner (Swift Logistics)</span>
                                </>
                              ) : isAdminSender ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="text-amber-300">Platform Support Provider</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3.5 h-3.5 text-teal-300" />
                                  <span className="text-teal-200">Customer ({formatCustomerName(selectedTicket)})</span>
                                </>
                              )}
                            </span>
                            <span className="text-[10px] opacity-70">{m.time || '11:41 AM'}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap font-medium">
                            {(() => {
                              const customerName = formatCustomerName(selectedTicket);
                              return m.text 
                                ? m.text
                                    .replace(/Hello (Alex|Alex Tester|Pavan Teja)!/gi, `Hello ${customerName}!`)
                                    .replace(/(Alex|Alex Tester)!/gi, `${customerName}!`)
                                    .replace(/\b(Alex|Alex Tester)\b/gi, customerName)
                                : '';
                            })()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Presets for Delivery Partner or Admin */}
                {isDeliveryPartner && (
                  <div className="pt-2 pb-1 flex items-center gap-1.5 overflow-x-auto text-[11px] text-gray-400">
                    <span className="font-bold text-blue-400 shrink-0 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Quick Courier Updates:
                    </span>
                    {[
                      '🚚 Out for delivery with courier DL-04-8921. Reaching soon!',
                      '📍 Reached building entrance; arriving at your doorstep in 5 mins.',
                      '✅ Package safely delivered and handed over to recipient.',
                      '📞 Attempted delivery; please confirm if you are available at location.'
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendReply(preset)}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-200 whitespace-nowrap text-[10px] font-semibold transition-all shrink-0"
                      >
                        {preset.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                )}

                {/* Interactive Reply Input Bar */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendReply(); }} 
                  className="pt-3 border-t border-white/10 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder={
                      isDeliveryPartner
                        ? "Reply as Delivery Partner (e.g. Courier on vehicle DL-04...)..."
                        : isAdmin
                        ? "Reply as Platform Support Provider..."
                        : "Type your customer message or follow-up question..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-dark-900/90 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                      isDeliveryPartner
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:brightness-110 text-white'
                        : 'bg-gradient-to-r from-teal-500 to-brand-500 hover:brightness-110 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send as {isDeliveryPartner ? 'Delivery' : userRole}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-6">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-teal-400" />
                <h4 className="text-base font-bold text-white mb-1">Select an inquiry from the queue</h4>
                <p className="text-gray-400 max-w-xs mb-4">Choose any ticket from the left panel to review message transcripts and respond.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 rounded-full bg-teal-500 text-white font-bold text-xs"
                >
                  Open New Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Create New Ticket */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto glass-panel-3d p-7 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create a Support Inquiry</h2>
              <p className="text-xs text-gray-400">Directly connect with delivery partners and platform logistics concierges.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Inquiry Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400"
                >
                  <option value="Delivery Inquiries">Delivery & Courier Inquiries</option>
                  <option value="Product Damaged">Product Damaged / Defective</option>
                  <option value="Returns & Refunds">Returns & Refund Escalation</option>
                  <option value="Artisan Verification">Artisan Trust & Certification</option>
                  <option value="Payment Inquiry">Payment & Invoice Query</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Urgency / Priority:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400"
                >
                  <option value="LOW">Low (General question)</option>
                  <option value="MEDIUM">Medium (Standard request)</option>
                  <option value="HIGH">High (Urgent transit/doorstep issue)</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Your Full Name (Customer):</label>
                <input
                  type="text"
                  placeholder="Enter your customer name"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Contact Email Address:</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerEmailInput}
                  onChange={(e) => setCustomerEmailInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Subject / Summary:</label>
                <input
                  type="text"
                  placeholder="e.g. Where is my courier delivery van?"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Order Reference # (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-89234"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Detailed Description:</label>
              <textarea
                rows={5}
                placeholder="Explain the question or transit issue in detail. Mention package tracking numbers if relevant..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-dark-900 border border-white/15 text-white text-xs outline-none focus:border-teal-400 placeholder-gray-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-brand-500 hover:brightness-110 active:scale-98 text-white text-xs font-bold shadow-lg transition-all"
              >
                {isSubmitting ? 'Opening Ticket...' : 'Submit Support Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Quick Solutions & FAQs */}
      {activeTab === 'faqs' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center pb-4">
            <h2 className="text-2xl font-bold text-white">Instant Answers & Self-Service</h2>
            <p className="text-xs text-gray-400 mt-1">Direct answers on courier handovers, multi-vendor deliveries, and refunds.</p>
          </div>

          {[
            {
              q: "How does the Delivery Partner know about my order?",
              a: "When you complete checkout, your order is instantly broadcast to the Swift Logistics Delivery Portal. Assigned couriers see recipient address, phone, item details, and manage the dispatch timeline."
            },
            {
              q: "Can I chat directly with the Delivery Partner?",
              a: "Yes! Use the live chat thread in Support Desk. Both customers and delivery partners share the same ticket thread so you can coordinate arrival times, delivery gate pass codes, and landmarks."
            },
            {
              q: "What happens when the delivery partner marks my order as 'Delivered'?",
              a: "The status automatically updates in your 'My Orders' center to 100% Delivered, generates your official printable tax invoice, and starts your 7-day return window guarantee."
            },
            {
              q: "What if I am not available at my address when the courier arrives?",
              a: "Message your courier directly in this Support Desk chat thread or use the phone contact provided in the Delivery Partner Portal to request a rescheduled drop-off."
            }
          ].map((faq, i) => (
            <div key={i} className="glass-panel-3d p-6 rounded-2xl border border-white/10 space-y-2">
              <h3 className="font-bold text-sm text-teal-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}

          <div className="text-center pt-6">
            <p className="text-xs text-gray-400 mb-3">Still have a specific question about your shipment?</p>
            <button
              onClick={() => setActiveTab('create')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-brand-500 text-white font-bold text-xs shadow-lg"
            >
              Open a Direct Support Inquiry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
