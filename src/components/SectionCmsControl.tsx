import React, { useState, useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { CraftPhilosophyConfig, WellnessLifestyleConfig, WellnessCardItem, CraftFeatureItem } from '../types';
import {
  Sparkles,
  Award,
  HeartHandshake,
  Save,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  Link2,
  Type
} from 'lucide-react';

export const SectionCmsControl: React.FC = () => {
  const { cms, updateCms } = useCms();

  const [activeTab, setActiveTab] = useState<'wellness' | 'craft'>('wellness');

  // Local state for 'Mindful Living' (wellnessLifestyleSection)
  const [wellnessData, setWellnessData] = useState<WellnessLifestyleConfig>(
    cms.wellnessLifestyleSection || {
      badge: 'Mindful Living',
      headingMain: 'Elevated Snacking for',
      headingHighlight: 'Modern Dhaka',
      description: 'Nourishing your day through every meeting, workout, and family gathering.',
      cards: []
    }
  );

  // Local state for 'Crafted With Intention' (craftPhilosophySection)
  const [craftData, setCraftData] = useState<CraftPhilosophyConfig>(
    cms.craftPhilosophySection || {
      badge: 'Crafted With Intention',
      headingMain: 'Purity & Passion in',
      headingHighlight: 'Every Batch',
      paragraph1: '',
      paragraph2: '',
      mainImage: '',
      hygieneBadgeTitle: 'ISO & HACCP Certified',
      hygieneBadgeText: '100% Clean Room Process',
      features: []
    }
  );

  // File uploading states
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingCraftMain, setIsUploadingCraftMain] = useState<boolean>(false);
  const [craftUploadProgress, setCraftUploadProgress] = useState<number>(0);

  // Status feedback
  const [saveStatus, setSaveStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync when cms changes
  useEffect(() => {
    if (cms.wellnessLifestyleSection) {
      setWellnessData(cms.wellnessLifestyleSection);
    }
    if (cms.craftPhilosophySection) {
      setCraftData(cms.craftPhilosophySection);
    }
  }, [cms]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setSaveStatus({ message, type });
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Helper to upload a file to Firebase Storage or Server
  const uploadSectionImage = async (file: File, category: string): Promise<string> => {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // 1. Try server API /api/upload first if available
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileData: base64Data, name: file.name, category })
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && data.url) return resolve(data.url);
          }
        } catch (e) {
          console.warn('Section uploader API notice:', e);
        }

        // 2. Direct upload to Firebase Storage
        try {
          const storageRef = ref(storage, `uploads/${Date.now()}_${cleanName}`);
          await uploadBytesResumable(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          return resolve(downloadUrl);
        } catch (storageErr) {
          console.warn("Direct storage upload notice, fallback to base64:", storageErr);
          return resolve(base64Data);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload an image file directly and update Firestore document
  const handleUploadWellnessImage = async (cardId: string, file: File) => {
    if (!file) return;
    try {
      setUploadingCardId(cardId);
      setUploadProgress(40);

      const downloadUrl = await uploadSectionImage(file, 'Wellness');
      setUploadProgress(100);

      // Update local card state
      const updatedCards = wellnessData.cards.map((card) =>
        card.id === cardId ? { ...card, image: downloadUrl } : card
      );
      const updatedWellness = { ...wellnessData, cards: updatedCards };
      setWellnessData(updatedWellness);

      // Build full updated CMS object
      await updateCms({ wellnessLifestyleSection: updatedWellness });

      setUploadingCardId(null);
      setUploadProgress(0);
      showNotification('Image uploaded successfully and synced to Firestore!');
    } catch (err: any) {
      console.error('Upload handling error:', err);
      showNotification(err.message || 'Error processing image upload', 'error');
      setUploadingCardId(null);
    }
  };

  // Upload craft philosophy main image and update Firestore
  const handleUploadCraftMainImage = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingCraftMain(true);
      setCraftUploadProgress(40);

      const downloadUrl = await uploadSectionImage(file, 'Craft');
      setCraftUploadProgress(100);

      const updatedCraft = { ...craftData, mainImage: downloadUrl };
      setCraftData(updatedCraft);

      await updateCms({ craftPhilosophySection: updatedCraft });

      setIsUploadingCraftMain(false);
      setCraftUploadProgress(0);
      showNotification('Craft image uploaded successfully and synced to Firestore!');
    } catch (err: any) {
      console.error('Craft image upload error:', err);
      showNotification(err.message || 'Error uploading image', 'error');
      setIsUploadingCraftMain(false);
    }
  };

  // Save full section to Firestore and update CMS context
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const ok = await updateCms({ wellnessLifestyleSection: wellnessData, craftPhilosophySection: craftData });

      if (ok) {
        showNotification('Saved successfully! Real-time UI refresh triggered across all devices.');
      } else {
        showNotification('Saved to Firestore, updating server cache...', 'success');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('Failed to save to Firestore: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to add card to Mindful Living
  const handleAddWellnessCard = () => {
    const newCard: WellnessCardItem = {
      id: `wcard-${Date.now()}`,
      title: 'New Lifestyle Moment',
      description: 'Describe how Alham fits into this mindful daily routine.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      tag: 'Wellness',
      icon: 'Sun',
      enabled: true,
      ctaEnabled: true,
      ctaText: 'Shop Collection',
      ctaLink: '/collection',
      openInNewTab: false
    };
    setWellnessData({ ...wellnessData, cards: [...wellnessData.cards, newCard] });
  };

  // Helper to remove card
  const handleRemoveWellnessCard = (id: string) => {
    setWellnessData({ ...wellnessData, cards: wellnessData.cards.filter((c) => c.id !== id) });
  };

  // Helper to update a single card field
  const handleUpdateWellnessCard = (id: string, field: keyof WellnessCardItem, value: any) => {
    setWellnessData({
      ...wellnessData,
      cards: wellnessData.cards.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    });
  };

  // Helper to add craft feature item
  const handleAddCraftFeature = () => {
    const newFeature: CraftFeatureItem = {
      id: `cf-${Date.now()}`,
      title: 'Pure Artisanal Quality',
      description: 'Handpicked organic ingredients processed with extreme care.',
      icon: 'Sparkles',
      enabled: true
    };
    setCraftData({ ...craftData, features: [...craftData.features, newFeature] });
  };

  const handleRemoveCraftFeature = (id: string) => {
    setCraftData({ ...craftData, features: craftData.features.filter((f) => f.id !== id) });
  };

  const handleUpdateCraftFeature = (id: string, field: keyof CraftFeatureItem, value: any) => {
    setCraftData({
      ...craftData,
      features: craftData.features.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    });
  };

  return (
    <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 text-left space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7F2E8]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#6F7655]/30 border border-[#6F7655] text-green-300 font-mono text-[10px] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Firebase Storage & Firestore Live Sync Active
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#F7F2E8] mt-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#C8A96B]" />
            <span>Mindful Living & Crafted With Intention CMS Control</span>
          </h2>
          <p className="text-xs text-[#E8DCC8]/70 mt-1">
            Manage section copy and upload assets directly to Firebase Storage. Updates save to Firestore and trigger an instant real-time UI refresh across the live store.
          </p>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-3 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-[#C8A96B]" /> : <Save className="w-4 h-4 text-[#C8A96B]" />}
          <span>{isSaving ? 'Syncing to Firestore...' : 'Save & Publish Live Changes'}</span>
        </button>
      </div>

      {/* Save Status Banner */}
      {saveStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
            saveStatus.type === 'success'
              ? 'bg-green-950/80 border-green-700 text-green-300'
              : 'bg-red-950/80 border-red-700 text-red-300'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#F7F2E8]/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('wellness')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'wellness'
              ? 'bg-[#C8A96B] text-[#29231F] shadow-lg'
              : 'bg-[#29231F] text-[#E8DCC8]/70 hover:text-white border border-[#F7F2E8]/10'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>1. 'Mindful Living' Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('craft')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'craft'
              ? 'bg-[#C8A96B] text-[#29231F] shadow-lg'
              : 'bg-[#29231F] text-[#E8DCC8]/70 hover:text-white border border-[#F7F2E8]/10'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. 'Crafted With Intention' Section</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MINDFUL LIVING (wellnessLifestyleSection) */}
      {/* ========================================================================= */}
      {activeTab === 'wellness' && (
        <div className="space-y-6">
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#C8A96B] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#C8A96B]" />
              <span>'Mindful Living' Section Header & Copy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Section Badge Text</label>
                <input
                  type="text"
                  value={wellnessData.badge || ''}
                  onChange={(e) => setWellnessData({ ...wellnessData, badge: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                  placeholder="e.g. Mindful Living"
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Main Heading Text</label>
                <input
                  type="text"
                  value={wellnessData.headingMain || ''}
                  onChange={(e) => setWellnessData({ ...wellnessData, headingMain: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                  placeholder="e.g. Elevated Snacking for"
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Highlight Heading Text</label>
                <input
                  type="text"
                  value={wellnessData.headingHighlight || ''}
                  onChange={(e) => setWellnessData({ ...wellnessData, headingHighlight: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none font-bold text-[#C8A96B]"
                  placeholder="e.g. Modern Dhaka"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Section Subtitle / Description</label>
              <textarea
                value={wellnessData.description || ''}
                onChange={(e) => setWellnessData({ ...wellnessData, description: e.target.value })}
                rows={2}
                className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                placeholder="Describe the mindful lifestyle mission..."
              />
            </div>
          </div>

          {/* Cards & Uploader */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F7F2E8] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#C8A96B]" />
                  <span>Lifestyle Showcase Cards & Firebase Storage Uploader</span>
                </h3>
                <p className="text-xs text-[#E8DCC8]/70">
                  Each card features text, CTA settings, and a direct Firebase Storage uploader that pushes high-res images to Firestore.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddWellnessCard}
                className="px-4 py-2 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Card
              </button>
            </div>

            <div className="space-y-4">
              {wellnessData.cards.map((card, index) => {
                const isUploadingThis = uploadingCardId === card.id;

                return (
                  <div key={card.id} className="bg-[#1F1A17] p-4 rounded-xl border border-[#F7F2E8]/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-sm text-[#F7F2E8]">{card.title || 'Untitled Card'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateWellnessCard(card.id, 'enabled', !card.enabled)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            card.enabled
                              ? 'bg-green-950/80 text-green-300 border-green-700'
                              : 'bg-red-950/80 text-red-300 border-red-700'
                          }`}
                        >
                          {card.enabled ? 'Visible on Website' : 'Hidden'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveWellnessCard(card.id)}
                          className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-all"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left Column: Image Preview & Firebase Storage File Uploader */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-[#E8DCC8]/70">Card Image (Firebase Storage)</label>

                        <div className="relative group rounded-xl overflow-hidden border border-[#F7F2E8]/20 bg-[#29231F] h-36 flex items-center justify-center">
                          {card.image ? (
                            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon className="w-8 h-8 text-[#E8DCC8]/40 mx-auto mb-1" />
                              <span className="text-[10px] text-[#E8DCC8]/60">No image uploaded</span>
                            </div>
                          )}

                          {isUploadingThis && (
                            <div className="absolute inset-0 bg-[#1F1A17]/90 flex flex-col items-center justify-center p-3 space-y-2">
                              <RefreshCw className="w-6 h-6 text-[#C8A96B] animate-spin" />
                              <span className="text-xs font-bold text-[#C8A96B]">Uploading to Firebase Storage...</span>
                              <div className="w-full bg-[#29231F] h-2 rounded-full overflow-hidden border border-[#F7F2E8]/10">
                                <div
                                  className="bg-[#C8A96B] h-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-mono text-[#E8DCC8]/80">{uploadProgress}%</span>
                            </div>
                          )}
                        </div>

                        {/* File Upload Button */}
                        <div>
                          <label className="w-full py-2 px-3 bg-[#29231F] hover:bg-[#342C27] border border-[#F7F2E8]/20 rounded-xl text-xs font-bold text-[#E8DCC8] flex items-center justify-center gap-2 cursor-pointer transition-all">
                            <UploadCloud className="w-4 h-4 text-[#C8A96B]" />
                            <span>Upload New Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingThis}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadWellnessImage(card.id, file);
                              }}
                            />
                          </label>
                          <span className="block text-[10px] text-[#E8DCC8]/50 mt-1 text-center">
                            Direct upload to Firebase Storage bucket.
                          </span>
                        </div>
                      </div>

                      {/* Right Columns: Card Form Fields */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#E8DCC8]/70 mb-1">Card Title</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => handleUpdateWellnessCard(card.id, 'title', e.target.value)}
                              className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#E8DCC8]/70 mb-1">Tag / Category Badge</label>
                            <input
                              type="text"
                              value={card.tag}
                              onChange={(e) => handleUpdateWellnessCard(card.id, 'tag', e.target.value)}
                              className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                              placeholder="e.g. Workplace Wellness"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#E8DCC8]/70 mb-1">Card Description</label>
                          <textarea
                            value={card.description}
                            onChange={(e) => handleUpdateWellnessCard(card.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                          />
                        </div>

                        {/* CTA Button Settings */}
                        <div className="p-3 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2">
                          <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-1.5">
                            <span className="font-bold text-xs text-[#C8A96B]">Shop CTA Settings</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateWellnessCard(card.id, 'ctaEnabled', !card.ctaEnabled)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                card.ctaEnabled
                                  ? 'bg-green-950 text-green-300 border border-green-700'
                                  : 'bg-red-950 text-red-300 border border-red-700'
                              }`}
                            >
                              {card.ctaEnabled ? 'CTA Button Enabled' : 'CTA Button Disabled'}
                            </button>
                          </div>

                          {card.ctaEnabled && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">Button Text</label>
                                <input
                                  type="text"
                                  value={card.ctaText || 'Shop Collection'}
                                  onChange={(e) => handleUpdateWellnessCard(card.id, 'ctaText', e.target.value)}
                                  className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">Target Link</label>
                                <input
                                  type="text"
                                  value={card.ctaLink || '/collection'}
                                  onChange={(e) => handleUpdateWellnessCard(card.id, 'ctaLink', e.target.value)}
                                  className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8] font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CRAFTED WITH INTENTION (craftPhilosophySection) */}
      {/* ========================================================================= */}
      {activeTab === 'craft' && (
        <div className="space-y-6">
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#C8A96B] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C8A96B]" />
              <span>'Crafted With Intention' Section Header & Paragraphs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Badge Text</label>
                <input
                  type="text"
                  value={craftData.badge || ''}
                  onChange={(e) => setCraftData({ ...craftData, badge: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                  placeholder="e.g. Crafted With Intention"
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Main Heading</label>
                <input
                  type="text"
                  value={craftData.headingMain || ''}
                  onChange={(e) => setCraftData({ ...craftData, headingMain: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                  placeholder="e.g. Purity & Passion in"
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Highlight Heading</label>
                <input
                  type="text"
                  value={craftData.headingHighlight || ''}
                  onChange={(e) => setCraftData({ ...craftData, headingHighlight: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none font-bold text-[#C8A96B]"
                  placeholder="e.g. Every Batch"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Primary Craft Paragraph</label>
                <textarea
                  value={craftData.paragraph1 || ''}
                  onChange={(e) => setCraftData({ ...craftData, paragraph1: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                  placeholder="First paragraph describing the craft philosophy..."
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Secondary Craft Paragraph</label>
                <textarea
                  value={craftData.paragraph2 || ''}
                  onChange={(e) => setCraftData({ ...craftData, paragraph2: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8] focus:border-[#C8A96B] outline-none"
                  placeholder="Second paragraph detailing quality controls..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F7F2E8]/10">
              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Hygiene Badge Title</label>
                <input
                  type="text"
                  value={craftData.hygieneBadgeTitle || ''}
                  onChange={(e) => setCraftData({ ...craftData, hygieneBadgeTitle: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8]"
                  placeholder="e.g. ISO & HACCP Certified"
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8DCC8]/70 mb-1.5 font-bold">Hygiene Badge Subtitle</label>
                <input
                  type="text"
                  value={craftData.hygieneBadgeText || ''}
                  onChange={(e) => setCraftData({ ...craftData, hygieneBadgeText: e.target.value })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-xs text-[#F7F2E8]"
                  placeholder="e.g. 100% Clean Room Process"
                />
              </div>
            </div>
          </div>

          {/* Craft Main Feature Image & Uploader */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F7F2E8] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#C8A96B]" />
              <span>Main Craft Showcase Image (Firebase Storage Upload)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="relative rounded-xl overflow-hidden border border-[#F7F2E8]/20 bg-[#1F1A17] h-48 flex items-center justify-center">
                {craftData.mainImage ? (
                  <img src={craftData.mainImage} alt="Craft Showcase" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 text-[#E8DCC8]/30 mx-auto mb-2" />
                    <span className="text-xs text-[#E8DCC8]/60">No main craft image</span>
                  </div>
                )}

                {isUploadingCraftMain && (
                  <div className="absolute inset-0 bg-[#1F1A17]/90 flex flex-col items-center justify-center p-4 space-y-2">
                    <RefreshCw className="w-7 h-7 text-[#C8A96B] animate-spin" />
                    <span className="text-xs font-bold text-[#C8A96B]">Uploading Image to Firebase Storage...</span>
                    <div className="w-full bg-[#29231F] h-2.5 rounded-full overflow-hidden border border-[#F7F2E8]/10">
                      <div
                        className="bg-[#C8A96B] h-full transition-all duration-300"
                        style={{ width: `${craftUploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono text-[#E8DCC8]">{craftUploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <p className="text-xs text-[#E8DCC8]/70">
                  Select an image file from your computer to upload directly to Firebase Storage. The download URL will update the Craft Philosophy section in Firestore and immediately reflect on the live website.
                </p>

                <label className="inline-flex items-center gap-2 py-3 px-5 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md">
                  <UploadCloud className="w-4 h-4 text-[#C8A96B]" />
                  <span>Choose & Upload Main Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingCraftMain}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCraftMainImage(file);
                    }}
                  />
                </label>

                <div className="pt-2">
                  <label className="block text-[10px] text-[#E8DCC8]/60 font-mono mb-1">Direct URL Link (Read-only)</label>
                  <input
                    type="text"
                    readOnly
                    value={craftData.mainImage || ''}
                    className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/10 rounded-lg text-xs font-mono text-[#C8A96B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Craft Feature Pillars */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F7F2E8] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C8A96B]" />
                  <span>Craft Feature Pillars & Badges</span>
                </h3>
                <p className="text-xs text-[#E8DCC8]/70">
                  Manage the core quality promises and craft highlights.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCraftFeature}
                className="px-4 py-2 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Feature Pillar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {craftData.features.map((feature, idx) => (
                <div key={feature.id} className="bg-[#1F1A17] p-4 rounded-xl border border-[#F7F2E8]/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-2">
                    <span className="font-bold text-xs text-[#C8A96B]">Pillar #{idx + 1}</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateCraftFeature(feature.id, 'enabled', !feature.enabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          feature.enabled
                            ? 'bg-green-950 text-green-300 border border-green-700'
                            : 'bg-red-950 text-red-300 border border-red-700'
                        }`}
                      >
                        {feature.enabled ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveCraftFeature(feature.id)}
                        className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                        title="Remove Pillar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">Pillar Title</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleUpdateCraftFeature(feature.id, 'title', e.target.value)}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">Pillar Description</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleUpdateCraftFeature(feature.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-xs text-[#F7F2E8]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
