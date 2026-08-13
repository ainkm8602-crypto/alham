import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { MediaPicker } from './MediaPicker';
import { SectionCmsControl } from './SectionCmsControl';

import {
  Settings,
  Layout,
  Sparkles,
  Award,
  Clock,
  HeartHandshake,
  FileText,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Edit,
  ExternalLink,
  MessageSquare,
  Leaf,
  AlertTriangle,
  Globe,
  Palette,
  Eye,
  Link2,
  UploadCloud,
  Check,
  Type,
  Share2,
  MessageCircle,
  Smartphone
} from 'lucide-react';

export const CmsAdminManager: React.FC = () => {
  const { cms, updateCms, ingredients, setIngredients, articles, setArticles, reviews, setReviews, mediaLibrary, setMediaLibrary, deleteIngredient, refreshCms } = useCms();

  const [activeSection, setActiveSection] = useState<
    'branding' | 'announcement' | 'settings' | 'navbar' | 'hero' | 'craft' | 'process' | 'wellness' | 'footer' | 'ingredients' | 'articles' | 'reviews' | 'media' | 'homepage'
  >('branding');

  const [formData, setFormData] = useState<any>(cms);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [announcementPreviewLang, setAnnouncementPreviewLang] = useState<'en' | 'bn'>('en');

  // Synchronize local form data when cms changes
  React.useEffect(() => {
    setFormData(cms);
  }, [cms]);

  const handleSaveCms = async (updatedData?: any) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const dataToSave = updatedData || formData;
      const ok = await updateCms(dataToSave);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error('Failed to update CMS configuration');
        alert('Failed to save CMS configuration. Please try again.');
      }
    } catch (err: any) {
      console.error('Error saving CMS configuration:', err);
      alert('Error saving CMS configuration: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Ingredient modal / inline form state
  const [editingIngredient, setEditingIngredient] = useState<any | null>(null);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [isSavingIngredient, setIsSavingIngredient] = useState<boolean>(false);
  // Article modal / inline form state
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  // Review modal / inline form state
  const [editingReview, setEditingReview] = useState<any | null>(null);

  // New Media Item URL input
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<'product' | 'ingredient' | 'hero' | 'lifestyle' | 'journal'>('product');

  const handleAddMedia = () => {
    if (!newMediaUrl) return;
    const item = {
      id: `m-${Date.now()}`,
      name: newMediaName || 'Untitled Media',
      url: newMediaUrl,
      category: newMediaCategory,
      uploadedAt: new Date().toISOString()
    };
    setMediaLibrary([item, ...mediaLibrary]);
    setNewMediaName('');
    setNewMediaUrl('');
  };

  const renderSaveSectionButton = (sectionName: string) => (
    <div className="pt-6 border-t border-[#F7F2E8]/10 flex flex-wrap items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-2">
        {saveSuccess && (
          <span className="text-xs font-bold text-green-400 flex items-center gap-1.5 bg-green-950/80 px-3 py-1.5 rounded-xl border border-green-700">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Live Website Updated Successfully!
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => handleSaveCms()}
        disabled={isSaving}
        className="px-6 py-3 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ml-auto"
      >
        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#C8A96B]" />}
        <span>{isSaving ? `Saving ${sectionName}...` : `Save ${sectionName} Changes`}</span>
      </button>
    </div>
  );

  return (
    <div className="bg-[#1F1A17] border border-[#C8A96B]/20 rounded-2xl p-6 text-left space-y-6">
      
      {/* CMS Header & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7F2E8]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F7F2E8] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#C8A96B]" />
            <span>Complete Website CMS Manager</span>
          </h2>
          <p className="text-xs text-[#E8DCC8]/70">
            Dynamically edit, update, reorder, and manage every visible element across the entire Alham storefront without code changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-green-400 flex items-center gap-1 bg-green-950/60 px-3 py-1.5 rounded-lg border border-green-800">
              <CheckCircle2 className="w-4 h-4" /> Live Website Updated!
            </span>
          )}
          <button
            onClick={() => handleSaveCms()}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#6F7655] hover:bg-[#A86445] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All CMS Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-medium border-b border-[#F7F2E8]/10 pb-4">
        {[
          { id: 'branding', label: '1. Header Logo & Branding', icon: ImageIcon },
          { id: 'announcement', label: '2. Top Announcement Bar', icon: Globe },
          { id: 'navbar', label: '3. Navigation Menu', icon: Layout },
          { id: 'settings', label: '4. Global Site Settings', icon: Settings },
          { id: 'hero', label: '5. Hero Section', icon: Sparkles },
          { id: 'craft', label: '6. Craft Philosophy', icon: Award },
          { id: 'process', label: '7. Process Workflow', icon: Clock },
          { id: 'wellness', label: '8. Wellness & Lifestyle', icon: HeartHandshake },
          { id: 'footer', label: '9. Footer, Social & WhatsApp Links', icon: Share2 },
          { id: 'homepage', label: '10. Homepage Config', icon: Layout },
          { id: 'ingredients', label: '11. Ingredients Sourcing', icon: Leaf },
          { id: 'articles', label: '12. Journal & Articles', icon: FileText },
          { id: 'reviews', label: '13. Community Reviews', icon: MessageSquare },
          { id: 'media', label: '14. Media Library', icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive ? 'bg-[#C8A96B] text-[#29231F] font-bold shadow' : 'bg-[#29231F] text-[#E8DCC8]/70 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== 1. HEADER LOGO & BRANDING MANAGEMENT ==================== */}
      {activeSection === 'branding' && (
        <div className="space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F7F2E8]/10 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#C8A96B] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#C8A96B]" />
                <span>Header Logo & Brand Identity Management</span>
              </h3>
              <p className="text-xs text-[#E8DCC8]/70 mt-1">
                Upload, replace, and preview your website logo. Changes update the header logo dynamically on desktop and mobile.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#6F7655]/30 border border-[#6F7655] text-green-300 font-mono text-[11px] font-bold self-start sm:self-auto">
              Live Dynamic Logo Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Configuration Controls */}
            <div className="space-y-5 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10">
              <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                <Type className="w-4 h-4 text-[#C8A96B]" />
                <span>1. Logo Display Mode</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentUrl = formData.siteSettings?.logoImageUrl || formData.settings?.logoImage || '';
                    setFormData({
                      ...formData,
                      siteSettings: {
                        ...formData.siteSettings,
                        logoType: 'image',
                        logoImageUrl: currentUrl
                      }
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    (formData.siteSettings?.logoType || 'image') === 'image'
                      ? 'bg-[#6F7655]/40 border-[#C8A96B] text-white'
                      : 'bg-[#1F1A17] border-[#F7F2E8]/10 text-[#E8DCC8]/70 hover:border-[#F7F2E8]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F7F2E8]">Image Logo</span>
                    {(formData.siteSettings?.logoType || 'image') === 'image' && (
                      <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#E8DCC8]/70">Display uploaded PNG, SVG, WEBP, or JPG image logo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      siteSettings: {
                        ...formData.siteSettings,
                        logoType: 'text'
                      }
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    formData.siteSettings?.logoType === 'text'
                      ? 'bg-[#6F7655]/40 border-[#C8A96B] text-white'
                      : 'bg-[#1F1A17] border-[#F7F2E8]/10 text-[#E8DCC8]/70 hover:border-[#F7F2E8]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F7F2E8]">Text Logo</span>
                    {formData.siteSettings?.logoType === 'text' && (
                      <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#E8DCC8]/70">Display stylized brand name in serif display font</span>
                </button>
              </div>

              <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 pt-2 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#C8A96B]" />
                <span>2. Upload / Replace Logo Asset</span>
              </h4>

              <div>
                <MediaPicker
                  label="Upload Logo File from Device or Library"
                  value={formData.siteSettings?.logoImageUrl || formData.settings?.logoImage || ''}
                  category="Logo"
                  mediaType="image"
                  helpText="Supported formats: PNG, JPG, WebP, SVG. Recommended: Transparent PNG or SVG vector."
                  onChange={(url: string) => {
                    setFormData({
                      ...formData,
                      siteSettings: {
                        ...formData.siteSettings,
                        logoImageUrl: url,
                        logoType: url ? 'image' : (formData.siteSettings?.logoType || 'text')
                      },
                      settings: {
                        ...formData.settings,
                        logoImage: url
                      }
                    });
                  }}
                />
              </div>

              {(formData.siteSettings?.logoImageUrl || formData.settings?.logoImage) && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-green-400 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5" /> Logo asset loaded
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        siteSettings: {
                          ...formData.siteSettings,
                          logoImageUrl: '',
                          logoType: 'text'
                        },
                        settings: {
                          ...formData.settings,
                          logoImage: ''
                        }
                      });
                    }}
                    className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                  </button>
                </div>
              )}

              <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 pt-2">
                3. Brand Metadata
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-[#E8DCC8]">Brand Name</label>
                  <input
                    type="text"
                    value={formData.siteSettings?.brandName || formData.settings?.brandName || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, brandName: val },
                        settings: { ...formData.settings, brandName: val }
                      });
                    }}
                    className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-[#E8DCC8]">Brand Tagline</label>
                  <input
                    type="text"
                    value={formData.siteSettings?.brandTagline || formData.settings?.tagline || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, brandTagline: val },
                        settings: { ...formData.settings, tagline: val }
                      });
                    }}
                    className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                  />
                </div>
              </div>
            </div>

            {/* Live Logo Previews */}
            <div className="space-y-4 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C8A96B]" />
                  <span>Real-time Logo Preview</span>
                </h4>
                <p className="text-[11px] text-[#E8DCC8]/70 mt-1 mb-4">
                  See how your logo renders on light website headers and dark footer/mobile views in real time.
                </p>

                {/* Light Header Preview */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[11px] font-bold text-[#E8DCC8]/80">
                    <span>Desktop & Mobile Header View (Light Canvas)</span>
                    <span className="text-[#C8A96B]">bg-[#F7F2E8]</span>
                  </div>
                  <div className="p-6 bg-[#F7F2E8] rounded-xl border border-[#E8DCC8] shadow-sm flex items-center justify-center min-h-[100px] text-center transition-all">
                    {(formData.siteSettings?.logoType || 'image') === 'image' && (formData.siteSettings?.logoImageUrl || formData.settings?.logoImage) ? (
                      <img
                        src={formData.siteSettings?.logoImageUrl || formData.settings?.logoImage}
                        alt="Logo Preview"
                        className="h-12 max-w-[260px] object-contain mx-auto"
                      />
                    ) : (
                      <span className="font-serif text-3xl tracking-[0.3em] font-light italic text-[#29231F]">
                        {formData.siteSettings?.brandName || formData.settings?.brandName || 'ALHAM'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dark Background Preview */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-[#E8DCC8]/80">
                    <span>Footer & Dark Background View</span>
                    <span className="text-[#C8A96B]">bg-[#29231F]</span>
                  </div>
                  <div className="p-6 bg-[#29231F] rounded-xl border border-[#F7F2E8]/20 shadow-sm flex items-center justify-center min-h-[100px] text-center transition-all">
                    {(formData.siteSettings?.logoType || 'image') === 'image' && (formData.siteSettings?.logoImageUrl || formData.settings?.logoImage) ? (
                      <img
                        src={formData.siteSettings?.logoImageUrl || formData.settings?.logoImage}
                        alt="Logo Preview Dark"
                        className="h-12 max-w-[260px] object-contain mx-auto brightness-0 invert"
                      />
                    ) : (
                      <span className="font-serif text-3xl tracking-[0.3em] font-light italic text-[#F7F2E8]">
                        {formData.siteSettings?.brandName || formData.settings?.brandName || 'ALHAM'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#1F1A17] rounded-xl border border-[#C8A96B]/20 text-[11px] text-[#E8DCC8]/80 space-y-1">
                <span className="font-bold text-[#C8A96B] block">💡 Pro Tip for High-Quality Brand Logos:</span>
                <p>
                  Use a transparent PNG or clean SVG vector image with dark or gold lettering. The website header uses an elegant off-white canvas where transparent logos look crisp and professional.
                </p>
              </div>
            </div>
          </div>

          {/* ==================== FOOTER LOGO MANAGEMENT ==================== */}
          <div id="footer-logo-management" className="mt-8 pt-6 border-t border-[#F7F2E8]/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#C8A96B] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#C8A96B]" />
                  <span>Footer Logo Management (Independent Asset)</span>
                </h3>
                <p className="text-xs text-[#E8DCC8]/70 mt-1">
                  Upload and configure an independent logo for the dark footer area. Changing this will not affect your header logo.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#6F7655]/30 border border-[#6F7655] text-green-300 font-mono text-[11px] font-bold self-start sm:self-auto flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                Independent Footer Logo Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10">
                <MediaPicker
                  label="Upload or Replace Footer Logo Asset"
                  value={formData.siteSettings?.footerLogoUrl || formData.siteSettings?.logoLightUrl || ''}
                  category="Logo"
                  mediaType="image"
                  helpText="Recommended: Transparent PNG or light SVG vector for dark footer background."
                  onChange={(url: string) => {
                    setFormData({
                      ...formData,
                      siteSettings: {
                        ...formData.siteSettings,
                        footerLogoUrl: url,
                        logoLightUrl: url
                      }
                    });
                  }}
                />
                {(formData.siteSettings?.footerLogoUrl || formData.siteSettings?.logoLightUrl) && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-green-400 flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5" /> Footer logo loaded
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          siteSettings: {
                            ...formData.siteSettings,
                            footerLogoUrl: '',
                            logoLightUrl: ''
                          }
                        });
                      }}
                      className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Custom Footer Logo
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#C8A96B]" />
                    <span>Footer Preview (Dark Canvas)</span>
                  </h4>
                  <p className="text-[11px] text-[#E8DCC8]/70 mt-1 mb-3">
                    Shows how your brand renders at the bottom of every page in the website footer.
                  </p>
                  <div className="p-6 bg-[#29231F] rounded-xl border border-[#F7F2E8]/20 shadow-sm flex items-center justify-center min-h-[100px] text-center">
                    {(() => {
                      const footerLogoSrc = formData.siteSettings?.footerLogoUrl || formData.siteSettings?.logoLightUrl || formData.siteSettings?.logoImageUrl || formData.settings?.logoImage;
                      if (footerLogoSrc) {
                        return (
                          <img
                            src={footerLogoSrc}
                            alt="Footer Logo Preview"
                            className="h-12 max-w-[260px] object-contain mx-auto"
                          />
                        );
                      }
                      return (
                        <span className="font-serif text-3xl tracking-[0.3em] font-light italic text-[#F7F2E8]">
                          {formData.siteSettings?.brandName || formData.settings?.brandName || 'ALHAM'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== FAVICON & BROWSER TAB ICON MANAGEMENT ==================== */}
          <div id="favicon-management" className="mt-8 pt-6 border-t border-[#F7F2E8]/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#C8A96B] flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C8A96B]" />
                  <span>Favicon & Browser Tab Icon Management</span>
                </h3>
                <p className="text-xs text-[#E8DCC8]/70 mt-1">
                  Upload, preview, replace, or remove your website favicon. Supports PNG, ICO, SVG, WEBP, and JPG formats. Updates dynamically across Chrome, Safari, Firefox, Edge, and mobile shortcuts.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#6F7655]/30 border border-[#6F7655] text-green-300 font-mono text-[11px] font-bold self-start sm:self-auto flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                Dynamic Favicon Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload & Controls */}
              <div className="space-y-5 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10">
                <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#C8A96B]" />
                  <span>1. Upload or Replace Favicon Asset</span>
                </h4>

                <MediaPicker
                  label="Upload Favicon Image from Device or Library"
                  value={formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl || ''}
                  category="Favicon"
                  mediaType="image"
                  helpText="Recommended: 32x32px or 64x64px transparent PNG, ICO, or SVG vector icon."
                  onChange={(url: string) => {
                    setFormData({
                      ...formData,
                      siteSettings: {
                        ...formData.siteSettings,
                        faviconUrl: url
                      },
                      settings: {
                        ...formData.settings,
                        faviconUrl: url
                      }
                    });
                  }}
                />

                {/* Direct File Upload Dropzone / Quick Select */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-[#E8DCC8]/80">
                    Or Enter Direct Favicon Image URL:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /uploads/favicon.png or https://..."
                    value={formData.siteSettings?.faviconUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({
                        ...formData,
                        siteSettings: {
                          ...formData.siteSettings,
                          faviconUrl: url
                        },
                        settings: {
                          ...formData.settings,
                          faviconUrl: url
                        }
                      });
                    }}
                    className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-[#F7F2E8] font-mono text-xs"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F7F2E8]/10">
                  {(formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          siteSettings: {
                            ...formData.siteSettings,
                            faviconUrl: ''
                          },
                          settings: {
                            ...formData.settings,
                            faviconUrl: ''
                          }
                        });
                      }}
                      className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Favicon (Reset Default)</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#E8DCC8]/60 italic">
                      Currently using default gold brand icon. Upload an icon above to customize.
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveCms()}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#6F7655] hover:bg-[#29231F] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Save className="w-4 h-4 text-[#C8A96B]" />
                    <span>{isSaving ? 'Saving Favicon...' : 'Save Favicon Permanently'}</span>
                  </button>
                </div>
              </div>

              {/* Live Real-Time Tab Previews */}
              <div className="space-y-4 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#C8A96B]" />
                    <span>Live Browser Tab & Mobile Shortcut Preview</span>
                  </h4>
                  <p className="text-[11px] text-[#E8DCC8]/70 mt-1 mb-4">
                    Visual simulation of how your uploaded favicon renders inside browser tabs and mobile bookmark shortcuts.
                  </p>

                  {/* Desktop Browser Tab Mockup */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[11px] font-bold text-[#E8DCC8]/80">
                      <span>Chrome / Safari / Firefox / Edge Browser Tab</span>
                      <span className="text-[#C8A96B]">16x16 / 32x32 Tab Icon</span>
                    </div>
                    <div className="p-3 bg-[#1E1E1E] rounded-xl border border-white/10 space-y-2">
                      {/* Browser top window bar */}
                      <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                      </div>

                      {/* Active Tab Mock */}
                      <div className="flex items-center gap-2 bg-[#2D2D2D] px-3 py-2 rounded-t-lg max-w-xs text-white border-t border-x border-white/10 shadow-inner">
                        {formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl ? (
                          <img
                            src={formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl}
                            alt="Favicon Tab Preview"
                            className="w-4 h-4 object-contain rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#29231F] border border-[#C8A96B] flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-serif font-bold text-[#C8A96B]">A</span>
                          </div>
                        )}
                        <span className="text-xs font-sans truncate text-gray-200 flex-1">
                          {formData.siteSettings?.websiteTitle || 'ALHAM — Handcrafted Date Confectionery'}
                        </span>
                        <span className="text-gray-400 text-xs hover:text-white cursor-pointer">×</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Bookmark Shortcut Mockup */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-[#E8DCC8]/80">
                      <span>Mobile Home Screen Shortcut</span>
                      <span className="text-[#C8A96B]">Apple Touch / Android Icon</span>
                    </div>
                    <div className="p-4 bg-[#1F1A17] rounded-xl border border-[#F7F2E8]/10 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#29231F] border-2 border-[#C8A96B] p-2 flex items-center justify-center shadow-lg shrink-0">
                        {formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl ? (
                          <img
                            src={formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl}
                            alt="Mobile Icon Preview"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <span className="font-serif text-2xl font-bold text-[#C8A96B]">A</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="font-serif font-bold text-sm text-[#F7F2E8] block">
                          {formData.siteSettings?.brandName || 'ALHAM'}
                        </span>
                        <span className="text-[11px] text-[#E8DCC8]/70 block">
                          Handcrafted Healthy Treats • Dhaka
                        </span>
                        <span className="text-[10px] text-green-400 font-mono block">
                          ✓ Persistent Across Sessions & Restarts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#1F1A17] rounded-xl border border-[#C8A96B]/20 text-[11px] text-[#E8DCC8]/80 space-y-1 mt-4">
                  <span className="font-bold text-[#C8A96B] block">💡 Pro Tip for Crisp Favicons:</span>
                  <p>
                    Upload a square 32x32px or 64x64px PNG or SVG image with a transparent background. SVG favicons look crisp on Retina displays, while ICO/PNG formats ensure universal browser compatibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {renderSaveSectionButton('Branding & Favicon')}
        </div>
      )}

      {/* ==================== HOMEPAGE CONFIGURATION ==================== */}
      {activeSection === 'homepage' && (
        <div className="space-y-6 text-xs text-[#E8DCC8]">
          <h3 className="font-serif text-xl font-bold text-[#C8A96B] flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#C8A96B]" />
            <span>Homepage Configuration</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#29231F] p-4 rounded-xl border border-[#F7F2E8]/10">
              <h4 className="font-bold mb-4 border-b border-[#F7F2E8]/10 pb-2">Signature Creations</h4>
              <label className="block mb-2">Display Count</label>
              <input type="number" value={formData.homepageConfig?.signatureCreations?.displayCount || 4} onChange={e => setFormData({ ...formData, homepageConfig: { ...formData.homepageConfig, signatureCreations: { ...(formData.homepageConfig?.signatureCreations || {}), displayCount: parseInt(e.target.value) || 4 } } })} className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg mb-4" />
              <label className="block mb-2">Mode</label>
              <select value={formData.homepageConfig?.signatureCreations?.mode || 'featured'} onChange={e => setFormData({ ...formData, homepageConfig: { ...formData.homepageConfig, signatureCreations: { ...(formData.homepageConfig?.signatureCreations || {}), mode: e.target.value as any } } })} className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg">
                <option value="featured">Featured</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div className="bg-[#29231F] p-4 rounded-xl border border-[#F7F2E8]/10">
              <h4 className="font-bold mb-4 border-b border-[#F7F2E8]/10 pb-2">All Products</h4>
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={formData.homepageConfig?.allProducts?.enabled ?? true} onChange={e => setFormData({ ...formData, homepageConfig: { ...formData.homepageConfig, allProducts: { ...(formData.homepageConfig?.allProducts || {}), enabled: e.target.checked } } })} />
                <span>Enabled</span>
              </label>
              <label className="block mb-2">Products Per Row</label>
              <input type="number" value={formData.homepageConfig?.allProducts?.productsPerRow || 3} onChange={e => setFormData({ ...formData, homepageConfig: { ...formData.homepageConfig, allProducts: { ...(formData.homepageConfig?.allProducts || {}), productsPerRow: parseInt(e.target.value) || 3 } } })} className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg" />
            </div>
          </div>
          {renderSaveSectionButton('Homepage Configuration')}
        </div>
      )}

      {/* ==================== 2. TOP ANNOUNCEMENT BAR MANAGEMENT ==================== */}
      {activeSection === 'announcement' && (
        <div className="space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F7F2E8]/10 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#C8A96B] flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C8A96B]" />
                <span>Top Announcement Bar Management</span>
              </h3>
              <p className="text-xs text-[#E8DCC8]/70 mt-1">
                Fully customize the top announcement bar message, language translations (English & Bangla), colors, and action link.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2.5 bg-[#29231F] px-4 py-2 rounded-xl border border-[#F7F2E8]/20 cursor-pointer hover:border-[#C8A96B] transition-all">
                <input
                  type="checkbox"
                  checked={formData.topBar?.enabled !== false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setFormData({
                      ...formData,
                      topBar: { ...formData.topBar, enabled: isChecked },
                      navConfig: { ...formData.navConfig, topBarEnabled: isChecked }
                    });
                  }}
                  className="w-4 h-4 rounded accent-[#6F7655]"
                />
                <span className="font-bold text-xs text-[#F7F2E8]">
                  {formData.topBar?.enabled !== false ? 'Bar Enabled (Active)' : 'Bar Disabled (Hidden)'}
                </span>
              </label>
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#C8A96B]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[#C8A96B] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C8A96B]" />
                Live Announcement Bar Preview
              </span>

              {/* Language Switcher for Preview */}
              <div className="flex items-center gap-1.5 bg-[#1F1A17] p-1 rounded-lg border border-[#F7F2E8]/10 text-[11px]">
                <span className="text-[#E8DCC8]/60 pl-1 font-mono">Preview Mode:</span>
                <button
                  type="button"
                  onClick={() => setAnnouncementPreviewLang('en')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    announcementPreviewLang === 'en'
                      ? 'bg-[#C8A96B] text-[#29231F]'
                      : 'text-[#E8DCC8] hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementPreviewLang('bn')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    announcementPreviewLang === 'bn'
                      ? 'bg-[#C8A96B] text-[#29231F]'
                      : 'text-[#E8DCC8] hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {formData.topBar?.enabled === false ? (
              <div className="p-4 bg-[#1F1A17] rounded-xl text-center text-[#E8DCC8]/50 border border-dashed border-[#F7F2E8]/20 italic">
                Announcement bar is currently disabled and will not be displayed on the live website.
              </div>
            ) : (
              <div
                className="py-2.5 px-4 text-xs font-medium tracking-wide flex justify-between items-center rounded-xl shadow-md transition-colors"
                style={{
                  backgroundColor: formData.topBar?.backgroundColor || '#29231F',
                  color: formData.topBar?.textColor || '#F7F2E8'
                }}
              >
                <div className="mx-auto flex items-center space-x-3 text-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#C8A96B] animate-pulse shrink-0"></span>
                  <span>
                    {announcementPreviewLang === 'bn'
                      ? (formData.topBar?.textBn || formData.topBar?.text || 'ফ্রি ডেলিভারি পেতে ন্যূনতম কার্ট পরিমাণ অর্জনে বার্তা')
                      : (formData.topBar?.textEn || formData.topBar?.text || 'Free delivery available on eligible orders')}
                  </span>
                  {formData.topBar?.showLink !== false && (formData.topBar?.linkTextEn || formData.topBar?.linkTextBn || formData.topBar?.linkText) && (
                    <span className="hidden md:inline-block font-serif italic underline ml-1 cursor-pointer hover:opacity-80">
                      | {announcementPreviewLang === 'bn'
                          ? (formData.topBar?.linkTextBn || formData.topBar?.linkText || 'সংগ্রহ দেখুন')
                          : (formData.topBar?.linkTextEn || formData.topBar?.linkText || 'Shop Collection')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bilingual Text Inputs */}
            <div className="space-y-4 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10">
              <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                <Type className="w-4 h-4 text-[#C8A96B]" />
                <span>1. Announcement Text (Bilingual)</span>
              </h4>

              <div>
                <label className="block mb-1 font-bold text-[#E8DCC8] flex items-center justify-between">
                  <span>English Announcement Text</span>
                  <span className="text-[10px] text-[#C8A96B] font-mono">English</span>
                </label>
                <input
                  type="text"
                  value={formData.topBar?.textEn !== undefined ? formData.topBar.textEn : (formData.topBar?.text || '')}
                  placeholder="e.g. Free delivery across Bangladesh on orders over ৳1,500"
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      topBar: {
                        ...formData.topBar,
                        textEn: val,
                        text: val
                      }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-[#E8DCC8] flex items-center justify-between">
                  <span>Bangla Announcement Text (বাংলা নোটিশ)</span>
                  <span className="text-[10px] text-[#C8A96B] font-mono">বাংলা</span>
                </label>
                <input
                  type="text"
                  value={formData.topBar?.textBn || ''}
                  placeholder="যেমন: ৳১,৫০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি"
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      topBar: {
                        ...formData.topBar,
                        textBn: val
                      }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                />
              </div>

              <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 pt-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#C8A96B]" />
                <span>2. Action Link Settings</span>
              </h4>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.topBar?.showLink !== false}
                    onChange={e => {
                      setFormData({
                        ...formData,
                        topBar: { ...formData.topBar, showLink: e.target.checked }
                      });
                    }}
                    className="w-4 h-4 rounded accent-[#6F7655]"
                  />
                  <span className="font-bold text-[#E8DCC8]">Include Clickable Action Link</span>
                </label>

                {formData.topBar?.showLink !== false && (
                  <div className="space-y-3 pl-2 border-l-2 border-[#C8A96B]/30 pt-1">
                    <div>
                      <label className="block mb-1 font-bold text-[#E8DCC8]">Link Target URL</label>
                      <input
                        type="text"
                        value={formData.topBar?.linkUrl || ''}
                        placeholder="e.g. #collection or https://..."
                        onChange={e => {
                          setFormData({
                            ...formData,
                            topBar: { ...formData.topBar, linkUrl: e.target.value }
                          });
                        }}
                        className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 font-bold text-[#E8DCC8]">English Link Text</label>
                        <input
                          type="text"
                          value={formData.topBar?.linkTextEn !== undefined ? formData.topBar.linkTextEn : (formData.topBar?.linkText || '')}
                          placeholder="e.g. Shop Collection"
                          onChange={e => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              topBar: { ...formData.topBar, linkTextEn: val, linkText: val }
                            });
                          }}
                          className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-bold text-[#E8DCC8]">Bangla Link Text (বাংলা)</label>
                        <input
                          type="text"
                          value={formData.topBar?.linkTextBn || ''}
                          placeholder="যেমন: কালেকশন দেখুন"
                          onChange={e => {
                            setFormData({
                              ...formData,
                              topBar: { ...formData.topBar, linkTextBn: e.target.value }
                            });
                          }}
                          className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colors & Presets */}
            <div className="space-y-5 bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10">
              <h4 className="font-serif text-sm font-bold text-[#F7F2E8] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C8A96B]" />
                <span>3. Announcement Bar Colors</span>
              </h4>

              {/* Background Color Picker */}
              <div className="space-y-2">
                <label className="block font-bold text-[#E8DCC8]">Background Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.topBar?.backgroundColor || '#29231F'}
                    onChange={e => {
                      setFormData({
                        ...formData,
                        topBar: { ...formData.topBar, backgroundColor: e.target.value }
                      });
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#F7F2E8]/30"
                  />
                  <input
                    type="text"
                    value={formData.topBar?.backgroundColor || '#29231F'}
                    onChange={e => {
                      setFormData({
                        ...formData,
                        topBar: { ...formData.topBar, backgroundColor: e.target.value }
                      });
                    }}
                    className="w-32 p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8] font-mono text-xs uppercase"
                  />
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] text-[#E8DCC8]/60 self-center mr-1">Presets:</span>
                  {[
                    { name: 'Espresso', hex: '#29231F' },
                    { name: 'Olive', hex: '#6F7655' },
                    { name: 'Terracotta', hex: '#A86445' },
                    { name: 'Warm Gold', hex: '#C8A96B' },
                    { name: 'Navy', hex: '#111827' },
                    { name: 'Crimson', hex: '#7F1D1D' }
                  ].map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          topBar: { ...formData.topBar, backgroundColor: preset.hex }
                        });
                      }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: preset.hex, color: preset.hex === '#C8A96B' ? '#29231F' : '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color Picker */}
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-[#E8DCC8]">Text Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.topBar?.textColor || '#F7F2E8'}
                    onChange={e => {
                      setFormData({
                        ...formData,
                        topBar: { ...formData.topBar, textColor: e.target.value }
                      });
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#F7F2E8]/30"
                  />
                  <input
                    type="text"
                    value={formData.topBar?.textColor || '#F7F2E8'}
                    onChange={e => {
                      setFormData({
                        ...formData,
                        topBar: { ...formData.topBar, textColor: e.target.value }
                      });
                    }}
                    className="w-32 p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8] font-mono text-xs uppercase"
                  />
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] text-[#E8DCC8]/60 self-center mr-1">Presets:</span>
                  {[
                    { name: 'Cream', hex: '#F7F2E8' },
                    { name: 'Pure White', hex: '#FFFFFF' },
                    { name: 'Soft Gold', hex: '#E8DCC8' },
                    { name: 'Pitch Black', hex: '#000000' }
                  ].map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          topBar: { ...formData.topBar, textColor: preset.hex }
                        });
                      }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#F7F2E8]/20 text-[#29231F] transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: preset.hex, color: preset.hex === '#000000' ? '#FFFFFF' : '#29231F' }}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {renderSaveSectionButton('Announcement Bar')}
        </div>
      )}

      {/* ==================== 1. GLOBAL SETTINGS ==================== */}
      {activeSection === 'settings' && (
        <div className="space-y-4 text-xs">
          <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Global Site & Brand Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-[#E8DCC8] font-bold">Brand Name</label>
              <input
                type="text"
                value={formData.settings?.brandName || ''}
                onChange={e => setFormData({ ...formData, settings: { ...formData.settings, brandName: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 text-[#E8DCC8] font-bold">Tagline</label>
              <input
                type="text"
                value={formData.settings?.tagline || ''}
                onChange={e => setFormData({ ...formData, settings: { ...formData.settings, tagline: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 text-[#E8DCC8] font-bold">Contact Phone Number</label>
              <input
                type="text"
                value={formData.settings?.contactPhone || ''}
                onChange={e => setFormData({ ...formData, settings: { ...formData.settings, contactPhone: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 text-[#E8DCC8] font-bold">Contact Email</label>
              <input
                type="email"
                value={formData.settings?.contactEmail || ''}
                onChange={e => setFormData({ ...formData, settings: { ...formData.settings, contactEmail: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-[#E8DCC8] font-bold">Kitchen & Office Address</label>
              <input
                type="text"
                value={formData.settings?.contactAddress || ''}
                onChange={e => setFormData({ ...formData, settings: { ...formData.settings, contactAddress: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 text-[#E8DCC8] font-bold">Instagram URL</label>
              <input
                type="text"
                value={formData.settings?.socialInstagram || ''}
                onChange={e => setFormData({ ...formData, settings: { ...formData.settings, socialInstagram: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div className="md:col-span-2 p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2">
              <MediaPicker
                label="Header Brand Logo"
                value={formData.siteSettings?.logoImageUrl || formData.settings?.logoImage || ''}
                category="Logo"
                mediaType="image"
                helpText="Upload PNG, SVG, WEBP, or JPG brand logo for website header"
                onChange={url => setFormData({
                  ...formData,
                  siteSettings: {
                    ...formData.siteSettings,
                    logoImageUrl: url,
                    logoType: url ? 'image' : (formData.siteSettings?.logoType || 'text')
                  },
                  settings: { ...formData.settings, logoImage: url }
                })}
              />
            </div>

            <div className="md:col-span-2 p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2">
              <MediaPicker
                label="Footer Brand Logo (Independent Asset)"
                value={formData.siteSettings?.footerLogoUrl || formData.siteSettings?.logoLightUrl || ''}
                category="Logo"
                mediaType="image"
                helpText="Upload independent footer logo (e.g. white/light PNG or SVG for dark footer canvas)"
                onChange={url => setFormData({
                  ...formData,
                  siteSettings: {
                    ...formData.siteSettings,
                    footerLogoUrl: url,
                    logoLightUrl: url
                  }
                })}
              />
            </div>

            <div className="md:col-span-2 p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2">
              <MediaPicker
                label="Favicon / Browser Tab Icon"
                value={formData.siteSettings?.faviconUrl || formData.settings?.faviconUrl || ''}
                category="Favicon"
                mediaType="image"
                helpText="Upload custom favicon image (PNG, ICO, SVG, WEBP) from device for browser tabs"
                onChange={url => setFormData({
                  ...formData,
                  siteSettings: { ...formData.siteSettings, faviconUrl: url },
                  settings: { ...formData.settings, faviconUrl: url }
                })}
              />
            </div>
          </div>
          {renderSaveSectionButton('Global Site Settings')}
        </div>
      )}

      {/* ==================== 2. NAVBAR & TOP BAR ==================== */}
      {activeSection === 'navbar' && (
        <div className="space-y-6 text-xs">
          <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Navbar & Top Bar Banner Configuration</h3>
          
          <div className="p-4 bg-[#29231F] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#E8DCC8]">Top Announcement Bar</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.navConfig?.topBarEnabled !== false}
                  onChange={e => setFormData({
                    ...formData,
                    navConfig: { ...formData.navConfig, topBarEnabled: e.target.checked }
                  })}
                  className="rounded text-[#6F7655]"
                />
                <span className="text-[#E8DCC8]">Show Top Bar</span>
              </label>
            </div>

            <div>
              <label className="block mb-1 text-[#E8DCC8]/70">Announcement Message</label>
              <input
                type="text"
                value={formData.navConfig?.topBarText || ''}
                onChange={e => setFormData({
                  ...formData,
                  navConfig: { ...formData.navConfig, topBarText: e.target.value }
                })}
                className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[#E8DCC8]">Navigation Items</h4>
            {formData.navConfig?.items?.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-3 bg-[#29231F] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[10px] text-[#E8DCC8]/60">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => {
                      const updatedItems = [...formData.navConfig.items];
                      updatedItems[idx].label = e.target.value;
                      setFormData({ ...formData, navConfig: { ...formData.navConfig, items: updatedItems } });
                    }}
                    className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#E8DCC8]/60">View Target</label>
                  <select
                    value={item.view}
                    onChange={e => {
                      const updatedItems = [...formData.navConfig.items];
                      updatedItems[idx].view = e.target.value;
                      setFormData({ ...formData, navConfig: { ...formData.navConfig, items: updatedItems } });
                    }}
                    className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  >
                    <option value="home">Home</option>
                    <option value="collection">Collection</option>
                    <option value="ingredients">Ingredients</option>
                    <option value="philosophy">Philosophy</option>
                    <option value="recipes">Recipes & Journal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={e => {
                        const updatedItems = [...formData.navConfig.items];
                        updatedItems[idx].enabled = e.target.checked;
                        setFormData({ ...formData, navConfig: { ...formData.navConfig, items: updatedItems } });
                      }}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          {renderSaveSectionButton('Navbar Links')}
        </div>
      )}

      {/* ==================== 3. HERO SECTION ==================== */}
      {activeSection === 'hero' && (
        <div className="space-y-4 text-xs">
          <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Hero Section Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Top Badge Text</label>
              <input
                type="text"
                value={formData.heroSection?.badge || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, badge: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Headline Line 1</label>
              <input
                type="text"
                value={formData.heroSection?.headlineFirst || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, headlineFirst: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Headline Line 2</label>
              <input
                type="text"
                value={formData.heroSection?.headlineSecond || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, headlineSecond: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Headline Italic Highlight</label>
              <input
                type="text"
                value={formData.heroSection?.headlineHighlight || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, headlineHighlight: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-bold text-[#E8DCC8]">Subheading Description</label>
              <textarea
                rows={2}
                value={formData.heroSection?.subheading || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, subheading: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Primary CTA Button Text</label>
              <input
                type="text"
                value={formData.heroSection?.primaryCtaText || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, primaryCtaText: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Secondary CTA Button Text</label>
              <input
                type="text"
                value={formData.heroSection?.secondaryCtaText || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, secondaryCtaText: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Circle Box Title</label>
              <input
                type="text"
                value={formData.heroSection?.alhamCircleTitle || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, alhamCircleTitle: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Circle Box Subtitle</label>
              <input
                type="text"
                value={formData.heroSection?.alhamCircleSubtitle || ''}
                onChange={e => setFormData({ ...formData, heroSection: { ...formData.heroSection, alhamCircleSubtitle: e.target.value } })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            {/* HERO MEDIA UPLOAD CONTROLS */}
            <div className="md:col-span-2 p-4 bg-[#29231F] rounded-xl border border-[#C8A96B]/30 space-y-4">
              <h4 className="font-serif font-bold text-[#C8A96B] text-sm">Hero Section Media (Images & Video)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MediaPicker
                  label="Hero Background Image"
                  value={formData.heroSection?.heroImage || ''}
                  category="Hero"
                  mediaType="image"
                  helpText="Primary hero photo background"
                  onChange={url => setFormData({
                    ...formData,
                    heroSection: { ...formData.heroSection, heroImage: url }
                  })}
                />

                <MediaPicker
                  label="Hero Background Video"
                  value={formData.heroSection?.heroVideo || ''}
                  category="Hero"
                  mediaType="video"
                  helpText="MP4 or WebM video loop for Hero section"
                  onChange={url => setFormData({
                    ...formData,
                    heroSection: { ...formData.heroSection, heroVideo: url }
                  })}
                />
              </div>
            </div>
          </div>
          {renderSaveSectionButton('Hero Section')}
        </div>
      )}

      {/* ==================== 4. CRAFT PHILOSOPHY ==================== */}
      {activeSection === 'craft' && <SectionCmsControl />}


      {/* ==================== 5. PROCESS TIMELINE ==================== */}
      {activeSection === 'process' && (
        <div className="space-y-4 text-xs">
          <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Artisanal Process Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Badge</label>
              <input
                type="text"
                value={formData.processTimelineSection?.badge || ''}
                onChange={e => setFormData({
                  ...formData,
                  processTimelineSection: { ...formData.processTimelineSection, badge: e.target.value }
                })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[#E8DCC8]">Heading Main</label>
              <input
                type="text"
                value={formData.processTimelineSection?.headingMain || ''}
                onChange={e => setFormData({
                  ...formData,
                  processTimelineSection: { ...formData.processTimelineSection, headingMain: e.target.value }
                })}
                className="w-full p-2.5 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-[#F7F2E8]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2">
              <MediaPicker
                label="Process Workflow Banner Media (Image or Video)"
                value={formData.processTimelineSection?.bannerImage || ''}
                category="General"
                mediaType="any"
                helpText="Upload process banner image or video loop from device"
                onChange={url => setFormData({
                  ...formData,
                  processTimelineSection: { ...formData.processTimelineSection, bannerImage: url }
                })}
              />
            </div>

            <h4 className="font-bold text-[#E8DCC8]">Workflow Steps</h4>
            {formData.processTimelineSection?.steps?.map((st: any, idx: number) => (
              <div key={st.id || idx} className="p-3 bg-[#29231F] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <label className="block text-[10px] text-[#E8DCC8]/60">Step No.</label>
                  <input
                    type="text"
                    value={st.stepNumber}
                    onChange={e => {
                      const updatedSteps = [...formData.processTimelineSection.steps];
                      updatedSteps[idx].stepNumber = e.target.value;
                      setFormData({ ...formData, processTimelineSection: { ...formData.processTimelineSection, steps: updatedSteps } });
                    }}
                    className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#E8DCC8]/60">Step Title</label>
                  <input
                    type="text"
                    value={st.title}
                    onChange={e => {
                      const updatedSteps = [...formData.processTimelineSection.steps];
                      updatedSteps[idx].title = e.target.value;
                      setFormData({ ...formData, processTimelineSection: { ...formData.processTimelineSection, steps: updatedSteps } });
                    }}
                    className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[#E8DCC8]/60">Description</label>
                  <input
                    type="text"
                    value={st.description}
                    onChange={e => {
                      const updatedSteps = [...formData.processTimelineSection.steps];
                      updatedSteps[idx].description = e.target.value;
                      setFormData({ ...formData, processTimelineSection: { ...formData.processTimelineSection, steps: updatedSteps } });
                    }}
                    className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
              </div>
            ))}
          </div>
          {renderSaveSectionButton('Process Workflow')}
        </div>
      )}

      {/* ==================== 8. WELLNESS & LIFESTYLE ==================== */}
      {activeSection === 'wellness' && <SectionCmsControl />}


      {/* ==================== 9. FOOTER, SOCIAL MEDIA & WHATSAPP LINKS ==================== */}
      {activeSection === 'footer' && (
        <div className="space-y-6 text-xs">
          <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#C8A96B] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#C8A96B]" />
                <span>Footer, Social Media & WhatsApp Links Manager</span>
              </h3>
              <p className="text-xs text-[#E8DCC8]/70">
                Manage WhatsApp chat options, floating website button, social media profile links, contact phone/email, and footer branding.
              </p>
            </div>
          </div>

          {/* Section A: WhatsApp & Floating Chat Widget Config */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#25D366]/30 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7F2E8]/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <h4 className="font-serif font-bold text-sm text-[#F7F2E8]">1. WhatsApp Support & Floating Chat Widget</h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-[#1F1A17] px-3 py-1.5 rounded-xl border border-[#25D366]/40">
                <input
                  type="checkbox"
                  checked={formData.contactInfo?.enableWhatsAppWidget !== false}
                  onChange={e => {
                    const updatedContact = { ...formData.contactInfo, enableWhatsAppWidget: e.target.checked };
                    setFormData({ ...formData, contactInfo: updatedContact });
                  }}
                  className="w-4 h-4 accent-[#25D366]"
                />
                <span className="text-xs font-bold text-[#25D366]">Enable Floating WhatsApp Button</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">WhatsApp Phone / Chat Number</label>
                <input
                  type="text"
                  placeholder="+8801711223344"
                  value={formData.contactInfo?.whatsApp || formData.socialLinks?.whatsApp || formData.settings?.contactPhone || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, whatsApp: val, whatsAppWidgetNumber: val },
                      socialLinks: { ...formData.socialLinks, whatsApp: val },
                      settings: { ...formData.settings, contactPhone: formData.settings?.contactPhone || val }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white font-mono focus:border-[#25D366]"
                />
                <p className="text-[10px] text-[#E8DCC8]/60 mt-1">Include country code (e.g. +8801711223344 or 01711223344).</p>
              </div>

              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">WhatsApp Preset Chat Greeting Message</label>
                <input
                  type="text"
                  placeholder="Hi ALHAM! I would like to inquire about your products."
                  value={formData.contactInfo?.whatsAppWidgetMessage || 'Hi ALHAM! I would like to inquire about your products.'}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, whatsAppWidgetMessage: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white focus:border-[#25D366]"
                />
                <p className="text-[10px] text-[#E8DCC8]/60 mt-1">Default message pre-filled when a customer clicks the WhatsApp button.</p>
              </div>
            </div>
          </div>

          {/* Section B: Social Media Profile Links */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <h4 className="font-serif font-bold text-sm text-[#C8A96B] border-b border-[#F7F2E8]/10 pb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#C8A96B]" />
              <span>2. Official Social Media Channels (Displayed in Footer)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Facebook */}
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">Facebook Page URL</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/alham.dhaka"
                  value={formData.socialLinks?.facebook || formData.settings?.socialFacebook || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: val },
                      settings: { ...formData.settings, socialFacebook: val }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">Instagram Profile URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/alham.dhaka"
                  value={formData.socialLinks?.instagram || formData.settings?.socialInstagram || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: val },
                      settings: { ...formData.settings, socialInstagram: val }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              {/* YouTube */}
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">YouTube Channel URL</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/alham.dhaka"
                  value={formData.socialLinks?.youTube || ''}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, youTube: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              {/* TikTok */}
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">TikTok Profile URL</label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@alham.dhaka"
                  value={formData.socialLinks?.tikTok || ''}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, tikTok: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">LinkedIn Company Page URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/company/alham"
                  value={formData.socialLinks?.linkedIn || ''}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedIn: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="block mb-1 text-[#E8DCC8] font-bold">Twitter / X Profile URL</label>
                <input
                  type="text"
                  placeholder="https://twitter.com/alham_dhaka"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* Section C: Custom Social Links */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <div className="flex justify-between items-center border-b border-[#F7F2E8]/10 pb-2">
              <h4 className="font-serif font-bold text-sm text-[#C8A96B] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#C8A96B]" />
                <span>3. Custom Extra Social Links ({formData.socialLinks?.customLinks?.length || 0})</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  const newCustom = [
                    ...(formData.socialLinks?.customLinks || []),
                    { id: 'c_' + Date.now(), platform: 'custom', title: 'New Channel', url: 'https://', enabled: true }
                  ];
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, customLinks: newCustom }
                  });
                }}
                className="px-3 py-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Custom Social Link
              </button>
            </div>

            <div className="space-y-3">
              {(formData.socialLinks?.customLinks || []).length === 0 ? (
                <p className="text-xs text-[#E8DCC8]/60 italic">No custom social links added yet. Click "+ Add Custom Social Link" to add Telegram, Pinterest, Threads, etc.</p>
              ) : (
                (formData.socialLinks?.customLinks || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} className="p-3 bg-[#1F1A17] rounded-xl border border-[#F7F2E8]/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-[#E8DCC8]/60">Platform Name / Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => {
                          const updated = [...formData.socialLinks.customLinks];
                          updated[idx].title = e.target.value;
                          setFormData({ ...formData, socialLinks: { ...formData.socialLinks, customLinks: updated } });
                        }}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-[10px] text-[#E8DCC8]/60">Link URL</label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={e => {
                          const updated = [...formData.socialLinks.customLinks];
                          updated[idx].url = e.target.value;
                          setFormData({ ...formData, socialLinks: { ...formData.socialLinks, customLinks: updated } });
                        }}
                        className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded-lg text-white text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.socialLinks.customLinks];
                          updated[idx].enabled = !updated[idx].enabled;
                          setFormData({ ...formData, socialLinks: { ...formData.socialLinks, customLinks: updated } });
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${item.enabled ? 'bg-green-950 text-green-300 border border-green-700' : 'bg-red-950 text-red-300'}`}
                      >
                        {item.enabled ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.socialLinks.customLinks.filter((_: any, i: number) => i !== idx);
                          setFormData({ ...formData, socialLinks: { ...formData.socialLinks, customLinks: updated } });
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section D: Contact Info & Footer Bio */}
          <div className="bg-[#29231F] p-5 rounded-2xl border border-[#F7F2E8]/10 space-y-4">
            <h4 className="font-serif font-bold text-sm text-[#C8A96B] border-b border-[#F7F2E8]/10 pb-2">
              4. Kitchen, Contact Info & Footer Text
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold text-[#E8DCC8]">Primary Customer Support Phone</label>
                <input
                  type="text"
                  value={formData.contactInfo?.phone || formData.settings?.contactPhone || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, phone: val },
                      settings: { ...formData.settings, contactPhone: val }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-[#E8DCC8]">Support Email Address</label>
                <input
                  type="email"
                  value={formData.contactInfo?.supportEmail || formData.settings?.contactEmail || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, supportEmail: val },
                      settings: { ...formData.settings, contactEmail: val }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-[#E8DCC8]">Kitchen & Office Physical Address</label>
                <input
                  type="text"
                  value={formData.contactInfo?.address || formData.settings?.contactAddress || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, address: val },
                      settings: { ...formData.settings, contactAddress: val }
                    });
                  }}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-[#E8DCC8]">Footer Brand Bio Paragraph</label>
                <textarea
                  rows={2}
                  value={formData.footerConfig?.brandBio || ''}
                  onChange={e => setFormData({
                    ...formData,
                    footerConfig: { ...formData.footerConfig, brandBio: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-[#E8DCC8]">Copyright Footer Line</label>
                <input
                  type="text"
                  value={formData.footerConfig?.copyrightText || ''}
                  onChange={e => setFormData({
                    ...formData,
                    footerConfig: { ...formData.footerConfig, copyrightText: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {renderSaveSectionButton('Footer, Social Media & WhatsApp Links')}
        </div>
      )}

      {/* ==================== 8. INGREDIENTS SOURCING ==================== */}
      {activeSection === 'ingredients' && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Ingredients & Origin Sourcing ({ingredients.length})</h3>
            <button
              onClick={() => {
                setIngredientError(null);
                setEditingIngredient({ id: '', name: '', origin: '', description: '', benefit: '', flavorNotes: '', image: '' });
              }}
              className="px-3 py-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Ingredient
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ingredients.map(ing => (
              <div key={ing.id} className="p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 flex gap-4">
                <img src={ing.image} alt={ing.name} className="w-20 h-20 object-cover rounded-lg bg-[#1F1A17]" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-[#F7F2E8]">{ing.name}</h4>
                    <span className="text-[10px] text-[#C8A96B] font-mono">{ing.origin}</span>
                  </div>
                  <p className="text-[11px] text-[#E8DCC8]/70 line-clamp-2">{ing.description}</p>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIngredientError(null);
                        setEditingIngredient({ ...ing });
                      }}
                      className="p-1 text-[#C8A96B] hover:text-white transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this ingredient?')) return;
                        const ok = await deleteIngredient(ing.id);
                        if (ok) {
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        } else {
                          alert('Failed to delete ingredient.');
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit / Add Ingredient Modal */}
          {editingIngredient && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl max-w-md w-full p-6 space-y-3 text-left">
                <h4 className="font-serif text-lg font-bold text-[#C8A96B]">
                  {ingredients.some(i => i.id === editingIngredient.id) ? 'Edit Ingredient' : 'New Ingredient'}
                </h4>

                {ingredientError && (
                  <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{ingredientError}</span>
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-[#E8DCC8] font-bold">Name</label>
                  <input
                    type="text"
                    value={editingIngredient.name || ''}
                    onChange={e => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#E8DCC8] font-bold">Origin Location</label>
                  <input
                    type="text"
                    value={editingIngredient.origin || ''}
                    onChange={e => setEditingIngredient({ ...editingIngredient, origin: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div>
                  <MediaPicker
                    label="Ingredient Photo"
                    value={editingIngredient.image || ''}
                    category="Ingredient"
                    mediaType="image"
                    helpText="Upload ingredient photo from device"
                    onChange={url => setEditingIngredient({ ...editingIngredient, image: url })}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#E8DCC8] font-bold">Description</label>
                  <textarea
                    rows={3}
                    value={editingIngredient.description || ''}
                    onChange={e => setEditingIngredient({ ...editingIngredient, description: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>

                <div className="bg-[#29231F] p-3 rounded-lg border border-[#F7F2E8]/10 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-1.5">
                    <span className="font-bold text-[#C8A96B] text-xs">Shop CTA Button Settings</span>
                    <button
                      type="button"
                      onClick={() => setEditingIngredient({
                        ...editingIngredient,
                        ctaEnabled: editingIngredient.ctaEnabled === false ? true : false
                      })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        editingIngredient.ctaEnabled !== false ? 'bg-green-950 text-green-300 border border-green-700' : 'bg-red-950 text-red-300 border border-red-700'
                      }`}
                    >
                      {editingIngredient.ctaEnabled !== false ? 'CTA Enabled' : 'CTA Disabled'}
                    </button>
                  </div>

                  {editingIngredient.ctaEnabled !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">CTA Button Text</label>
                        <input
                          type="text"
                          value={editingIngredient.ctaText || 'Shop Collection'}
                          onChange={e => setEditingIngredient({ ...editingIngredient, ctaText: e.target.value })}
                          className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                          placeholder="e.g. Shop Collection, Shop Now"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">CTA Target Link</label>
                        <input
                          type="text"
                          value={editingIngredient.ctaLink || '/collection'}
                          onChange={e => setEditingIngredient({ ...editingIngredient, ctaLink: e.target.value })}
                          className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8] font-mono text-xs"
                          placeholder="/collection"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditingIngredient(null);
                      setIngredientError(null);
                    }}
                    disabled={isSavingIngredient}
                    className="px-4 py-2 bg-[#29231F] text-[#E8DCC8] rounded hover:bg-[#29231F]/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIngredientError(null);
                      setIsSavingIngredient(true);
                      try {
                        const isExisting = ingredients.some(i => i.id === editingIngredient.id);
                        const url = isExisting ? `/api/ingredients/${editingIngredient.id}` : '/api/ingredients';
                        const method = isExisting ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editingIngredient)
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.ingredients) setIngredients(data.ingredients);
                          await refreshCms();
                          setEditingIngredient(null);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        } else {
                          const errData = await res.json().catch(() => ({}));
                          setIngredientError(errData.error || `Failed to save ingredient (Status: ${res.status})`);
                        }
                      } catch (err: any) {
                        setIngredientError(err.message || 'Network error occurred while saving ingredient');
                      } finally {
                        setIsSavingIngredient(false);
                      }
                    }}
                    disabled={isSavingIngredient}
                    className="px-4 py-2 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded transition-colors flex items-center gap-2"
                  >
                    {isSavingIngredient && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Save Ingredient</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 9. JOURNAL & ARTICLES ==================== */}
      {activeSection === 'articles' && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Journal Articles & Recipes ({articles.length})</h3>
            <button
              onClick={() => setEditingArticle({ id: `art-${Date.now()}`, title: '', category: 'Recipes', excerpt: '', content: '', image: '', readTime: '3 min', publishedAt: new Date().toISOString() })}
              className="px-3 py-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map(art => (
              <div key={art.id} className="p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2 flex flex-col justify-between">
                <div>
                  <img src={art.image} alt={art.title} className="w-full h-32 object-cover rounded-lg bg-[#1F1A17] mb-2" />
                  <span className="text-[10px] uppercase font-bold text-[#C8A96B]">{art.category}</span>
                  <h4 className="font-bold text-[#F7F2E8] font-serif">{art.title}</h4>
                  <p className="text-[11px] text-[#E8DCC8]/70 line-clamp-2 mt-1">{art.excerpt}</p>
                </div>

                <div className="pt-2 border-t border-[#F7F2E8]/10 flex justify-between items-center">
                  <span className="text-[10px] text-[#E8DCC8]/50">{art.readTime} read</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingArticle(art)}
                      className="p-1 text-[#C8A96B] hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete article?')) return;
                        await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
                        setArticles(articles.filter(a => a.id !== art.id));
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit / Add Article Modal */}
          {editingArticle && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl max-w-md w-full p-6 space-y-3 text-left">
                <h4 className="font-serif text-lg font-bold text-[#C8A96B]">
                  {articles.some(a => a.id === editingArticle.id) ? 'Edit Article' : 'New Article'}
                </h4>
                <div>
                  <label className="block mb-1">Title</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingArticle.category}
                    onChange={e => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div>
                  <MediaPicker
                    label="Article Cover Media (Image or Video)"
                    value={editingArticle.image}
                    category="Journal"
                    mediaType="any"
                    helpText="Upload cover photo or video from device"
                    onChange={url => setEditingArticle({ ...editingArticle, image: url })}
                  />
                </div>
                <div>
                  <label className="block mb-1">Excerpt</label>
                  <textarea
                    rows={2}
                    value={editingArticle.excerpt}
                    onChange={e => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>

                <div className="bg-[#29231F] p-3 rounded-lg border border-[#F7F2E8]/10 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F7F2E8]/10 pb-1.5">
                    <span className="font-bold text-[#C8A96B] text-xs">Secondary Shop CTA Button</span>
                    <button
                      type="button"
                      onClick={() => setEditingArticle({
                        ...editingArticle,
                        shopCtaEnabled: editingArticle.shopCtaEnabled === false ? true : false
                      })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        editingArticle.shopCtaEnabled !== false ? 'bg-green-950 text-green-300 border border-green-700' : 'bg-red-950 text-red-300 border border-red-700'
                      }`}
                    >
                      {editingArticle.shopCtaEnabled !== false ? 'CTA Enabled' : 'CTA Disabled'}
                    </button>
                  </div>

                  {editingArticle.shopCtaEnabled !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">Shop CTA Button Text</label>
                        <input
                          type="text"
                          value={editingArticle.shopCtaText || 'Shop Related Products'}
                          onChange={e => setEditingArticle({ ...editingArticle, shopCtaText: e.target.value })}
                          className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                          placeholder="e.g. Shop Related Products, Buy This Product"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#E8DCC8]/70 mb-1 font-bold">CTA Target Link</label>
                        <input
                          type="text"
                          value={editingArticle.shopCtaLink || '/collection'}
                          onChange={e => setEditingArticle({ ...editingArticle, shopCtaLink: e.target.value })}
                          className="w-full p-2 bg-[#1F1A17] border border-[#F7F2E8]/20 rounded text-[#F7F2E8] font-mono text-xs"
                          placeholder="/collection"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingArticle(null)}
                    className="px-4 py-2 bg-[#29231F] text-[#E8DCC8] rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const isExisting = articles.some(a => a.id === editingArticle.id);
                      const url = isExisting ? `/api/articles/${editingArticle.id}` : '/api/articles';
                      const method = isExisting ? 'PUT' : 'POST';
                      const res = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingArticle)
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.articles) setArticles(data.articles);
                        setEditingArticle(null);
                      }
                    }}
                    className="px-4 py-2 bg-[#6F7655] text-white font-bold rounded"
                  >
                    Save Article
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 10. COMMUNITY REVIEWS ==================== */}
      {activeSection === 'reviews' && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Community Reviews ({reviews.length})</h3>
            <button
              onClick={() => setEditingReview({ id: `rev-${Date.now()}`, userName: '', rating: 5, comment: '', date: 'Just now' })}
              className="px-3 py-1.5 bg-[#6F7655] hover:bg-[#A86445] text-white font-bold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 bg-[#29231F] rounded-xl border border-[#F7F2E8]/10 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#F7F2E8] font-serif">{rev.userName}</span>
                    <span className="text-[#C8A96B] font-bold">★ {rev.rating}/5</span>
                  </div>
                  <p className="text-[11px] text-[#E8DCC8]/80 italic mt-2">"{rev.comment}"</p>
                </div>

                <div className="pt-2 border-t border-[#F7F2E8]/10 flex justify-between items-center text-[10px] text-[#E8DCC8]/50">
                  <span>{rev.date}</span>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete review?')) return;
                      await fetch(`/api/reviews/${rev.id}`, { method: 'DELETE' });
                      setReviews(reviews.filter(r => r.id !== rev.id));
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit / Add Review Modal */}
          {editingReview && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#1F1A17] border border-[#C8A96B]/30 rounded-2xl max-w-md w-full p-6 space-y-3 text-left">
                <h4 className="font-serif text-lg font-bold text-[#C8A96B]">New Community Review</h4>
                <div>
                  <label className="block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingReview.userName}
                    onChange={e => setEditingReview({ ...editingReview, userName: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Rating (1 to 5 Stars)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingReview.rating}
                    onChange={e => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Comment</label>
                  <textarea
                    rows={3}
                    value={editingReview.comment}
                    onChange={e => setEditingReview({ ...editingReview, comment: e.target.value })}
                    className="w-full p-2 bg-[#29231F] border border-[#F7F2E8]/20 rounded text-[#F7F2E8]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingReview(null)}
                    className="px-4 py-2 bg-[#29231F] text-[#E8DCC8] rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingReview)
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.reviews) setReviews(data.reviews);
                        setEditingReview(null);
                      }
                    }}
                    className="px-4 py-2 bg-[#6F7655] text-white font-bold rounded"
                  >
                    Save Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 11. MEDIA LIBRARY ==================== */}
      {activeSection === 'media' && (
        <div className="space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#C8A96B]">Central Media Asset Manager</h3>
              <p className="text-[11px] text-[#E8DCC8]/70">
                Upload images and videos directly from your laptop, desktop, or mobile device.
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#29231F] rounded-2xl border border-[#C8A96B]/30 space-y-4">
            <MediaPicker
              label="Upload Media Files From Device"
              value=""
              multiple={true}
              helpText="Select or drag & drop multiple images (JPG, PNG, WEBP, SVG, GIF) or videos (MP4, WebM) from your device"
              onChange={() => {}}
            />
          </div>
        </div>
      )}

    </div>
  );
};
