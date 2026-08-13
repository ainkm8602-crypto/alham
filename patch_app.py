import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("import { CmsProvider, useCms } from './context/CmsContext';", "import { CmsProvider, useCms } from './context/CmsContext';\nimport { TrackingProvider } from './components/TrackingProvider';")

content = content.replace(
    "<CmsProvider>\n            <MainAppContent />\n          </CmsProvider>",
    "<CmsProvider>\n            <TrackingProvider>\n              <MainAppContent />\n            </TrackingProvider>\n          </CmsProvider>"
)

with open("src/App.tsx", "w") as f:
    f.write(content)
