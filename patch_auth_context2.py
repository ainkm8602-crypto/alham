import re

with open("src/context/AuthContext.tsx", "r") as f:
    content = f.read()

old_user = """            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Customer',
              role: 'customer',
              rewardPoints: 0
            };"""

new_user = """            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Customer',
              role: 'customer',
              rewardPoints: 0,
              createdAt: new Date().toISOString()
            };"""

content = content.replace(old_user, new_user)

with open("src/context/AuthContext.tsx", "w") as f:
    f.write(content)
