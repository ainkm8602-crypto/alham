import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

customers_regex = r"\{\/\* TAB 5: CUSTOMERS \*\/.*?\{\/\* TAB 6: WEBSITE CMS \*\/\}"
customers_replacement = """{/* TAB 5: CUSTOMERS */}
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

        {/* TAB 6: WEBSITE CMS */}"""
content = re.sub(customers_regex, customers_replacement, content, flags=re.DOTALL)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
