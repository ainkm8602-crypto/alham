import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Add tracking settings state
content = content.replace(
    "const [localPaymentSettings, setLocalPaymentSettings] = useState<any>(paymentSettings || {});",
    "const { trackingSettings, updateTrackingSettings, paymentSettings, updatePaymentSettings } = useCms();\n  const [localPaymentSettings, setLocalPaymentSettings] = useState<any>(paymentSettings || {});\n  const [localTrackingSettings, setLocalTrackingSettings] = useState<any>(trackingSettings || { gtm: {}, ga4: {}, metaPixel: {}, googleAds: {}, tikTokPixel: {}, customScripts: {} });\n  useEffect(() => { if (trackingSettings) setLocalTrackingSettings(trackingSettings); }, [trackingSettings]);"
)
content = content.replace("const { paymentSettings, updatePaymentSettings } = useCms();", "")

# Add Analytics tab menu item
menu_button = """          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Tracking & Analytics</span>
          </button>"""

menu_button_regex = re.compile(r"(<button[^>]*onClick=\{\(\) => setActiveTab\('marketing'\)\}[^>]*>[\s\S]*?</button>)")
content = menu_button_regex.sub(r"\1\n" + menu_button, content)

# Add Analytics tab content
analytics_content = """
        {/* Tracking & Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#29231F]">Tracking & Analytics</h2>
                <p className="text-sm text-[#29231F]/70">Manage Google Tag Manager, pixels, and custom tracking codes.</p>
              </div>
              <button
                onClick={async () => {
                  const success = await updateTrackingSettings(localTrackingSettings);
                  if (success) showToast('Tracking settings saved permanently.');
                }}
                className="bg-[#6F7655] hover:bg-[#29231F] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save All Tracking Settings
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Google Tag Manager */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#29231F]">Google Tag Manager</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localTrackingSettings?.gtm?.enabled || false}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          gtm: { ...localTrackingSettings.gtm, enabled: e.target.checked }
                        })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${localTrackingSettings?.gtm?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localTrackingSettings?.gtm?.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-bold text-[#29231F]">Enable</span>
                  </label>
                </div>
                {localTrackingSettings?.gtm?.enabled && (
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">GTM Container ID</label>
                    <input 
                      type="text" 
                      value={localTrackingSettings?.gtm?.containerId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        gtm: { ...localTrackingSettings.gtm, containerId: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                      placeholder="e.g., GTM-XXXXXXX"
                    />
                  </div>
                )}
              </div>

              {/* Google Analytics 4 */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#29231F]">Google Analytics 4</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localTrackingSettings?.ga4?.enabled || false}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          ga4: { ...localTrackingSettings.ga4, enabled: e.target.checked }
                        })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${localTrackingSettings?.ga4?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localTrackingSettings?.ga4?.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-bold text-[#29231F]">Enable</span>
                  </label>
                </div>
                {localTrackingSettings?.ga4?.enabled && (
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">GA4 Measurement ID</label>
                    <input 
                      type="text" 
                      value={localTrackingSettings?.ga4?.measurementId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        ga4: { ...localTrackingSettings.ga4, measurementId: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                      placeholder="e.g., G-XXXXXXXXXX"
                    />
                  </div>
                )}
              </div>

              {/* Meta / Facebook Pixel */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#29231F]">Meta / Facebook Pixel</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localTrackingSettings?.metaPixel?.enabled || false}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          metaPixel: { ...localTrackingSettings.metaPixel, enabled: e.target.checked }
                        })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${localTrackingSettings?.metaPixel?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localTrackingSettings?.metaPixel?.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-bold text-[#29231F]">Enable</span>
                  </label>
                </div>
                {localTrackingSettings?.metaPixel?.enabled && (
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Meta Pixel ID</label>
                    <input 
                      type="text" 
                      value={localTrackingSettings?.metaPixel?.pixelId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        metaPixel: { ...localTrackingSettings.metaPixel, pixelId: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                      placeholder="e.g., 123456789012345"
                    />
                  </div>
                )}
              </div>

              {/* Google Ads */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#29231F]">Google Ads Conversion Tracking</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localTrackingSettings?.googleAds?.enabled || false}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          googleAds: { ...localTrackingSettings.googleAds, enabled: e.target.checked }
                        })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${localTrackingSettings?.googleAds?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localTrackingSettings?.googleAds?.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-bold text-[#29231F]">Enable</span>
                  </label>
                </div>
                {localTrackingSettings?.googleAds?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#29231F] mb-1">Conversion ID</label>
                      <input 
                        type="text" 
                        value={localTrackingSettings?.googleAds?.conversionId || ''}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          googleAds: { ...localTrackingSettings.googleAds, conversionId: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                        placeholder="e.g., AW-XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#29231F] mb-1">Conversion Label</label>
                      <input 
                        type="text" 
                        value={localTrackingSettings?.googleAds?.conversionLabel || ''}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          googleAds: { ...localTrackingSettings.googleAds, conversionLabel: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                        placeholder="e.g., abcdefg123456"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TikTok Pixel */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#29231F]">TikTok Pixel</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localTrackingSettings?.tikTokPixel?.enabled || false}
                        onChange={(e) => setLocalTrackingSettings({
                          ...localTrackingSettings, 
                          tikTokPixel: { ...localTrackingSettings.tikTokPixel, enabled: e.target.checked }
                        })}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${localTrackingSettings?.tikTokPixel?.enabled ? 'bg-[#6F7655]' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localTrackingSettings?.tikTokPixel?.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-xs font-bold text-[#29231F]">Enable</span>
                  </label>
                </div>
                {localTrackingSettings?.tikTokPixel?.enabled && (
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">TikTok Pixel ID</label>
                    <input 
                      type="text" 
                      value={localTrackingSettings?.tikTokPixel?.pixelId || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        tikTokPixel: { ...localTrackingSettings.tikTokPixel, pixelId: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm" 
                      placeholder="e.g., C01234567890ABCDEF"
                    />
                  </div>
                )}
              </div>

              {/* Custom Scripts */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-sm">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-[#29231F]">Custom Tracking Scripts</h3>
                  <p className="text-xs text-red-600 font-bold mt-1">Warning: Only add trusted scripts. Invalid code can break your website.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Head Script (&lt;head&gt;)</label>
                    <textarea 
                      value={localTrackingSettings?.customScripts?.headScript || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        customScripts: { ...localTrackingSettings.customScripts, headScript: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm font-mono h-24 bg-gray-50" 
                      placeholder="<!-- Paste head script here -->"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Body Script (&lt;body&gt;)</label>
                    <textarea 
                      value={localTrackingSettings?.customScripts?.bodyScript || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        customScripts: { ...localTrackingSettings.customScripts, bodyScript: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm font-mono h-24 bg-gray-50" 
                      placeholder="<!-- Paste body script here -->"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Footer Script (Before &lt;/body&gt;)</label>
                    <textarea 
                      value={localTrackingSettings?.customScripts?.footerScript || ''}
                      onChange={(e) => setLocalTrackingSettings({
                        ...localTrackingSettings, 
                        customScripts: { ...localTrackingSettings.customScripts, footerScript: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#E8DCC8] text-sm font-mono h-24 bg-gray-50" 
                      placeholder="<!-- Paste footer script here -->"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
"""

# Append analytics_content before the last closing tags. 
content = content.replace("      </div>\n    </div>\n  );\n};", analytics_content + "\n      </div>\n    </div>\n  );\n};")

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
