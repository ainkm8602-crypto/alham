const fs = require('fs');
let code = fs.readFileSync('src/components/SectionCmsControl.tsx', 'utf8');

// For wellness upload
code = code.replace(
  /const updatedFullCms = \{ \.\.\.cms, wellnessLifestyleSection: updatedWellness \};\s*\/\/ 1\. Direct update to Firestore document for real-time trigger\s*await setDoc\(doc\(db, 'cms', 'main'\), \{ cms: updatedFullCms, updatedAt: new Date\(\)\.toISOString\(\) \}, \{ merge: true \}\);\s*\/\/ 2\. Update CMS context\s*await updateCms\(updatedFullCms\);/g,
  `await updateCms({ wellnessLifestyleSection: updatedWellness });`
);

// For craft upload
code = code.replace(
  /const updatedFullCms = \{ \.\.\.cms, craftPhilosophySection: updatedCraft \};\s*\/\/ Direct update to Firestore\s*await setDoc\(doc\(db, 'cms', 'main'\), \{ cms: updatedFullCms, updatedAt: new Date\(\)\.toISOString\(\) \}, \{ merge: true \}\);\s*\/\/ Update CMS Context\s*await updateCms\(updatedFullCms\);/g,
  `await updateCms({ craftPhilosophySection: updatedCraft });`
);

fs.writeFileSync('src/components/SectionCmsControl.tsx', code);
