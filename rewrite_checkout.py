import re

with open("src/components/CheckoutModal.tsx", "r") as f:
    content = f.read()

# 1. Update the Payment Selection section to dynamically use `paymentSettings`
# Add `paymentSettings` destructuring to `useCms()`
content = content.replace("  const { products, deliverySettings } = useCms();", "  const { products, deliverySettings, paymentSettings } = useCms();\n  const [paymentSubmissionData, setPaymentSubmissionData] = useState({ senderNumber: '', transactionId: '', screenshotBase64: '' });")

# We need to make sure `useState` import is included if missing, but it is already there.

# 2. Modify the payment selection grid
payment_grid_start = "            {/* 2. Payment Options */}"
payment_grid_end = "            {/* Final Order Summary */}"

payment_grid_regex = re.compile(re.escape(payment_grid_start) + r".*?" + re.escape(payment_grid_end), re.DOTALL)
new_payment_grid = """
            {/* 2. Payment Options */}
            <div className="space-y-3 pt-2 border-t border-[#E8DCC8]">
              <h3 className="font-serif font-bold text-sm text-[#6F7655] uppercase tracking-wider">
                {t('2. Payment Options', '২. পেমেন্ট অপশন')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {paymentSettings?.cashOnDelivery?.enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-[#6F7655] bg-[#6F7655]/10 font-bold text-[#29231F]'
                        : 'border-[#E8DCC8] bg-white text-[#29231F]/70'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#6F7655]" />
                    <span>{t('Cash on Delivery', 'ক্যাশ অন ডেলিভারি')}</span>
                  </button>
                )}
                
                {paymentSettings?.bKash?.enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bKash')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                      paymentMethod === 'bKash'
                        ? 'border-[#A86445] bg-[#A86445]/10 font-bold text-[#29231F]'
                        : 'border-[#E8DCC8] bg-white text-[#29231F]/70'
                    }`}
                  >
                    <span className="font-mono font-bold text-[#A86445]">bKash</span>
                    <span>Manual Payment</span>
                  </button>
                )}
                
                {paymentSettings?.nagad?.enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                      paymentMethod === 'Nagad'
                        ? 'border-[#C8A96B] bg-[#C8A96B]/10 font-bold text-[#29231F]'
                        : 'border-[#E8DCC8] bg-white text-[#29231F]/70'
                    }`}
                  >
                    <span className="font-mono font-bold text-[#C8A96B]">Nagad</span>
                    <span>Manual Payment</span>
                  </button>
                )}
                
                {paymentSettings?.rocket?.enabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Rocket')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                      paymentMethod === 'Rocket'
                        ? 'border-[#A86445] bg-[#A86445]/10 font-bold text-[#29231F]'
                        : 'border-[#E8DCC8] bg-white text-[#29231F]/70'
                    }`}
                  >
                    <span className="font-mono font-bold text-[#A86445]">Rocket</span>
                    <span>Manual Payment</span>
                  </button>
                )}
              </div>
            </div>

            {/* Final Order Summary */}
"""
content = payment_grid_regex.sub(new_payment_grid, content)

# 3. Modify the confirmation view to show manual payment if needed
confirm_view_start = "          {/* Order Confirmation View */}"
confirm_view_regex = re.compile(re.escape(confirm_view_start) + r".*?</form>\n        \) : \(\n          /\* Order Confirmation View \*/\n.*?</div>\n        \)}", re.DOTALL)

# Since doing regex across lines like that is messy, let's just find the closing bracket for the conditional render
# and insert our new logic.

# Let's replace the whole Order Confirmation View.
# It starts at `/* Order Confirmation View */` and ends before `</div>\n    </div>\n  );\n};\n`

