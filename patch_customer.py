import re

with open("src/components/CustomerDashboard.tsx", "r") as f:
    content = f.read()

# Add notification state
content = content.replace(
    "const [isLoading, setIsLoading] = useState(true);",
    "const [isLoading, setIsLoading] = useState(true);\n  const [notifications, setNotifications] = useState<any[]>([]);"
)

# Fetch notifications
fetch_block = """        fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
      
      fetch(`/api/notifications?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(console.error);"""

content = re.sub(r'fetch\(`/api/orders\?email=\$\{encodeURIComponent\(currentUser\.email\)\}`\).*?\.catch\(\(\) => setIsLoading\(false\)\);', fetch_block, content, flags=re.DOTALL)

# Add Notification icon import
content = content.replace("Package, User, MapPin, Award, Clock, ArrowRight, LogOut, CheckCircle2", "Package, User, MapPin, Award, Clock, ArrowRight, LogOut, CheckCircle2, Bell")

# Find the Customer Profile & Address Sidebar
sidebar_start = "{/* Customer Profile & Address Sidebar */}"
sidebar_regex = re.compile(re.escape(sidebar_start) + r".*?<div className=\"space-y-6\">", re.DOTALL)

new_sidebar = """{/* Customer Profile & Address Sidebar */}
          <div className="space-y-6">
            
            {/* Notifications */}
            <div className="bg-[#F7F2E8] border border-[#E8DCC8] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#29231F] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#A86445]" />
                  <span>Notifications</span>
                </h3>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-[#A86445] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length} New
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#29231F]/60 py-2 text-center">No notifications yet.</p>
                ) : (
                  notifications.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notif => (
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
            </div>"""

content = sidebar_regex.sub(new_sidebar, content)

with open("src/components/CustomerDashboard.tsx", "w") as f:
    f.write(content)

