const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('SafeAreaView') && content.includes('container: {')) {
    // If RN import doesn't have Platform or StatusBar, add them.
    const rnMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]react-native['"];/);
    if (rnMatch) {
      let imports = rnMatch[1];
      let importChanged = false;
      if (!imports.includes('Platform')) {
        imports += ', Platform';
        importChanged = true;
      }
      if (!imports.includes('StatusBar')) {
        imports += ', StatusBar';
        importChanged = true;
      }
      if (importChanged) {
        content = content.replace(rnMatch[0], `import {${imports}} from 'react-native';`);
        changed = true;
      }
    }

    if (!content.includes('paddingTop: Platform.OS')) {
      const contMatch = content.match(/container:\s*\{\s*flex:\s*1,\s*backgroundColor:\s*['"][^'"]+['"],?(?!\s*paddingTop)/);
      if (contMatch) {
        content = content.replace(contMatch[0], contMatch[0] + '\n    paddingTop: Platform.OS === \'android\' ? (StatusBar.currentHeight || 0) : 0,');
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + file);
    }
  }
});
