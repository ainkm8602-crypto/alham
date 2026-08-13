import re

with open("src/components/CheckoutModal.tsx", "r") as f:
    content = f.read()

content = content.replace("const { language, t } = useLanguage();", "const { language, t } = useLanguage();\n  const { trackEvent } = useTracking();")
content = content.replace("const { language, t } = useLanguage();\n  const { trackEvent } = useTracking();\n  const { trackEvent } = useTracking();", "const { language, t } = useLanguage();\n  const { trackEvent } = useTracking();")

with open("src/components/CheckoutModal.tsx", "w") as f:
    f.write(content)
