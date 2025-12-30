import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const distIndexPath = join(process.cwd(), 'dist', 'index.html');

if (!existsSync(distIndexPath)) {
  console.error('❌ dist/index.html not found. Run npm run build first.');
  process.exit(1);
}

const html = readFileSync(distIndexPath, 'utf-8');
const basePath = '/NBA_Data_Vis_Project/';

// Check if assets are using the base path
const assetReferences = html.match(/href="([^"]+)"|src="([^"]+)"/g) || [];
const incorrectPaths = assetReferences.filter(ref => {
  const path = ref.match(/="([^"]+)"/)?.[1];
  return path && path.startsWith('/') && !path.startsWith(basePath) && 
         (path.includes('assets/') || path.includes('.css') || path.includes('.js'));
});

if (incorrectPaths.length > 0) {
  console.error('❌ Found asset paths without base path:');
  incorrectPaths.forEach(path => console.error('  ', path));
  console.error('\n⚠️  Vite should automatically prepend the base path.');
  console.error('   Check that vite.config.js has base: "/NBA_Data_Vis_Project/"');
  process.exit(1);
} else {
  console.log('✅ All asset paths include the base path correctly');
  
  // Show some example paths
  const examplePaths = assetReferences.slice(0, 3);
  console.log('\nExample asset paths:');
  examplePaths.forEach(ref => {
    const path = ref.match(/="([^"]+)"/)?.[1];
    if (path) console.log('  ', path);
  });
}

