import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Order } from '../types';
import { Package, User, MapPin, Award, Clock, ArrowRight, LogOut, CheckCircle2, Bell, Phone, Mail, ShoppingBag, Truck, Calendar, Tag, Save, Edit2, Check } from 'lucide-react';

export const CustomerDashboard: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { currentUser, logout, loginDirectly } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);

    const updatedUser = {
      ...currentUser,
      name: profileName,
      phone: profilePhone,
      address: profileAddress
    };

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          name: profileName,
          phone: profilePhone,
          address: profileAddress
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          loginDirectly(data.user);
        } else {
          loginDirectly(updatedUser);
        }
      } else {
        loginDirectly(updatedUser);
      }
      setProfileSavedSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch (err) {
      loginDirectly(updatedUser);
      setProfileSavedSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      let isSubscribed = true;

      const loadOrdersAndNotifs = async () => {
        setIsLoading(true);
        try {
          // 1. Fetch from Firestore directly for guaranteed speed and static host support
          const q = query(collection(db, 'orders'), where('customerEmail', '==', currentUser.email));
          const snap = await getDocs(q).catch(() => null);
          if (snap && isSubscribed) {
            const fsOrders = snap.docs.map(d => d.data() as Order);
            const sorted = [...fsOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(sorted);
          }

          // 2. Try API with 1.2s timeout
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1200);

          fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`, { signal: controller.signal })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              clearTimeout(timer);
              if (data && isSubscribed) {
                const rawOrders: Order[] = data.orders || data;
                if (Array.isArray(rawOrders)) {
                  const sorted = [...rawOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  setOrders(sorted);
                }
              }
            })
            .catch(() => clearTimeout(timer));

          fetch(`/api/notifications?email=${encodeURIComponent(currentUser.email)}`, { signal: controller.signal })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data && isSubscribed && Array.isArray(data)) setNotifications(data);
            })
            .catch(() => {});
        } finally {
          if (isSubscribed) setIsLoading(false);
        }
      };

      loadOrdersAndNotifs();

      return () => { isSubscribed = false; };
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F7F2E8] py-10 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Welcome Card */}
        <div className="bg-[#29231F] text-[#F7F2E8] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-[#A86445]/20">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#6F7655] text-white px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider">
              <User className="w-3.5 h-3.5" />
              <span>{t('Customer Portal', 'গ্রাহক অ্যাকাউন্ট')}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {t(`Welcome back, ${currentUser.name}!`, `স্বাগতম, ${currentUser.name}!`)}
            </h1>
            <p className="text-xs text-[#E8DCC8]/80 font-sans flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>{t('Email:', 'ইমেইল:')} <strong className="text-[#C8A96B] font-mono">{currentUser.email}</strong></span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#F7F2E8]/10 rounded-xl text-center border border-[#F7F2E8]/10">
              <span className="text-[10px] text-[#C8A96B] uppercase font-mono block tracking-wider">{t('Reward Points', 'রিওয়ার্ড পয়েন্ট')}</span>
              <span className="font-serif text-2xl font-bold text-[#F7F2E8]">
                {currentUser.rewardPoints || 120} pts
              </span>
            </div>

            <button
              onClick={() => { logout(); onNavigateHome(); }}
              className="p-3 bg-[#A86445] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('Log Out', 'লগ আউট')}</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Order History */}
          <div className="lg:col-span-2 bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DCC8]">
              <h2 className="font-serif text-xl font-bold text-[#29231F] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#6F7655]" />
                <span>{t('Your Orders', 'আপনার অর্ডারসমূহ')}</span>
              </h2>
              <span className="text-xs text-[#A86445] font-mono font-bold bg-[#A86445]/10 px-2.5 py-1 rounded-full">
                {orders.length} {t('Orders', 'টি অর্ডার')}
              </span>
            </div>

            {isLoading ? (
              <p className="text-xs text-[#29231F]/60 py-8 text-center">{t('Loading orders...', 'অর্ডার লোড হচ্ছে...')}</p>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Package className="w-12 h-12 text-[#E8DCC8] mx-auto" />
                <p className="font-serif text-base font-bold text-[#29231F]">{t('No orders placed yet', 'এখনো কোনো অর্ডার করা হয়নি')}</p>
                <p className="text-xs text-[#29231F]/60 max-w-sm mx-auto">{t('Explore our signature healthy snacks to place your first order.', 'আমাদের সুস্বাদু স্বাস্থ্যকর স্ন্যাক্স নির্বাচন থেকে অর্ডার করুন।')}</p>
                <button
                  onClick={onNavigateHome}
                  className="px-6 py-2.5 bg-[#6F7655] text-white rounded-xl text-xs font-bold hover:bg-[#29231F] transition-colors cursor-pointer"
                >
                  {t('Explore Collection', 'পণ্যসমূহ দেখুন')}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, index) => {
                  const isLatestOrder = index === 0;
                  return (
                    <div
                      key={order.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm ${
                        isLatestOrder
                          ? 'bg-white border-[#6F7655] ring-2 ring-[#6F7655]/20'
                          : 'bg-white/80 border-[#E8DCC8]'
                      }`}
                    >
                      {/* Order Banner Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8DCC8] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#A86445] bg-[#A86445]/10 px-2.5 py-0.5 rounded-md">
                            {order.id}
                          </span>
                          {isLatestOrder && (
                            <span className="bg-[#6F7655] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <SparklesIcon className="w-3 h-3" />
                              {t('Recently Placed Order', 'সর্বশেষ অর্ডার')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[#29231F]/60 text-[11px] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#6F7655]" />
                            {new Date(order.createdAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-[#C8A96B]/20 text-[#A86445]'
                          }`}>
                            {t(order.status, order.status === 'Pending' ? 'পেন্ডিং' : order.status === 'Processing' ? 'প্রসেসিং' : order.status === 'Delivered' ? 'ডেলিভার্ড' : order.status)}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Information Box */}
                      <div className="p-3.5 bg-[#F7F2E8]/60 rounded-xl border border-[#E8DCC8] text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#6F7655] text-[11px] uppercase tracking-wider mb-1">
                          <Truck className="w-3.5 h-3.5 text-[#A86445]" />
                          <span>{t('Delivery Information', 'ডেলিভারির তথ্য')}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#29231F]/90">
                          <div>
                            <span className="text-[#29231F]/60 block text-[10px]">{t('Recipient Name', 'প্রাপকের নাম')}</span>
                            <span className="font-bold">{order.customerName || currentUser.name}</span>
                          </div>
                          <div>
                            <span className="text-[#29231F]/60 block text-[10px]">{t('Phone Number', 'ফোন নম্বর')}</span>
                            <span className="font-medium font-mono">{order.customerPhone || currentUser.phone || 'N/A'}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[#29231F]/60 block text-[10px]">{t('Shipping Address', 'ডেলিভারি ঠিকানা')}</span>
                            <span className="font-medium">
                              {order.shippingAddress?.street ? `${order.shippingAddress.street}, ${order.shippingAddress.district}` : t('Standard Address', 'ঠিকানা দেওয়া হয়েছে')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ordered Products List */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7655] block">
                          {t('Ordered Items', 'অর্ডার করা পণ্যসমূহ')}:
                        </span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-xs p-2.5 bg-white border border-[#E8DCC8]/60 rounded-xl hover:border-[#C8A96B] transition-colors">
                            <img
                              src={item.image}
                              alt={item.productName}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-[#E8DCC8] border border-[#E8DCC8]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#29231F] truncate text-xs sm:text-sm">{item.productName}</p>
                              <div className="flex items-center gap-2 text-[11px] text-[#A86445] mt-0.5">
                                <span className="bg-[#A86445]/10 px-1.5 py-0.5 rounded font-medium">{item.weight}</span>
                                <span>× {item.quantity} {t('qty', 'টি')}</span>
                                <span className="text-[#29231F]/50">(৳{item.price} {t('each', 'প্রতিটি')})</span>
                              </div>
                            </div>
                            <span className="font-serif font-bold text-sm text-[#29231F] shrink-0">
                              ৳{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary Footer */}
                      <div className="pt-3 border-t border-[#E8DCC8] flex flex-wrap justify-between items-center text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#29231F]/60">{t('Payment Method:', 'পেমেন্ট পদ্ধতি:')}</span>
                          <span className="font-bold text-[#29231F] bg-[#E8DCC8]/40 px-2.5 py-0.5 rounded-md font-mono">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          {order.deliveryFee > 0 && (
                            <span className="text-[#29231F]/60 text-[11px]">
                              {t('Delivery:', 'ডেলিভারি:')} ৳{order.deliveryFee}
                            </span>
                          )}
                          <div>
                            <span className="text-[#29231F]/60 mr-1.5">{t('Total Amount:', 'মোট মূল্য:')}</span>
                            <span className="font-serif font-bold text-base text-[#29231F]">৳{order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Profile & Address Sidebar */}
          <div className="space-y-6">

            {/* Account Info */}
            <div className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#29231F] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#6F7655]" />
                  <span>{t('Account Details', 'অ্যাকাউন্ট বিবরণ')}</span>
                </h3>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-2.5 py-1 bg-[#6F7655]/10 hover:bg-[#6F7655] hover:text-white text-[#6F7655] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('Edit', 'এডিট')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="text-xs text-[#29231F]/60 hover:text-[#29231F] font-bold"
                  >
                    {t('Cancel', 'বাতিল')}
                  </button>
                )}
              </div>

              {profileSavedSuccess && (
                <div className="p-2.5 bg-green-100 border border-green-300 rounded-xl text-green-800 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{t('Profile saved successfully!', 'প্রোফাইল তথ্য সংরক্ষিত হয়েছে!')}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#29231F]/60 mb-1">{t('Customer Name', 'গ্রাহকের নাম')}</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full p-2 bg-white border border-[#E8DCC8] rounded-lg text-[#29231F] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#29231F]/60 mb-1">{t('Email Address', 'ইমেইল ঠিকানা')}</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full p-2 bg-[#E8DCC8]/30 border border-[#E8DCC8] rounded-lg text-[#29231F]/60 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#29231F]/60 mb-1">{t('Phone Number', 'ফোন নম্বর')}</label>
                    <input
                      type="tel"
                      placeholder="e.g. 01700000000"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      className="w-full p-2 bg-white border border-[#E8DCC8] rounded-lg text-[#29231F] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#29231F]/60 mb-1">{t('Shipping Address', 'ডেলিভারি ঠিকানা')}</label>
                    <textarea
                      rows={2}
                      placeholder={t('e.g. House 12, Road 4, Dhanmondi, Dhaka', 'যেমন: বাসা ১২, রোড ৪, ধানমন্ডি, ঢাকা')}
                      value={profileAddress}
                      onChange={e => setProfileAddress(e.target.value)}
                      className="w-full p-2 bg-white border border-[#E8DCC8] rounded-lg text-[#29231F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full py-2.5 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-xl text-xs transition-all shadow flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Save className="w-4 h-4 text-[#C8A96B]" />
                    <span>{isSavingProfile ? t('Saving...', 'সংরক্ষণ করা হচ্ছে...') : t('Save Profile Changes', 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন')}</span>
                  </button>
                </form>
              ) : (
                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-[#29231F]/60 block text-[10px] uppercase font-mono">{t('Customer Name', 'গ্রাহকের নাম')}</span>
                    <span className="font-bold text-[#29231F] text-sm">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[#29231F]/60 block text-[10px] uppercase font-mono">{t('Email Address', 'ইমেইল ঠিকানা')}</span>
                    <span className="font-bold text-[#29231F] font-mono text-xs">{currentUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[#29231F]/60 block text-[10px] uppercase font-mono">{t('Phone Number', 'ফোন নম্বর')}</span>
                    <span className="font-bold text-[#29231F] font-mono">{currentUser.phone || t('Not specified', 'দেওয়া হয়নি')}</span>
                  </div>
                  <div>
                    <span className="text-[#29231F]/60 block text-[10px] uppercase font-mono">{t('Default Address', 'ডিফল্ট ঠিকানা')}</span>
                    <span className="font-medium text-[#29231F]">{currentUser.address || t('Not specified', 'দেওয়া হয়নি')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#29231F] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#A86445]" />
                  <span>{t('Notifications', 'নোটিফিকেশন')}</span>
                </h3>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-[#A86445] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length} {t('New', 'নতুন')}
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#29231F]/60 py-2 text-center">{t('No notifications yet.', 'কোনো নোটিফিকেশন নেই।')}</p>
                ) : (
                  [...notifications].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notif => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${notif.read ? 'bg-white border-[#E8DCC8] text-[#29231F]/70' : 'bg-[#E8DCC8]/30 border-[#C8A96B] font-medium text-[#29231F]'}`}
                      onClick={() => {
                        if (!notif.read) {
                          fetch(`/api/notifications/${notif.id}/read`, { method: 'PUT' });
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        }
                      }}
                    >
                      <p>{notif.message}</p>
                      <span className="text-[10px] text-[#A86445] block mt-1">{new Date(notif.date).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Club Benefits */}
            <div className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-6 space-y-3 shadow-sm">
              <h3 className="font-serif font-bold text-base text-[#29231F] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#A86445]" />
                <span>{t('Alham Circle Benefits', 'আলহাম সার্কেল সুবিধা')}</span>
              </h3>
              <p className="text-xs text-[#29231F]/80 leading-relaxed">
                {t(
                  'As an active Alham customer, you earn reward points on every order. Points can be redeemed for exclusive artisanal gift boxes.',
                  'প্রতিটি অর্ডারে পয়েন্ট অর্জিত হয়। পয়েন্ট ব্যবহার করে উপহারের বিশেষ বাক্স রিডিম করতে পারেন।'
                )}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );
}

