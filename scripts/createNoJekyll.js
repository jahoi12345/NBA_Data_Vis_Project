import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create .nojekyll file in dist folder
const distPath = join(process.cwd(), 'dist');
try {
  mkdirSync(distPath, { recursive: true });
  writeFileSync(join(distPath, '.nojekyll'), '');
  console.log('✅ Created .nojekyll file in dist folder');
} catch (error) {
  console.error('❌ Error creating .nojekyll file:', error);
  process.exit(1);
}