confirm_view_block = """
        ) : (
          /* Order Confirmation View */
          <div className="py-6 space-y-6 text-center overflow-y-auto max-h-[70vh]">
            {completedOrder.paymentStatus === 'Pending Verification' ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#6F7655] text-white w-fit mx-auto rounded-full shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#29231F]">Payment Submitted</h3>
                <p className="text-xs text-[#29231F]/80">Your payment information is pending verification by our team. We will notify you once verified.</p>
              </div>
            ) : (['bKash', 'Nagad', 'Rocket'].includes(completedOrder.paymentMethod) && !completedOrder.paymentSubmission) ? (
              <div className="space-y-4 text-left">
                <h3 className="font-serif text-xl font-bold text-[#29231F] text-center">Complete Your Payment</h3>
                <div className="bg-[#E8DCC8]/30 p-4 rounded-xl border border-[#E8DCC8] space-y-3">
                  <p className="text-sm">Please pay <strong>৳{completedOrder.total}</strong> via {completedOrder.paymentMethod}</p>
                  
                  <div className="bg-white p-3 rounded-lg border border-[#E8DCC8]">
                    <p className="text-xs text-[#6F7655] uppercase font-bold mb-1">Send Money To</p>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-lg font-bold">{paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.number || '01XXXXXXXXX'}</span>
                      <span className="text-[10px] bg-[#A86445]/10 text-[#A86445] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                        {paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.accountType || 'Personal'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-2 text-[#29231F]/80">
                    <p><strong>Instructions:</strong> {paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.instructions}</p>
                    <p><strong>Reference:</strong> {paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.referenceInstructions}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm">Submit Payment Details</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Sender Mobile Number</label>
                    <input 
                      type="text" 
                      value={paymentSubmissionData.senderNumber}
                      onChange={(e) => setPaymentSubmissionData({...paymentSubmissionData, senderNumber: e.target.value})}
                      className="w-full p-3 rounded-xl border border-[#E8DCC8] bg-white text-sm" 
                      placeholder="e.g., 01712345678" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#29231F] mb-1">Transaction ID</label>
                    <input 
                      type="text" 
                      value={paymentSubmissionData.transactionId}
                      onChange={(e) => setPaymentSubmissionData({...paymentSubmissionData, transactionId: e.target.value})}
                      className="w-full p-3 rounded-xl border border-[#E8DCC8] bg-white text-sm uppercase font-mono" 
                      placeholder="e.g., 9DF3XJ..." 
                    />
                    <p className="text-[10px] mt-1 text-[#6F7655]">{paymentSettings?.[completedOrder.paymentMethod.toLowerCase()]?.transactionIdInstructions}</p>
                  </div>

                  <button
                    onClick={async () => {
                      if(!paymentSubmissionData.senderNumber || !paymentSubmissionData.transactionId) {
                        alert('Please enter sender number and transaction ID');
                        return;
                      }
                      try {
                        const res = await fetch(`/api/orders/${completedOrder.id}/payment`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            method: completedOrder.paymentMethod,
                            amount: completedOrder.total,
                            senderNumber: paymentSubmissionData.senderNumber,
                            transactionId: paymentSubmissionData.transactionId,
                            screenshotUrl: paymentSubmissionData.screenshotBase64
                          })
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setCompletedOrder(updated);
                        }
                      } catch(e) { console.error(e); }
                    }}
                    className="w-full py-3 bg-[#A86445] text-white text-xs font-bold rounded-xl hover:bg-[#8A5035] transition-colors"
                  >
                    Submit Payment Information
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#6F7655] text-white w-fit mx-auto rounded-full shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#A86445] uppercase">
                    {t(`Order ID: ${completedOrder.id}`, `অর্ডার আইডি: ${completedOrder.id}`)}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#29231F]">
                    {t('Order Successfully Placed!', 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!')}
                  </h3>
                  <p className="text-xs text-[#29231F]/80 max-w-sm mx-auto">
                    {t(
                      `We have received your order for ${completedOrder.customerName}. Our kitchen is preparing your fresh artisanal batch.`,
                      `আমরা ${completedOrder.customerName}-এর অর্ডারটি গ্রহণ করেছি। আমাদের কিচেন ফ্রেশ খাদ্য প্রস্তুত করছে।`
                    )}
                  </p>
                </div>
                <div className="p-4 bg-[#E8DCC8]/50 rounded-xl text-xs space-y-2 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-[#6F7655] font-semibold">{t('Deliver To:', 'প্রাপকের ঠিকানা:')}</span>
                    <span className="font-medium text-[#29231F]">{completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F7655] font-semibold">{t('Payment:', 'পেমেন্ট:')}</span>
                    <span className="font-medium text-[#29231F]">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F7655] font-semibold">{t('Total Amount:', 'মোট টাকা:')}</span>
                    <span className="font-serif font-bold text-[#29231F]">৳{completedOrder.total}</span>
                  </div>
                </div>
              </>
            )}
            
            <button
              onClick={() => {
                setIsCheckoutModalOpen(false);
                setCompletedOrder(null);
              }}
              className="px-8 py-3 bg-[#6F7655] text-white text-xs font-bold rounded-xl hover:bg-[#29231F] transition-colors"
            >
              {t('Return to Homepage', 'হোমপেজে ফিরে যান')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
"""

content = re.sub(r'        \) : \(\n          /\* Order Confirmation View \*/\n.*?(?=  \);\n};\n)', confirm_view_block, content, flags=re.DOTALL)

with open("src/components/CheckoutModal.tsx", "w") as f:
    f.write(content)

