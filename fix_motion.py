import re

# 1. CartContext.tsx
with open("src/context/CartContext.tsx", "r") as f:
    content = f.read()

content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "")
content = content.replace("<AnimatePresence>", "")
content = content.replace("</AnimatePresence>", "")
content = content.replace("<motion.div", "<div")
content = content.replace("</motion.div>", "</div>")
# remove motion specific props
content = re.sub(r'initial=\{\{[^}]+\}\}', '', content)
content = re.sub(r'animate=\{\{[^}]+\}\}', '', content)
content = re.sub(r'exit=\{\{[^}]+\}\}', '', content)
content = re.sub(r'transition=\{\{[^}]+\}\}', '', content)

with open("src/context/CartContext.tsx", "w") as f:
    f.write(content)

# 2. Navbar.tsx
with open("src/components/Navbar.tsx", "r") as f:
    content = f.read()

content = content.replace("import { motion } from 'motion/react';", "")
content = content.replace("<motion.button", "<button")
content = content.replace("</motion.button>", "</button>")
content = content.replace("<motion.span", "<span")
content = content.replace("</motion.span>", "</span>")
content = re.sub(r'initial=\{\{[^}]+\}\}', '', content)
content = re.sub(r'animate=\{\{[^}]+\}\}', '', content)
content = re.sub(r'transition=\{\{[^}]+\}\}', '', content)

with open("src/components/Navbar.tsx", "w") as f:
    f.write(content)

# 3. HeroSection.tsx
with open("src/components/HeroSection.tsx", "r") as f:
    content = f.read()

content = content.replace("import { motion } from 'motion/react';", "")
content = content.replace("<motion.div", "<div")
content = content.replace("</motion.div>", "</div>")
content = re.sub(r'initial=\{\{[^}]+\}\}', '', content)
content = re.sub(r'animate=\{\{[^}]+\}\}', '', content)
content = re.sub(r'transition=\{\{[^}]+\}\}', '', content)

with open("src/components/HeroSection.tsx", "w") as f:
    f.write(content)

# 4. ProductCard.tsx
with open("src/components/ProductCard.tsx", "r") as f:
    content = f.read()

content = content.replace("import { motion } from 'motion/react';", "")
content = content.replace("<motion.button", "<button")
content = content.replace("</motion.button>", "</button>")
content = content.replace("<motion.div", "<div")
content = content.replace("</motion.div>", "</div>")
content = re.sub(r'initial=\{\{[^}]+\}\}', '', content)
content = re.sub(r'animate=\{\{[^}]+\}\}', '', content)
content = re.sub(r'whileTap=\{\{[^}]+\}\}', '', content)
content = re.sub(r'transition=\{\{[^}]+\}\}', '', content)

with open("src/components/ProductCard.tsx", "w") as f:
    f.write(content)

print("Motion removed successfully.")
