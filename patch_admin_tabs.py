import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# 1. Update the state type
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'delivery' | 'customers' | 'content' | 'marketing' | 'analytics'>('overview');",
    "const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'payments' | 'delivery' | 'customers' | 'content' | 'marketing' | 'analytics'>('overview');\n  const { paymentSettings, updatePaymentSettings } = useCms();\n  const [localPaymentSettings, setLocalPaymentSettings] = useState<any>(paymentSettings || {});\n  useEffect(() => { if (paymentSettings) setLocalPaymentSettings(paymentSettings); }, [paymentSettings]);"
)

# 2. Add the Payment menu button
menu_button = """          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'payments' ? 'bg-[#6F7655] text-white font-bold shadow-md' : 'bg-[#1F1A17] text-[#E8DCC8]/70 hover:text-white'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Payments</span>
          </button>"""

content = content.replace("activeTab === 'orders'", "activeTab === 'orders'") # this is a no-op just to find it, I'll use regex.
menu_button_regex = re.compile(r"(<button[^>]*onClick=\{\(\) => setActiveTab\('orders'\)\}[^>]*>[\s\S]*?</button>)")
content = menu_button_regex.sub(r"\1\n" + menu_button, content)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
