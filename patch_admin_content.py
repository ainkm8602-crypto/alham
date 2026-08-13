import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

payment_tab_content = """
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
                            const res = await fetch(`/api/orders/${order.id}/verify-payment`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'Verified' })
                            });
                            if(res.ok) { showToast('Payment verified successfully'); fetchAllData(); }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >Verify & Confirm</button>
                        <button 
                          onClick={async () => {
                            const note = prompt('Reason for rejection:');
                            if(note !== null) {
                              const res = await fetch(`/api/orders/${order.id}/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Rejected', adminNote: note })
                              });
                              if(res.ok) { showToast('Payment rejected'); fetchAllData(); }
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
"""

content = content.replace("        {activeTab === 'orders' && (", payment_tab_content + "\n        {activeTab === 'orders' && (")

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
