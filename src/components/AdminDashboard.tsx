import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { db } from '../firebase';
import { doc, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore';
import { Product, Order, Coupon, HomepageContent, User, OrderStatus, DeliverySettings, DeliveryZone } from '../types';
import { CmsAdminManager } from './CmsAdminManager';
import { MediaPicker } from './MediaPicker';
import {
  ShieldCheck,
  Mail,
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Tag,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Truck,
  Printer,
  Sparkles,
  Settings,
  X,
  Eye,
  Copy,
  Globe,
  Star,
  Play,
  ArrowLeft,
  Check,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const { currentUser, logout } = useAuth();
  const { refreshCms, deliverySettings, updateDeliverySettings } = useCms();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'payments' | 'delivery' | 'customers' | 'content' | 'marketing' | 'analytics'>('overview');
  
  const { trackingSettings, updateTrackingSettings, paymentSettings, updatePaymentSettings } = useCms();
  const [localPaymentSettings, setLocalPaymentSettings] = useState<any>(paymentSettings || {});
  const [localTrackingSettings, setLocalTrackingSettings] = useState<any>(trackingSettings || { gtm: {}, ga4: {}, metaPixel: {}, googleAds: {}, tikTokPixel: {}, customScripts: {} });
  useEffect(() => { if (trackingSettings) setLocalTrackingSettings(trackingSettings); }, [trackingSettings]);
  useEffect(() => { if (paymentSettings) setLocalPaymentSettings(paymentSettings); }, [paymentSettings]);
  
  // Data state
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Notification Toast State
  const [notification, setNotification] = useState<string | null>(null);

  // Product View Modal State (Admin Product Details Page)
  const [adminViewProduct, setAdminViewProduct] = useState<Product | null>(null);

  // Delete Confirmation Dialog State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Product Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formLangTab, setFormLangTab] = useState<'en' | 'bn' | 'media_settings'>('en');

  // Delivery Settings Form State
  const [localDeliverySettings, setLocalDeliverySettings] = useState<DeliverySettings>(
    deliverySettings || {
      freeDeliveryEnabled: true,
      globalFreeDeliveryThreshold: 1500,
      zones: [
        { id: 'z1', nameEn: 'Dhaka City', nameBn: 'ঢাকা সিটি', standardFee: 60, expressFee: 120, freeDeliveryMinAmount: 1500, estimatedTimeEn: '3-4 Business Days', estimatedTimeBn: '৩-৪ কর্মদিবস', active: true },
        { id: 'z2', nameEn: 'Outside Dhaka', nameBn: 'ঢাকার বাইরে', standardFee: 120, expressFee: 200, freeDeliveryMinAmount: 2000, estimatedTimeEn: '3-4 Business Days', estimatedTimeBn: '৩-৪ কর্মদিবস', active: true }
      ]
    }
  );

  useEffect(() => {
    if (deliverySettings) {
      setLocalDeliverySettings(deliverySettings);
    }
  }, [deliverySettings]);

  // Order Details Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newTrackingNum, setNewTrackingNum] = useState('');
  const [newCourier, setNewCourier] = useState('Pathao Courier');

  // Order Filtering & Search State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('All');
  const [orderDatePreset, setOrderDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [orderFromDate, setOrderFromDate] = useState<string>('');
  const [orderToDate, setOrderToDate] = useState<string>('');

  // Helper to filter orders based on active filters
  const getFilteredOrders = () => {
    return orders.filter(o => {
      // Search term filter (Order ID, Customer Name, Phone, Email, Item SKU)
      if (orderSearchTerm.trim()) {
        const query = orderSearchTerm.trim().toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(query);
        const matchName = (o.customerName || '').toLowerCase().includes(query);
        const matchPhone = (o.customerPhone || '').toLowerCase().includes(query);
        const matchEmail = (o.customerEmail || '').toLowerCase().includes(query);
        const matchSku = (o.items || []).some(it => 
          (it.sku || '').toLowerCase().includes(query) ||
          (it.productName || '').toLowerCase().includes(query)
        );
        if (!matchId && !matchName && !matchPhone && !matchEmail && !matchSku) {
          return false;
        }
      }

      // Status filter
      if (orderStatusFilter !== 'All') {
        if ((o.status || '').toLowerCase() !== orderStatusFilter.toLowerCase()) {
          return false;
        }
      }

      // Payment Method filter
      if (orderPaymentFilter !== 'All') {
        if ((o.paymentMethod || '').toLowerCase() !== orderPaymentFilter.toLowerCase()) {
          return false;
        }
      }

      // Date Preset or Custom Date filter
      if (o.createdAt) {
        const orderDate = new Date(o.createdAt);
        if (orderDatePreset === 'today') {
          const todayStr = new Date().toISOString().split('T')[0];
          const orderDateStr = orderDate.toISOString().split('T')[0];
          if (orderDateStr !== todayStr) return false;
        } else if (orderDatePreset === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yestStr = yesterday.toISOString().split('T')[0];
          const orderDateStr = orderDate.toISOString().split('T')[0];
          if (orderDateStr !== yestStr) return false;
        } else if (orderDatePreset === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          if (orderDate.getTime() < oneWeekAgo.getTime()) return false;
        } else if (orderDatePreset === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
          if (orderDate.getTime() < oneMonthAgo.getTime()) return false;
        } else if (orderDatePreset === 'custom') {
          if (orderFromDate) {
            const fromMs = new Date(orderFromDate + 'T00:00:00').getTime();
            if (orderDate.getTime() < fromMs) return false;
          }
          if (orderToDate) {
            const toMs = new Date(orderToDate + 'T23:59:59').getTime();
            if (orderDate.getTime() > toMs) return false;
          }
        }
      }

      return true;
    });
  };

  // Excel / CSV Export Handler
  const handleExportOrders = () => {
    const listToExport = getFilteredOrders();

    if (listToExport.length === 0) {
      showToast('No orders match the selected filter criteria to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Order Date & Time',
      'Order Status',
      'Payment Status',
      'Payment Method',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Shipping Address',
      'City / District',
      'Postal Code',
      'Ordered Products Detail (SKU, Name, Qty, Price)',
      'Product SKUs',
      'Total Items Count',
      'Subtotal (BDT)',
      'Delivery Fee (BDT)',
      'Discount (BDT)',
      'Grand Total (BDT)',
      'Order Notes'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listToExport.map(order => {
      const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';
      const address = order.shippingAddress || {} as any;
      
      const itemDetails = (order.items || []).map(item => {
        const skuStr = item.sku || (products.find(p => p.id === item.productId)?.sku) || 'ALH-GEN';
        return `[SKU: ${skuStr}] ${item.productName} (${item.weight || ''}) x${item.quantity} @ ৳${item.price} = ৳${item.price * item.quantity}`;
      }).join(' | ');

      const skuList = Array.from(new Set((order.items || []).map(item => 
        item.sku || (products.find(p => p.id === item.productId)?.sku) || 'ALH-GEN'
      ))).join(', ');

      const totalQty = (order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

      return [
        escapeCSV(order.id),
        escapeCSV(dateStr),
        escapeCSV(order.status),
        escapeCSV(order.paymentStatus || 'Pending'),
        escapeCSV(order.paymentMethod || 'COD'),
        escapeCSV(order.customerName || ''),
        escapeCSV(order.customerPhone || ''),
        escapeCSV(order.customerEmail || ''),
        escapeCSV(address.street || address.addressLine1 || ''),
        escapeCSV(address.district || address.city || ''),
        escapeCSV(address.postalCode || ''),
        escapeCSV(itemDetails),
        escapeCSV(skuList),
        escapeCSV(totalQty),
        escapeCSV(order.subtotal || 0),
        escapeCSV(order.deliveryFee || 0),
        escapeCSV(order.discount || 0),
        escapeCSV(order.total || 0),
        escapeCSV(order.notes || '')
      ].join(',');
    });

    // \uFEFF UTF-8 BOM prefix for seamless Microsoft Excel rendering
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10);
    link.setAttribute('download', `ALHAM_Orders_Report_${orderStatusFilter}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${listToExport.length} order(s) to Excel / CSV successfully!`);
  };

  // Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(10);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Firestore directly for guaranteed static hosting support
      const [pSnap, oSnap, uSnap, cSnap] = await Promise.all([
        getDocs(collection(db, 'products')).catch(() => null),
        getDocs(collection(db, 'orders')).catch(() => null),
        getDocs(collection(db, 'users')).catch(() => null),
        getDocs(collection(db, 'coupons')).catch(() => null)
      ]);

      const fsProducts = pSnap ? pSnap.docs.map(d => d.data() as Product) : [];
      const fsOrders = oSnap ? oSnap.docs.map(d => d.data() as Order) : [];
      const fsUsers = uSnap ? uSnap.docs.map(d => d.data() as User) : [];
      const fsCoupons = cSnap ? cSnap.docs.map(d => d.data() as Coupon) : [];

      // 2. Try fetching from /api/ if server API exists with 1.2s timeout
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1200);

        const fetchWithTimeout = (url: string) => 
          fetch(url, { signal: controller.signal }).then(r => r.json()).catch(() => null);

        const [sRes, pRes, oRes, cRes, mRes, contRes] = await Promise.all([
          fetchWithTimeout('/api/admin/stats'),
          fetchWithTimeout('/api/products'),
          fetchWithTimeout('/api/orders'),
          fetchWithTimeout('/api/admin/customers'),
          fetchWithTimeout('/api/coupons'),
          fetchWithTimeout('/api/content')
        ]);
        clearTimeout(timer);

        if (sRes?.stats) setStats(sRes.stats);
        if (pRes?.products) setProducts(pRes.products); else setProducts(fsProducts);
        if (oRes?.orders) setOrders(oRes.orders); else setOrders(fsOrders);
        if (cRes?.customers) setCustomers(cRes.customers); else setCustomers(fsUsers);
        if (mRes?.coupons) setCoupons(mRes.coupons); else setCoupons(fsCoupons);
        if (contRes?.content) setContent(contRes.content);
      } catch (e) {
        // Fallback to Firestore data
        setProducts(fsProducts);
        setOrders(fsOrders);
        setCustomers(fsUsers);
        setCoupons(fsCoupons);
      }

      // Compute stats fallback if not set by API
      setStats(prev => {
        const totalRev = fsOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pendingOrds = fsOrders.filter(o => o.status === 'Pending' || o.status === 'Payment Verification Pending').length;
        const lowStock = fsProducts.filter(p => (p.stock ?? 0) <= 5).length;
        return {
          totalRevenue: prev?.totalRevenue || totalRev,
          totalOrders: prev?.totalOrders || fsOrders.length,
          pendingOrders: prev?.pendingOrders || pendingOrds,
          totalCustomers: prev?.totalCustomers || fsUsers.length,
          lowStockCount: prev?.lowStockCount || lowStock
        };
      });

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Product Save (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      alert('Please enter at least a product name and price.');
      return;
    }

    const prodId = editingProduct.id || `prod-${Date.now()}`;
    const payload: Product = {
      ...editingProduct,
      id: prodId,
      name: editingProduct.name,
      price: Number(editingProduct.price),
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['/src/assets/images/snickers_bar_cut_1784995506640.jpg'],
      ingredients: editingProduct.ingredients || ['Dates', 'Roasted Nuts'],
      allergens: editingProduct.allergens || ['Nuts'],
      tasteProfile: editingProduct.tasteProfile || { sweetness: 3, richness: 4, crunch: 3 },
      nutrition: editingProduct.nutrition || { calories: '180 kcal', protein: '4g', carbs: '20g', fat: '7g', fiber: '3g', sugars: '12g' },
      stock: editingProduct.stock ?? 30,
      category: editingProduct.category || 'Indulgent'
    };

    try {
      // Direct Firestore Save
      await setDoc(doc(db, 'products', prodId), payload, { merge: true });

      // Try API route
      try {
        const method = editingProduct.id ? 'PUT' : 'POST';
        const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {}

      setIsProductModalOpen(false);
      setEditingProduct(null);
      showToast(editingProduct.id ? 'Product updated successfully!' : 'New product created successfully!');
      await fetchAllData();
      await refreshCms();

      if (adminViewProduct && adminViewProduct.id === prodId) {
        setAdminViewProduct(payload);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  // Handle Product Delete
  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const prodId = productToDelete.id;
    const prodName = productToDelete.name;

    try {
      await deleteDoc(doc(db, 'products', prodId));

      try {
        await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      } catch (e) {}

      setProductToDelete(null);
      if (adminViewProduct?.id === prodId) {
        setAdminViewProduct(null);
      }
      showToast(`Product "${prodName}" deleted permanently.`);
      await fetchAllData();
      await refreshCms();
    } catch (err) {
      console.error(err);
      alert('Server error deleting product');
    }
  };

  // Handle Product Duplicate
  const handleDuplicateProduct = (prod: Product) => {
    const copy: Partial<Product> = {
      ...prod,
      id: undefined,
      name: `${prod.name} (Copy)`,
      nameBn: prod.nameBn ? `${prod.nameBn} (কপি)` : undefined,
      sku: prod.sku ? `${prod.sku}-COPY` : `ALHAM-${Math.floor(Math.random() * 9000 + 1000)}`
    };
    setEditingProduct(copy);
    setFormLangTab('en');
    setIsProductModalOpen(true);
  };

  // Delivery Settings Handler
  const handleSaveDeliverySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await updateDeliverySettings(localDeliverySettings);
      if (success) {
        showToast('Delivery and shipping settings updated successfully!');
      } else {
        alert('Could not update delivery settings.');
      }
    } catch (err) {
      alert('Error updating delivery settings.');
    }
  };

  // Tracking Settings Handler
  const handleSaveTrackingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await updateTrackingSettings(localTrackingSettings);
      if (success) {
        showToast('Tracking & Analytics settings updated successfully!');
      } else {
        alert('Could not update tracking settings.');
      }
    } catch (err) {
      alert('Error updating tracking settings.');
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updateData: any = { status };
      if (newTrackingNum) updateData.trackingNumber = newTrackingNum;
      if (newCourier) updateData.courierName = newCourier;

      await setDoc(doc(db, 'orders', orderId), updateData, { merge: true });

      try {
        await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      } catch (e) {}

      showToast(`Order status updated to ${status}`);
      fetchAllData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updateData } : null);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const couponId = `c-${Date.now()}`;
      const couponData = {
        id: couponId,
        code: newCouponCode.toUpperCase(),
        discountType: 'percentage',
        discountValue: Number(newCouponValue),
        minOrderAmount: 500
      };

      await setDoc(doc(db, 'coupons', couponId), couponData, { merge: true });

      try {
        await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponData)
        });
      } catch (e) {}

      setNewCouponCode('');
      showToast('New coupon code activated!');
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Error creating coupon');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#29231F] text-[#F7F2E8] text-left relative">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#6F7655] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#C8A96B]" />
          <span className="font-semibold text-xs">{notification}</span>
        </div>
      )}

      {/* Super Admin Top Header */}
      <header className="bg-[#1F1A17] border-b border-[#C8A96B]/20 py-4 px-6 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#6F7655] rounded-xl text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#F7F2E8] flex items-center gap-2">
              <span>Alham Super Admin Dashboard</span>
              <span className="text-[10px] bg-[#C8A96B] text-[#29231F] font-mono px-2 py-0.5 rounded font-bold">
                JIDAN
              </span>
            </h1>
            <p className="text-[11px] text-[#E8DCC8]/60">Logged in as: leptopleptop261@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAllData}
            className="p-2 bg-[#F7F2E8]/10 hover:bg-[#F7F2E8]/20 rounded-lg text-xs flex items-center gap-1 text-[#E8DCC8]"
            title="Refresh System Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-lg transition-colors"
          >
            View Live Store
          </button>

          <button
            onClick={logout}
            className="p-2 text-red-400 hover:text-red-300"
            title="Log Out"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#F7F2E8]/10 pb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'products' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'payments' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Payments</span>
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'delivery' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Delivery & Charges
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'customers' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'content' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Website CMS
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'marketing' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            Coupons & Marketing
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Tracking & Analytics</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-[#E8DCC8]/60 uppercase font-mono">Total Revenue</span>
                <p className="font-serif text-3xl font-bold text-[#C8A96B]">৳{stats.totalRevenue}</p>
                <span className="text-[10px] text-green-400">↑ +18% this month</span>
              </div>
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-[#E8DCC8]/60 uppercase font-mono">Total Orders</span>
                <p className="font-serif text-3xl font-bold text-[#F7F2E8]">{stats.totalOrders}</p>
                <span className="text-[10px] text-[#E8DCC8]/60">{stats.pendingOrders} Pending</span>
              </div>
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-[#E8DCC8]/60 uppercase font-mono">Total Customers</span>
                <p className="font-serif text-3xl font-bold text-[#F7F2E8]">{stats.totalCustomers}</p>
                <span className="text-[10px] text-green-400">Verified buyers</span>
              </div>
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-[#E8DCC8]/60 uppercase font-mono">Low Stock Items</span>
                <p className="font-serif text-3xl font-bold text-yellow-500">{stats.lowStockCount}</p>
                <span className="text-[10px] text-yellow-500">Restock recommended</span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#F7F2E8]">Recent Store Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#E8DCC8]">
                  <thead className="bg-[#29231F] text-[#C8A96B] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F2E8]/10">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-[#29231F]">
                        <td className="p-3 font-mono font-bold text-[#F7F2E8]">{o.id}</td>
                        <td className="p-3">{o.customerName}</td>
                        <td className="p-3 font-serif font-bold">৳{o.total}</td>
                        <td className="p-3">{o.paymentMethod}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'Delivered' ? 'bg-green-900 text-green-300' : 'bg-amber-900 text-amber-300'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => { setSelectedOrder(o); setActiveTab('orders'); }}
                            className="text-[#C8A96B] underline font-bold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Product Catalog Management</h2>
                <p className="text-xs text-[#E8DCC8]/60">Manage artisanal products, bilingual content, images, videos, and inventory.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    nameBn: '',
                    subtitle: '',
                    subtitleBn: '',
                    category: 'Indulgent',
                    price: 500,
                    weight: 'Box of 6 (250g)',
                    weightBn: '৬ পিসের বক্স (২৫০ গ্রাম)',
                    description: '',
                    descriptionBn: '',
                    story: '',
                    storyBn: '',
                    images: ['/src/assets/images/snickers_bar_cut_1784995506640.jpg'],
                    ingredients: ['Dates', 'Roasted Nuts', 'Cocoa'],
                    ingredientsBn: ['খেজুরি মাখনা', 'ভাজা বাদাম', 'কোকো'],
                    allergens: ['Nuts'],
                    allergensBn: ['বাদাম'],
                    tasteProfile: { sweetness: 3, richness: 4, crunch: 3 },
                    nutrition: { calories: '180 kcal', protein: '4g', carbs: '20g', fat: '7g', fiber: '3g', sugars: '12g' },
                    storageInstructions: 'Keep in a cool dry place',
                    storageInstructionsBn: 'ঠাণ্ডা ও শুষ্ক স্থানে রাখুন',
                    shelfLife: '60 Days',
                    shelfLifeBn: '৬০ দিন',
                    deliveryInfo: 'Fresh batch courier shipping',
                    deliveryInfoBn: 'ফ্রেশ কিচেন শিপিং',
                    stock: 30,
                    sku: `ALHAM-${Math.floor(Math.random() * 9000 + 1000)}`,
                    relatedProductsMode: 'auto'
                  });
                  setFormLangTab('en');
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl overflow-hidden p-4 space-y-3 hover:border-[#C8A96B]/50 transition-all group"
                >
                  <div
                    onClick={() => setAdminViewProduct(product)}
                    className="aspect-[16/10] bg-[#29231F] rounded-xl overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={product.images?.[0] || '/src/assets/images/snickers_bar_cut_1784995506640.jpg'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#6F7655] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      {product.category}
                    </div>
                    {product.videoUrl && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-[#C8A96B] p-1.5 rounded-full">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}
                  </div>

                  <div onClick={() => setAdminViewProduct(product)} className="cursor-pointer space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif font-bold text-base text-[#F7F2E8] group-hover:text-[#C8A96B] transition-colors">
                        {product.name}
                      </h3>
                      {product.sku && (
                        <span className="text-[10px] font-mono text-[#E8DCC8]/40 bg-[#29231F] px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      )}
                    </div>
                    {product.nameBn && (
                      <p className="text-xs text-[#E8DCC8]/70 font-medium">{product.nameBn}</p>
                    )}
                    <p className="text-[11px] text-[#E8DCC8]/60 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#F7F2E8]/10 text-xs">
                    <div>
                      <span className="font-serif font-bold text-lg text-[#C8A96B]">৳{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-[11px] text-[#E8DCC8]/40 line-through ml-1.5">৳{product.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-[#E8DCC8]/60 text-[11px]">Stock: {product.stock}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => setAdminViewProduct(product)}
                      className="p-2 bg-[#29231F] hover:bg-[#6F7655] text-[#E8DCC8] rounded text-xs flex items-center justify-center gap-1"
                      title="View Full Product Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setFormLangTab('en');
                        setIsProductModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-[#29231F] hover:bg-[#6F7655] text-xs font-semibold rounded text-center text-[#E8DCC8] hover:text-white transition-colors"
                    >
                      Edit Product
                    </button>

                    <button
                      onClick={() => handleDuplicateProduct(product)}
                      className="p-2 bg-[#29231F] hover:bg-[#A86445] text-[#E8DCC8] rounded text-xs"
                      title="Duplicate Product"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-2 bg-red-950/60 hover:bg-red-800 text-red-300 rounded transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS FULFILLMENT */}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#29231F]">Payments & Settings</h2>
                <p className="text-sm text-[#29231F]/70">Manage manual payment verifications and configure payment gateways.</p>
              </div>
            </div>

            {/* Payment Verification Section */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
              <h3 className="font-serif text-xl font-bold text-[#29231F] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#A86445]" />
                Pending Verifications
              </h3>
              <div className="space-y-4">
                {orders.filter(o => o.paymentStatus === 'Payment Verification Pending').length === 0 ? (
                  <p className="text-sm text-[#29231F]/60">No pending manual payments to verify.</p>
                ) : (
                  orders.filter(o => o.paymentStatus === 'Payment Verification Pending').map(order => (
                    <div key={order.id} className="border border-[#E8DCC8] rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between">
                          <span className="font-mono font-bold text-[#A86445]">{order.id}</span>
                          <span className="font-serif font-bold text-[#29231F]">৳{order.total}</span>
                        </div>
                        <div className="text-xs text-[#29231F]/80 grid grid-cols-2 gap-2">
                          <p><strong>Customer:</strong> {order.customerName}</p>
                          <p><strong>Method:</strong> {order.paymentMethod}</p>
                          <p><strong>Sender No:</strong> {order.paymentSubmission?.senderNumber}</p>
                          <p><strong>Txn ID:</strong> <span className="font-mono bg-[#E8DCC8]/50 px-1 rounded">{order.paymentSubmission?.transactionId}</span></p>
                          <p><strong>Submitted:</strong> {order.paymentSubmission?.date ? new Date(order.paymentSubmission.date).toLocaleString() : ''}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-end">
                        <button 
                          onClick={async () => {
                            try {
                              await setDoc(doc(db, 'orders', order.id), { paymentStatus: 'Paid', status: 'Confirmed' }, { merge: true });
                              try {
                                await fetch(`/api/orders/${order.id}/verify-payment`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'Verified' })
                                });
                              } catch(e) {}
                              showToast('Payment verified successfully');
                              fetchAllData();
                            } catch(e) {
                              alert('Error verifying payment');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >Verify & Confirm</button>
                        <button 
                          onClick={async () => {
                            const note = prompt('Reason for rejection:');
                            if (note !== null) {
                              try {
                                await setDoc(doc(db, 'orders', order.id), { paymentStatus: 'Rejected', adminNote: note }, { merge: true });
                                try {
                                  await fetch(`/api/orders/${order.id}/verify-payment`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Rejected', adminNote: note })
                                  });
                                } catch(e) {}
                                showToast('Payment rejected');
                                fetchAllData();
                              } catch(e) {
                                alert('Error rejecting payment');
                              }
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >Reject Payment</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Settings Section */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-[#E8DCC8] pb-4">
                <h3 className="font-serif text-xl font-bold text-[#29231F] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#6F7655]" />
                  Payment Gateways Configuration
                </h3>
                <button
                  onClick={async () => {
                    const success = await updatePaymentSettings(localPaymentSettings);
                    if (success) showToast('Payment settings saved permanently.');
                  }}
                  className="bg-[#6F7655] hover:bg-[#29231F] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Save Settings
                </button>
              </div>

              {['bKash', 'nagad', 'rocket'].map((gateway) => (
                <div key={gateway} className="border border-[#E8DCC8] rounded-xl p-5 bg-[#F7F2E8]/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg text-[#29231F] capitalize">{gateway} Manual Payment</h4>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          checked={localPaymentSettings?.[gateway]?.enabled || false}
                          onChange={(e) => setLocalPaymentSettings({
                            ...localPaymentSettings, 
                            [gateway]: { ...localPaymentSettings[gateway], enabled: e.target.checked }
                          })}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${localPaymentSettings?.[gateway]?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localPaymentSettings?.[gateway]?.enabled ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <span className="ml-3 text-xs font-bold text-[#29231F]">Enable {gateway}</span>
                    </label>
                  </div>
                  
                  {localPaymentSettings?.[gateway]?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#29231F] mb-1">Payment Number</label>
                        <input 
                          type="text" 
                          value={localPaymentSettings[gateway]?.number || ''}
                          onChange={(e) => setLocalPaymentSettings({
                            ...localPaymentSettings, 
                            [gateway]: { ...localPaymentSettings[gateway], number: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#29231F] mb-1">Account Type</label>
                        <select 
                          value={localPaymentSettings[gateway]?.accountType || 'Personal'}
                          onChange={(e) => setLocalPaymentSettings({
                            ...localPaymentSettings, 
                            [gateway]: { ...localPaymentSettings[gateway], accountType: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm"
                        >
                          <option value="Personal">Personal</option>
                          <option value="Merchant">Merchant</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#29231F] mb-1">Instructions (Shown to Customer)</label>
                        <textarea 
                          value={localPaymentSettings[gateway]?.instructions || ''}
                          onChange={(e) => setLocalPaymentSettings({
                            ...localPaymentSettings, 
                            [gateway]: { ...localPaymentSettings[gateway], instructions: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm h-20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="border border-[#E8DCC8] rounded-xl p-5 bg-[#F7F2E8]/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg text-[#29231F]">Cash on Delivery</h4>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localPaymentSettings?.cashOnDelivery?.enabled || false}
                        onChange={(e) => setLocalPaymentSettings({
                          ...localPaymentSettings, 
                          cashOnDelivery: { ...localPaymentSettings.cashOnDelivery, enabled: e.target.checked }
                        })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${localPaymentSettings?.cashOnDelivery?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localPaymentSettings?.cashOnDelivery?.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-bold text-[#29231F]">Enable COD</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Order Fulfillment & Courier Dispatch</h2>
                <p className="text-xs text-[#E8DCC8]/60">Manage order statuses, inspect product SKU details, and export reports to Excel/CSV.</p>
              </div>
              
              <button
                onClick={handleExportOrders}
                className="px-5 py-2.5 bg-[#C8A96B] hover:bg-[#b09154] text-[#29231F] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export ({getFilteredOrders().length}) to Excel / CSV</span>
              </button>
            </div>

            {/* Order Export & Filter Control Panel */}
            <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-3">
                <h3 className="font-serif font-bold text-base text-[#C8A96B] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#C8A96B]" />
                  <span>Order Search, Status Filters & Excel Export Controls</span>
                </h3>
                <span className="text-[11px] font-mono bg-[#29231F] text-[#E8DCC8] px-2.5 py-1 rounded-full border border-[#C8A96B]/20">
                  Total Orders: {orders.length} | Filtered: {getFilteredOrders().length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Search input */}
                <div>
                  <label className="block text-[11px] text-[#E8DCC8]/70 mb-1 font-medium">Search Orders or SKUs</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#E8DCC8]/50" />
                    <input
                      type="text"
                      placeholder="Order ID, Name, Phone, SKU..."
                      value={orderSearchTerm}
                      onChange={e => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white placeholder-[#E8DCC8]/40 focus:outline-none focus:border-[#C8A96B]"
                    />
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-[11px] text-[#E8DCC8]/70 mb-1 font-medium">Filter by Order Status</label>
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white font-medium focus:outline-none focus:border-[#C8A96B]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Payment Verification Pending">Payment Verification Pending</option>
                    <option value="Payment Verified">Payment Verified</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                {/* Payment Method filter */}
                <div>
                  <label className="block text-[11px] text-[#E8DCC8]/70 mb-1 font-medium">Filter by Payment Method</label>
                  <select
                    value={orderPaymentFilter}
                    onChange={e => setOrderPaymentFilter(e.target.value)}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white font-medium focus:outline-none focus:border-[#C8A96B]"
                  >
                    <option value="All">All Payment Methods</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Card / Online Payment">Card / Online Payment</option>
                  </select>
                </div>

                {/* Date Preset */}
                <div>
                  <label className="block text-[11px] text-[#E8DCC8]/70 mb-1 font-medium">Date Range Filter</label>
                  <select
                    value={orderDatePreset}
                    onChange={e => setOrderDatePreset(e.target.value as any)}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white font-medium focus:outline-none focus:border-[#C8A96B]"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Inputs if custom is selected */}
              {orderDatePreset === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F7F2E8]/10 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#E8DCC8]/70 mb-1">From Date</label>
                    <input
                      type="date"
                      value={orderFromDate}
                      onChange={e => setOrderFromDate(e.target.value)}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#E8DCC8]/70 mb-1">To Date</label>
                    <input
                      type="date"
                      value={orderToDate}
                      onChange={e => setOrderToDate(e.target.value)}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-xl text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Order List */}
              <div className="lg:col-span-7 bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold">Orders List ({getFilteredOrders().length})</h3>
                </div>
                
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {getFilteredOrders().length === 0 ? (
                    <div className="text-center py-12 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 text-[#E8DCC8]/60 space-y-2">
                      <Package className="w-8 h-8 mx-auto text-[#C8A96B]/40" />
                      <p>No orders found matching the filter criteria.</p>
                    </div>
                  ) : (
                    getFilteredOrders().map(o => (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedOrder?.id === o.id
                            ? 'border-[#C8A96B] bg-[#29231F] shadow-lg'
                            : 'border-[#F7F2E8]/10 bg-[#1F1A17] hover:border-[#6F7655]'
                        }`}
                      >
                        <div className="flex justify-between items-start text-xs mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono font-bold text-[#C8A96B] text-sm">{o.id}</span>
                              <span className="text-[10px] text-[#E8DCC8]/60 font-mono">
                                {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                              </span>
                            </div>
                            <p className="font-bold text-[#F7F2E8]">{o.customerName}</p>
                            <p className="text-[11px] text-[#E8DCC8]/60">{o.customerPhone} | {o.customerEmail}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-serif font-bold text-base text-[#F7F2E8] block">৳{o.total}</span>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                              o.status === 'Cancelled' ? 'bg-red-950 text-red-300' :
                              o.status === 'Delivered' ? 'bg-green-950 text-green-300' :
                              'bg-[#C8A96B]/20 text-[#C8A96B]'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        </div>

                        {/* Order SKUs Summary Chip */}
                        <div className="pt-2 border-t border-[#F7F2E8]/10 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#E8DCC8]/50 uppercase font-mono tracking-wider">SKUs:</span>
                          {(o.items || []).map((it, idx) => {
                            const skuVal = it.sku || (products.find(p => p.id === it.productId)?.sku) || 'ALH-GEN';
                            return (
                              <span key={idx} className="text-[10px] font-mono bg-[#29231F] text-[#C8A96B] border border-[#C8A96B]/30 px-1.5 py-0.5 rounded">
                                {skuVal} (x{it.quantity})
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Details Drawer */}
              <div className="lg:col-span-5 bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-6 text-xs sticky top-24 h-fit shadow-2xl">
                {selectedOrder ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-[#F7F2E8]/10 pb-3">
                      <div>
                        <span className="font-mono font-bold text-[#C8A96B] text-base block">{selectedOrder.id}</span>
                        <h3 className="font-serif font-bold text-lg text-white">{selectedOrder.customerName}</h3>
                        <p className="text-[10px] text-[#E8DCC8]/60 font-mono">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#6F7655] text-white rounded-lg font-bold text-xs shadow">
                        {selectedOrder.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[#E8DCC8]/80 bg-[#29231F] p-3 rounded-xl border border-[#F7F2E8]/10">
                      <p><strong className="text-white">Phone:</strong> {selectedOrder.customerPhone}</p>
                      <p><strong className="text-white">Email:</strong> {selectedOrder.customerEmail}</p>
                      <p><strong className="text-white">Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.district}</p>
                      <p><strong className="text-white">Payment Method:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                      {selectedOrder.notes && (
                        <p className="text-[#C8A96B] pt-1 border-t border-[#F7F2E8]/10"><strong className="text-white">Note:</strong> {selectedOrder.notes}</p>
                      )}
                    </div>

                    {/* Order Items with SKU prominence */}
                    <div className="border-t border-[#F7F2E8]/10 pt-3 space-y-2">
                      <h4 className="font-bold text-[#C8A96B] uppercase tracking-wider text-[11px] flex justify-between">
                        <span>Ordered Items & SKUs</span>
                        <span>({selectedOrder.items?.length || 0} Products)</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.items?.map((item, idx) => {
                          const itemSku = item.sku || (products.find(p => p.id === item.productId)?.sku) || 'ALH-GEN';
                          return (
                            <div key={idx} className="flex justify-between items-center bg-[#29231F] p-2.5 rounded-xl border border-[#F7F2E8]/10 gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image && (
                                  <img src={item.image} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-black/40 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate text-xs">{item.productName}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-mono font-bold bg-[#C8A96B]/20 text-[#C8A96B] px-1.5 py-0.5 rounded border border-[#C8A96B]/30">
                                      SKU: {itemSku}
                                    </span>
                                    {item.weight && <span className="text-[10px] text-[#E8DCC8]/60">({item.weight})</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs text-[#E8DCC8]/80 font-mono block">x{item.quantity} (৳{item.price}/ea)</span>
                                <span className="font-serif font-bold text-sm text-[#C8A96B]">৳{item.price * item.quantity}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-[#29231F] p-3 rounded-xl border border-[#F7F2E8]/10 space-y-1 text-xs mt-2">
                        <div className="flex justify-between text-[#E8DCC8]/70">
                          <span>Subtotal</span>
                          <span>৳{selectedOrder.subtotal}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount</span>
                            <span>-৳{selectedOrder.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[#E8DCC8]/70">
                          <span>Delivery Fee</span>
                          <span>৳{selectedOrder.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold font-serif text-sm pt-1 border-t border-[#F7F2E8]/10">
                          <span>Grand Total</span>
                          <span className="text-[#C8A96B]">৳{selectedOrder.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Changer */}
                    <div className="border-t border-[#F7F2E8]/10 pt-3 space-y-3">
                      <label className="block font-bold text-[#C8A96B] uppercase text-[10px] tracking-widest">Update Order Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Pending', 'Confirmed', 'Preparing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                            className={`py-2 px-2 rounded-lg font-bold text-[11px] transition-all ${
                              selectedOrder.status === st ? 'bg-[#C8A96B] text-[#29231F] shadow' : 'bg-[#29231F] text-[#E8DCC8] hover:bg-[#38312B]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-[#E8DCC8]/60 py-12">Select an order from the list on the left to view full item breakdown and SKU details.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERY & SHIPPING CHARGES */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold">Delivery Charges & Location Settings</h2>
              <p className="text-xs text-[#E8DCC8]/60">Configure delivery fees, free shipping thresholds, and regional courier rates.</p>
            </div>

            <form onSubmit={handleSaveDeliverySettings} className="space-y-6">
              {/* Global Free Delivery Rules */}
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Global Free Delivery Rules</h3>
                
                <div className="flex items-center justify-between p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10">
                  <div>
                    <label className="font-bold text-sm block">Enable Free Delivery Threshold</label>
                    <p className="text-xs text-[#E8DCC8]/60">Automatically offer free shipping when customer order subtotal reaches minimum amount.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localDeliverySettings.freeDeliveryEnabled}
                    onChange={(e) => setLocalDeliverySettings({ ...localDeliverySettings, freeDeliveryEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#6F7655]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Default Free Shipping Minimum Order Amount (BDT)</label>
                  <input
                    type="number"
                    value={localDeliverySettings.globalFreeDeliveryThreshold}
                    onChange={(e) => setLocalDeliverySettings({ ...localDeliverySettings, globalFreeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full sm:w-64 p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-serif font-bold text-[#F7F2E8]"
                  />
                </div>
              </div>

              {/* Delivery Zones Table */}
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Delivery Zones & Courier Fees</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newZone: DeliveryZone = {
                        id: `z-${Date.now()}`,
                        name: 'New Zone',
                        nameEn: 'New Zone',
                        nameBn: 'নতুন এলাকা',
                        standardFee: 100,
                        expressFee: 180,
                        freeDeliveryMinAmount: 1500,
                        estimatedTime: '48 Hours',
                        estimatedTimeEn: '48 Hours',
                        estimatedTimeBn: '৪৮ ঘণ্টা',
                        active: true
                      };
                      setLocalDeliverySettings({
                        ...localDeliverySettings,
                        zones: [...localDeliverySettings.zones, newZone]
                      });
                    }}
                    className="px-3 py-1.5 bg-[#6F7655] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Zone</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {localDeliverySettings.zones.map((zone, zIdx) => (
                    <div key={zone.id} className="p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-[#E8DCC8]/70 mb-1">Zone Name (English)</label>
                          <input
                            type="text"
                            value={zone.nameEn}
                            onChange={(e) => {
                              const updated = [...localDeliverySettings.zones];
                              updated[zIdx].nameEn = e.target.value;
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[#E8DCC8]/70 mb-1">Zone Name (বাংলা)</label>
                          <input
                            type="text"
                            value={zone.nameBn || ''}
                            onChange={(e) => {
                              const updated = [...localDeliverySettings.zones];
                              updated[zIdx].nameBn = e.target.value;
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-white"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={zone.active}
                              onChange={(e) => {
                                const updated = [...localDeliverySettings.zones];
                                updated[zIdx].active = e.target.checked;
                                setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                              }}
                              className="w-4 h-4 accent-[#6F7655]"
                            />
                            <span>Zone Active</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = localDeliverySettings.zones.filter((_, i) => i !== zIdx);
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 ml-auto"
                            title="Delete Zone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-[#E8DCC8]/70 mb-1">Standard Fee (৳)</label>
                          <input
                            type="number"
                            value={zone.standardFee}
                            onChange={(e) => {
                              const updated = [...localDeliverySettings.zones];
                              updated[zIdx].standardFee = Number(e.target.value);
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-white font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[#E8DCC8]/70 mb-1">Express Fee (৳)</label>
                          <input
                            type="number"
                            value={zone.expressFee}
                            onChange={(e) => {
                              const updated = [...localDeliverySettings.zones];
                              updated[zIdx].expressFee = Number(e.target.value);
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-white font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[#E8DCC8]/70 mb-1">Zone Free Min Amount (৳)</label>
                          <input
                            type="number"
                            value={zone.freeDeliveryMinAmount}
                            onChange={(e) => {
                              const updated = [...localDeliverySettings.zones];
                              updated[zIdx].freeDeliveryMinAmount = Number(e.target.value);
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[#E8DCC8]/70 mb-1">Est. Delivery Time</label>
                          <input
                            type="text"
                            value={zone.estimatedTimeEn}
                            onChange={(e) => {
                              const updated = [...localDeliverySettings.zones];
                              updated[zIdx].estimatedTimeEn = e.target.value;
                              setLocalDeliverySettings({ ...localDeliverySettings, zones: updated });
                            }}
                            className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#6F7655] hover:bg-[#A86445] font-bold text-white rounded-xl text-xs shadow-md"
              >
                Save Delivery Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold">Customer Management</h2>
            <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6">
              <div className="space-y-12">
                {customers.map(c => {
                  const customerOrders = orders.filter(o => o.customerEmail.toLowerCase() === c.email.toLowerCase());
                  
                  return (
                    <div key={c.id} className="bg-[#29231F] border border-[#F7F2E8]/10 rounded-xl overflow-hidden">
                      {/* Customer Header */}
                      <div className="p-5 flex flex-wrap justify-between items-center bg-[#1F1A17] border-b border-[#F7F2E8]/10 gap-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#F7F2E8] flex items-center gap-2">
                            {c.name}
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                              c.role === 'admin' || c.role === 'super_admin' ? 'bg-[#C8A96B] text-[#29231F]' : 'bg-[#6F7655] text-white'
                            }`}>
                              {c.role}
                            </span>
                          </h3>
                          <div className="flex gap-4 mt-2 text-xs text-[#E8DCC8]/70">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                            <span>Joined: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-[#E8DCC8]/50 uppercase tracking-widest font-mono block">Total Orders</span>
                          <span className="text-2xl font-bold text-[#C8A96B]">{customerOrders.length}</span>
                        </div>
                      </div>

                      {/* Order History */}
                      <div className="p-5">
                        {customerOrders.length === 0 ? (
                          <p className="text-xs text-[#E8DCC8]/50 italic text-center py-4">No order history available.</p>
                        ) : (
                          <div className="space-y-6">
                            {customerOrders.map(order => (
                              <div key={order.id} className="border border-[#F7F2E8]/10 rounded-lg overflow-hidden text-xs">
                                <div className="bg-[#1F1A17] p-3 flex flex-wrap justify-between items-center gap-4 border-b border-[#F7F2E8]/10">
                                  <div>
                                    <span className="font-bold text-[#C8A96B] text-sm">{order.id}</span>
                                    <span className="text-[#E8DCC8]/70 ml-3">{new Date(order.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="flex gap-3">
                                    <span className="px-2 py-1 bg-[#6F7655]/20 text-[#6F7655] rounded-md font-bold">Status: {order.status}</span>
                                    <span className="px-2 py-1 bg-[#C8A96B]/20 text-[#C8A96B] rounded-md font-bold">Payment: {order.paymentStatus} ({order.paymentMethod})</span>
                                    <span className="px-2 py-1 bg-[#29231F] text-white rounded-md font-bold font-serif text-sm">Total: ৳{order.total}</span>
                                  </div>
                                </div>
                                
                                <div className="p-3 bg-[#29231F]">
                                  <h4 className="text-[10px] uppercase text-[#E8DCC8]/60 mb-2 font-mono tracking-widest">Snapshot at time of purchase</h4>
                                  <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-4 bg-[#1F1A17] p-2 rounded-md">
                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-black/20 shrink-0">
                                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-white truncate">{item.productName}</p>
                                          <p className="text-[#E8DCC8]/60">Qty: {item.quantity} × ৳{item.price}</p>
                                        </div>
                                        <div className="text-right shrink-0 pr-2">
                                          <p className="font-bold text-[#C8A96B]">৳{item.price * item.quantity}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WEBSITE CMS */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold">Homepage Content & Media CMS</h2>
            <CmsAdminManager />
          </div>
        )}

        {/* TAB 7: MARKETING & COUPONS */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold">Coupons & Promo Codes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Coupon Form */}
              <form onSubmit={handleCreateCoupon} className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-4 text-xs">
                <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Create Discount Code</h3>
                <div>
                  <label className="block mb-1 font-semibold">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ALHAM10"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded uppercase text-[#F7F2E8] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded">
                  Activate Coupon
                </button>
              </form>

              {/* Existing Coupons List */}
              <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-3 text-xs">
                <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Active Promo Codes</h3>
                <div className="space-y-2">
                  {coupons.map(cp => (
                    <div key={cp.id} className="p-3 bg-[#29231F] rounded-xl flex justify-between items-center border border-[#F7F2E8]/10">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#C8A96B]">{cp.code}</span>
                        <p className="text-[10px] text-[#E8DCC8]/60">Min order: ৳{cp.minOrderAmount || 0}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#6F7655] text-white font-bold rounded text-[11px]">
                        {cp.discountValue}% OFF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: TRACKING & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="font-serif text-2xl font-bold">Meta Pixel & Marketing Analytics Tracking</h2>
              <p className="text-xs text-[#E8DCC8]/60">Configure Meta Pixel (Dataset: ALHAM), Google Tag Manager, GA4, TikTok Pixel, and custom conversion scripts.</p>
            </div>

            <form onSubmit={handleSaveTrackingSettings} className="space-y-6">
              {/* Meta Pixel Card */}
              <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-[#C8A96B]/20 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#C8A96B] flex items-center gap-2">
                      <span>Meta Pixel / Dataset (Facebook)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                        Dataset: {localTrackingSettings.metaPixel?.pixelId || 'ALHAM'}
                      </span>
                    </h3>
                    <p className="text-xs text-[#E8DCC8]/60 mt-0.5">Tracks PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase events automatically.</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <span>{localTrackingSettings.metaPixel?.enabled ? 'Active' : 'Disabled'}</span>
                    <input
                      type="checkbox"
                      checked={!!localTrackingSettings.metaPixel?.enabled}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        metaPixel: { ...localTrackingSettings.metaPixel, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 accent-[#6F7655]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#E8DCC8]/80 mb-1 font-bold">Meta Pixel ID / Dataset Name</label>
                    <input
                      type="text"
                      value={localTrackingSettings.metaPixel?.pixelId || 'ALHAM'}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        metaPixel: { ...localTrackingSettings.metaPixel, pixelId: e.target.value }
                      })}
                      placeholder="e.g. ALHAM or 1234567890"
                      className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-mono font-bold text-[#C8A96B]"
                    />
                  </div>

                  <div className="p-3 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 text-[11px] text-[#E8DCC8]/80 space-y-1">
                    <span className="font-bold text-[#6F7655] block">✓ Verified E-Commerce Event Flow:</span>
                    <p>• <strong>PageView:</strong> Fires on all page/route changes</p>
                    <p>• <strong>ViewContent:</strong> Fires when viewing product details</p>
                    <p>• <strong>AddToCart:</strong> Fires on product add actions</p>
                    <p>• <strong>InitiateCheckout:</strong> Fires on opening checkout</p>
                    <p>• <strong>Purchase:</strong> Fires on order creation with transaction ID & total</p>
                  </div>
                </div>
              </div>

              {/* Google Tag Manager & GA4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-2">
                    <h3 className="font-serif font-bold text-base text-[#F7F2E8]">Google Tag Manager (GTM)</h3>
                    <input
                      type="checkbox"
                      checked={!!localTrackingSettings.gtm?.enabled}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        gtm: { ...localTrackingSettings.gtm, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#6F7655]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#E8DCC8]/70 text-xs mb-1">Container ID</label>
                    <input
                      type="text"
                      value={localTrackingSettings.gtm?.containerId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        gtm: { ...localTrackingSettings.gtm, containerId: e.target.value }
                      })}
                      placeholder="e.g. GTM-WRRNCLCK"
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-2">
                    <h3 className="font-serif font-bold text-base text-[#F7F2E8]">Google Analytics 4 (GA4)</h3>
                    <input
                      type="checkbox"
                      checked={!!localTrackingSettings.ga4?.enabled}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        ga4: { ...localTrackingSettings.ga4, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#6F7655]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#E8DCC8]/70 text-xs mb-1">Measurement ID</label>
                    <input
                      type="text"
                      value={localTrackingSettings.ga4?.measurementId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        ga4: { ...localTrackingSettings.ga4, measurementId: e.target.value }
                      })}
                      placeholder="e.g. G-49NPC58FRP"
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* TikTok Pixel & Google Ads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-2">
                    <h3 className="font-serif font-bold text-base text-[#F7F2E8]">TikTok Pixel</h3>
                    <input
                      type="checkbox"
                      checked={!!localTrackingSettings.tikTokPixel?.enabled}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        tikTokPixel: { ...localTrackingSettings.tikTokPixel, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#6F7655]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#E8DCC8]/70 text-xs mb-1">Pixel ID</label>
                    <input
                      type="text"
                      value={localTrackingSettings.tikTokPixel?.pixelId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        tikTokPixel: { ...localTrackingSettings.tikTokPixel, pixelId: e.target.value }
                      })}
                      placeholder="TikTok Pixel ID"
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-2">
                    <h3 className="font-serif font-bold text-base text-[#F7F2E8]">Google Ads Conversion</h3>
                    <input
                      type="checkbox"
                      checked={!!localTrackingSettings.googleAds?.enabled}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings,
                        googleAds: { ...localTrackingSettings.googleAds, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#6F7655]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[#E8DCC8]/70 mb-1">Conversion ID</label>
                      <input
                        type="text"
                        value={localTrackingSettings.googleAds?.conversionId || ''}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings,
                          googleAds: { ...localTrackingSettings.googleAds, conversionId: e.target.value }
                        })}
                        placeholder="AW-XXXXX"
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[#E8DCC8]/70 mb-1">Conversion Label</label>
                      <input
                        type="text"
                        value={localTrackingSettings.googleAds?.conversionLabel || ''}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings,
                          googleAds: { ...localTrackingSettings.googleAds, conversionLabel: e.target.value }
                        })}
                        placeholder="Label"
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save Tracking & Pixel Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ADMIN PRODUCT VIEW MODAL (PRODUCT LIST -> PRODUCT VIEW) */}
      {adminViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl my-auto space-y-6 max-h-[92vh] overflow-y-auto text-left text-xs">
            
            <button
              onClick={() => setAdminViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#E8DCC8] hover:bg-[#29231F] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#C8A96B]/20 pb-4 pr-8">
              <div>
                <span className="text-[10px] font-mono text-[#C8A96B] uppercase tracking-widest block">
                  Product Details View (Admin)
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#F7F2E8]">
                  {adminViewProduct.name}
                </h2>
                {adminViewProduct.nameBn && (
                  <p className="text-sm text-[#E8DCC8]/70 font-semibold">{adminViewProduct.nameBn}</p>
                )}
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                adminViewProduct.stock > 0 ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-red-950 text-red-300'
              }`}>
                Stock: {adminViewProduct.stock}
              </span>
            </div>

            {/* Content Body Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Media Preview Column */}
              <div className="space-y-3">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#29231F] border border-[#C8A96B]/20">
                  <img
                    src={adminViewProduct.images?.[0] || '/src/assets/images/snickers_bar_cut_1784995506640.jpg'}
                    alt={adminViewProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {adminViewProduct.images && adminViewProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {adminViewProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="thumb"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded object-cover border border-[#F7F2E8]/20"
                      />
                    ))}
                  </div>
                )}

                {adminViewProduct.videoUrl && (
                  <div className="p-2 bg-[#29231F] rounded-lg border border-[#C8A96B]/30 flex items-center gap-2 text-[#C8A96B]">
                    <Play className="w-4 h-4 fill-current" />
                    <span className="font-bold">Product Video Attached</span>
                  </div>
                )}
              </div>

              {/* Data Specifications Column */}
              <div className="sm:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10">
                  <div>
                    <span className="text-[#E8DCC8]/60 block text-[10px]">Price (BDT)</span>
                    <span className="font-serif text-lg font-bold text-[#C8A96B]">৳{adminViewProduct.price}</span>
                  </div>
                  <div>
                    <span className="text-[#E8DCC8]/60 block text-[10px]">SKU Code</span>
                    <span className="font-mono text-sm font-bold text-white">{adminViewProduct.sku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#E8DCC8]/60 block text-[10px]">Category</span>
                    <span className="font-bold text-white">{adminViewProduct.category}</span>
                  </div>
                  <div>
                    <span className="text-[#E8DCC8]/60 block text-[10px]">Weight / Size</span>
                    <span className="font-bold text-white">{adminViewProduct.weight}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#C8A96B]">English Description & Story</h4>
                  <p className="text-[#E8DCC8]/80 leading-relaxed bg-[#29231F] p-3 rounded-lg">{adminViewProduct.description}</p>
                  {adminViewProduct.story && (
                    <p className="text-[#E8DCC8]/60 italic bg-[#29231F] p-3 rounded-lg">"{adminViewProduct.story}"</p>
                  )}
                </div>

                {adminViewProduct.descriptionBn && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#C8A96B]">বাংলা বিবরণী (Bangla Description)</h4>
                    <p className="text-[#E8DCC8]/80 leading-relaxed bg-[#29231F] p-3 rounded-lg">{adminViewProduct.descriptionBn}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Action Toolbar Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C8A96B]/20">
              <button
                onClick={() => setAdminViewProduct(null)}
                className="px-4 py-2 bg-[#29231F] text-[#E8DCC8] hover:text-white rounded-xl flex items-center gap-1.5 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prodToEdit = adminViewProduct;
                    setAdminViewProduct(null);
                    setEditingProduct(prodToEdit);
                    setFormLangTab('en');
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Product</span>
                </button>

                <button
                  onClick={() => {
                    const prodToDup = adminViewProduct;
                    setAdminViewProduct(null);
                    handleDuplicateProduct(prodToDup);
                  }}
                  className="px-4 py-2 bg-[#29231F] hover:bg-[#A86445] text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => {
                    const prodToDel = adminViewProduct;
                    setAdminViewProduct(null);
                    setProductToDelete(prodToDel);
                  }}
                  className="px-4 py-2 bg-red-950/80 hover:bg-red-800 text-red-200 font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Product</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1F1A17] border border-red-800/50 rounded-2xl max-w-md w-full p-6 space-y-5 text-left text-xs shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950 rounded-xl border border-red-800/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Delete Product Confirmation</h3>
                <p className="text-[11px] text-[#E8DCC8]/60">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-[#E8DCC8]/90 leading-relaxed bg-[#29231F] p-4 rounded-xl border border-[#F7F2E8]/10">
              Are you sure you want to delete <strong className="text-white font-bold">{productToDelete.name}</strong>? It will be permanently deleted from the database and immediately disappear from the store, collections, search results, and homepage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-[#29231F] hover:bg-[#F7F2E8]/10 text-[#E8DCC8] rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteProduct}
                className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILINGUAL PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative text-left text-xs space-y-5 max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#E8DCC8] hover:bg-[#29231F] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-[#C8A96B]/20 pb-3 pr-8">
              <h3 className="font-serif text-xl font-bold text-[#C8A96B]">
                {editingProduct.id ? `Edit Product: ${editingProduct.name}` : 'Add New Product (Bilingual)'}
              </h3>
            </div>

            {/* Form Language Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-[#F7F2E8]/10 pb-3">
              <button
                type="button"
                onClick={() => setFormLangTab('en')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  formLangTab === 'en' ? 'bg-[#6F7655] text-white shadow-md' : 'bg-[#29231F] text-[#E8DCC8]/70 hover:text-white'
                }`}
              >
                <span>🇬🇧 English Content</span>
              </button>

              <button
                type="button"
                onClick={() => setFormLangTab('bn')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  formLangTab === 'bn' ? 'bg-[#A86445] text-white shadow-md' : 'bg-[#29231F] text-[#E8DCC8]/70 hover:text-white'
                }`}
              >
                <span>🇧🇩 বাংলা (Bangla) Content</span>
              </button>

              <button
                type="button"
                onClick={() => setFormLangTab('media_settings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  formLangTab === 'media_settings' ? 'bg-[#C8A96B] text-[#29231F] shadow-md' : 'bg-[#29231F] text-[#E8DCC8]/70 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Media & Pricing Settings</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* ENGLISH TAB */}
              {formLangTab === 'en' && (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 font-semibold text-[#C8A96B]">Product Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8] font-semibold"
                      placeholder="e.g. Royal Snickers Date Bar"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#E8DCC8]">Subtitle / Tagline (English)</label>
                    <input
                      type="text"
                      value={editingProduct.subtitle || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      placeholder="e.g. Stuffed dates with roasted peanut crunch"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#E8DCC8]">Full Description (English)</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#E8DCC8]">Product Story (English)</label>
                    <textarea
                      rows={2}
                      value={editingProduct.story || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, story: e.target.value })}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Ingredients List (Comma separated)</label>
                      <input
                        type="text"
                        value={editingProduct.ingredients?.join(', ') || ''}
                        onChange={e => setEditingProduct({
                          ...editingProduct,
                          ingredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Allergens (Comma separated)</label>
                      <input
                        type="text"
                        value={editingProduct.allergens?.join(', ') || ''}
                        onChange={e => setEditingProduct({
                          ...editingProduct,
                          allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Weight / Size (English)</label>
                      <input
                        type="text"
                        value={editingProduct.weight || 'Box of 6 (250g)'}
                        onChange={e => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Shelf Life (English)</label>
                      <input
                        type="text"
                        value={editingProduct.shelfLife || '60 Days'}
                        onChange={e => setEditingProduct({ ...editingProduct, shelfLife: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Storage Instructions (English)</label>
                      <input
                        type="text"
                        value={editingProduct.storageInstructions || 'Cool dry place'}
                        onChange={e => setEditingProduct({ ...editingProduct, storageInstructions: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BANGLA TAB */}
              {formLangTab === 'bn' && (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 font-semibold text-[#A86445]">পণ্যের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={editingProduct.nameBn || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, nameBn: e.target.value })}
                      className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8] font-semibold"
                      placeholder="যেমন: রয়্যাল স্নিকার্স ডেট বার"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#E8DCC8]">ট্যাগলাইন / ছোট শিরোনাম (বাংলা)</label>
                    <input
                      type="text"
                      value={editingProduct.subtitleBn || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, subtitleBn: e.target.value })}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#E8DCC8]">সম্পূর্ণ বর্ণনা (বাংলা)</label>
                    <textarea
                      rows={3}
                      value={editingProduct.descriptionBn || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, descriptionBn: e.target.value })}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-[#E8DCC8]">পণ্যের গল্প (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={editingProduct.storyBn || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, storyBn: e.target.value })}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">উপাদানসমূহ (বাংলা কমা দিয়ে বিচ্ছেদ করুন)</label>
                      <input
                        type="text"
                        value={editingProduct.ingredientsBn?.join(', ') || ''}
                        onChange={e => setEditingProduct({
                          ...editingProduct,
                          ingredientsBn: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">এলার্জি নির্দেশ (বাংলা)</label>
                      <input
                        type="text"
                        value={editingProduct.allergensBn?.join(', ') || ''}
                        onChange={e => setEditingProduct({
                          ...editingProduct,
                          allergensBn: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">ওজন / সাইজ (বাংলা)</label>
                      <input
                        type="text"
                        value={editingProduct.weightBn || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, weightBn: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">মেয়াদকাল (বাংলা)</label>
                      <input
                        type="text"
                        value={editingProduct.shelfLifeBn || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, shelfLifeBn: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">সংরক্ষণ পদ্ধতি (বাংলা)</label>
                      <input
                        type="text"
                        value={editingProduct.storageInstructionsBn || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, storageInstructionsBn: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MEDIA & PRICING SETTINGS TAB */}
              {formLangTab === 'media_settings' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-[#C8A96B]">Price (BDT) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8] font-bold font-serif"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Original / Strikethrough Price (BDT)</label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.stock ?? 30}
                        onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">Category</label>
                      <select
                        value={editingProduct.category || 'Indulgent'}
                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                      >
                        <option value="Date Collection">Date Collection</option>
                        <option value="Indulgent">Indulgent</option>
                        <option value="Gift Boxes">Gift Boxes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold text-[#E8DCC8]">SKU Code</label>
                      <input
                        type="text"
                        value={editingProduct.sku || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8] font-mono"
                      />
                    </div>
                  </div>

                  {/* Multiple Product Images Manager */}
                  <div className="p-4 bg-[#29231F] rounded-xl border border-[#C8A96B]/30 space-y-3">
                    <h4 className="font-serif font-bold text-[#C8A96B] flex items-center justify-between">
                      <span>Product Gallery Images (Upload from Device)</span>
                      <span className="text-[10px] text-[#E8DCC8]/60 font-mono">
                        {editingProduct.images?.length || 0} Images Added
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editingProduct.images?.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="relative rounded-lg overflow-hidden bg-[#1F1A17] border border-[#F7F2E8]/20 group">
                          <img src={imgUrl} alt="Product" referrerPolicy="no-referrer" className="w-full h-24 object-cover" />
                          {imgIdx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#6F7655] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Main Image
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-1">
                            {imgIdx !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingProduct.images || [])];
                                  const [moved] = updated.splice(imgIdx, 1);
                                  updated.unshift(moved);
                                  setEditingProduct({ ...editingProduct, images: updated });
                                }}
                                className="px-2 py-0.5 bg-[#6F7655] text-white text-[10px] font-bold rounded"
                              >
                                Set Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingProduct.images?.filter((_, i) => i !== imgIdx);
                                setEditingProduct({ ...editingProduct, images: updated });
                              }}
                              className="px-2 py-0.5 bg-red-800 text-white text-[10px] font-bold rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <MediaPicker
                      label="Add Another Image from Device / Gallery"
                      value=""
                      category="Product"
                      mediaType="image"
                      onChange={url => {
                        if (url) {
                          setEditingProduct({
                            ...editingProduct,
                            images: [...(editingProduct.images || []), url]
                          });
                        }
                      }}
                    />
                  </div>

                  {/* Product Video Upload */}
                  <div className="p-4 bg-[#29231F] rounded-xl border border-[#C8A96B]/30 space-y-2">
                    <h4 className="font-serif font-bold text-[#C8A96B]">Product Video (Optional)</h4>
                    <MediaPicker
                      label="Upload Unboxing / Crafting Video"
                      value={editingProduct.videoUrl || ''}
                      category="Product"
                      mediaType="video"
                      helpText="Supported formats: MP4, WebM (Upload from laptop/mobile)"
                      onChange={url => setEditingProduct({ ...editingProduct, videoUrl: url })}
                    />
                  </div>

                  {/* Homepage Placement Settings */}
                  <div className="p-4 bg-[#29231F] rounded-xl border border-[#C8A96B]/30 space-y-3">
                    <h4 className="font-serif font-bold text-[#C8A96B]">Homepage Placement Settings</h4>
                    <p className="text-[11px] text-[#E8DCC8]/70">Choose explicit placement toggles for homepage sections:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer text-[#E8DCC8] bg-[#1F1A17] p-3 rounded-lg border border-[#F7F2E8]/10 hover:border-[#C8A96B]/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.showInHeroSpotlight ?? false}
                          onChange={e => setEditingProduct({ ...editingProduct, showInHeroSpotlight: e.target.checked })}
                          className="w-4 h-4 accent-[#6F7655] rounded"
                        />
                        <span className="font-medium">Show in Hero Spotlight (Top Banner)</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-[#E8DCC8] bg-[#1F1A17] p-3 rounded-lg border border-[#F7F2E8]/10 hover:border-[#C8A96B]/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.showInMindfulSection ?? false}
                          onChange={e => setEditingProduct({ ...editingProduct, showInMindfulSection: e.target.checked })}
                          className="w-4 h-4 accent-[#6F7655] rounded"
                        />
                        <span className="font-medium">Show in Mindful Indulgence (Middle Grid)</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-[#E8DCC8] bg-[#1F1A17] p-3 rounded-lg border border-[#F7F2E8]/10 hover:border-[#C8A96B]/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.showInSignatureSection ?? true}
                          onChange={e => setEditingProduct({ ...editingProduct, showInSignatureSection: e.target.checked })}
                          className="w-4 h-4 accent-[#6F7655] rounded"
                        />
                        <span className="font-medium">Show in Signature Collections (Main Grid)</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-[#E8DCC8] bg-[#1F1A17] p-3 rounded-lg border border-[#F7F2E8]/10 hover:border-[#C8A96B]/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={editingProduct.isAllProducts ?? true}
                          onChange={e => setEditingProduct({ ...editingProduct, isAllProducts: e.target.checked })}
                          className="w-4 h-4 accent-[#6F7655] rounded"
                        />
                        <span className="font-medium">Show in All Products Catalog</span>
                      </label>
                    </div>
                  </div>

                  {/* Related Products Settings */}
                  <div className="p-4 bg-[#29231F] rounded-xl border border-[#C8A96B]/30 space-y-3">
                    <h4 className="font-serif font-bold text-[#C8A96B]">Related Products Recommendations</h4>
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="relatedMode"
                          checked={editingProduct.relatedProductsMode !== 'manual'}
                          onChange={() => setEditingProduct({ ...editingProduct, relatedProductsMode: 'auto' })}
                          className="accent-[#6F7655]"
                        />
                        <span>Automatic (Same category/collection)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="relatedMode"
                          checked={editingProduct.relatedProductsMode === 'manual'}
                          onChange={() => setEditingProduct({ ...editingProduct, relatedProductsMode: 'manual' })}
                          className="accent-[#6F7655]"
                        />
                        <span>Manual Selection</span>
                      </label>
                    </div>

                    {editingProduct.relatedProductsMode === 'manual' && (
                      <div className="space-y-2 pt-2 border-t border-[#F7F2E8]/10 max-h-40 overflow-y-auto">
                        <span className="text-[11px] text-[#E8DCC8]/70 block">Select specific products to recommend:</span>
                        {products.filter(p => p.id !== editingProduct.id).map(p => {
                          const isChecked = editingProduct.relatedProductIds?.includes(p.id);
                          return (
                            <label key={p.id} className="flex items-center gap-2 p-1.5 bg-[#1F1A17] rounded cursor-pointer hover:bg-[#29231F]">
                              <input
                                type="checkbox"
                                checked={!!isChecked}
                                onChange={e => {
                                  const currentIds = editingProduct.relatedProductIds || [];
                                  const updatedIds = e.target.checked
                                    ? [...currentIds, p.id]
                                    : currentIds.filter(id => id !== p.id);
                                  setEditingProduct({ ...editingProduct, relatedProductIds: updatedIds });
                                }}
                                className="accent-[#6F7655]"
                              />
                              <span className="font-semibold text-white">{p.name}</span>
                              <span className="text-[10px] text-[#C8A96B] font-serif">৳{p.price}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#F7F2E8]/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-[#29231F] text-[#E8DCC8] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#6F7655] hover:bg-[#A86445] font-bold text-white rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
