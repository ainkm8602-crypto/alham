const fs = require('fs');
let code = fs.readFileSync('src/components/SectionCmsControl.tsx', 'utf8');

code = code.replace(
  /const updatedFullCms = \{\s*\.\.\.cms,\s*wellnessLifestyleSection: wellnessData,\s*craftPhilosophySection: craftData\s*\};\s*\/\/ 1\. Save to Firestore\s*await setDoc\(doc\(db, 'cms', 'main'\), \{ cms: updatedFullCms, updatedAt: new Date\(\)\.toISOString\(\) \}, \{ merge: true \}\);\s*\/\/ 2\. Sync CMS Context\s*const ok = await updateCms\(updatedFullCms\);/g,
  `const ok = await updateCms({ wellnessLifestyleSection: wellnessData, craftPhilosophySection: craftData });`
);

fs.writeFileSync('src/components/SectionCmsControl.tsx', code);
