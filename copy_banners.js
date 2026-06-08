const fs = require('fs');
const path = require('path');

const srcDir = '/Users/mac/.gemini/antigravity-ide/brain/dd71d876-226a-4e97-a3ed-61c695ab77bf';
const destDir = '/Users/mac/Desktop/Pay Chain Muzamil Hussain/PayChain-Ai/public/images';

const paths = {
  'threat_banner_1_1780890765950.png': [
    'blog/blog-card-01.jpg',
    'blog/blog-grid-01.jpg',
    'blog/blog-single-01.png'
  ],
  'threat_banner_2_1780890801038.png': [
    'blog/blog-card-02.jpg',
    'blog/blog-grid-02.jpg',
    'blog/blog-single-02.png'
  ],
  'threat_banner_3_1780890837900.png': [
    'blog/blog-card-03.jpg',
    'blog/blog-grid-03.jpg',
    'blog/blog-single-03.png'
  ],
  'threat_banner_4_1780890882256.png': [
    'blog/blog-card-04.jpg',
    'blog/blog-grid-04.jpg',
    'blog/blog-single-04.png',
    'blog/blog-bl-02.jpg'
  ],
  'threat_banner_5_1780890928117.png': [
    'blog/blog-card-05.jpg',
    'blog/blog-grid-05.jpg',
    'blog/blog-gallery-01.jpg'
  ],
  'threat_banner_6_1780890978668.png': [
    'blog/blog-card-06.jpg',
    'blog/blog-card-07.jpg',
    'blog/blog-grid-06.jpg',
    'blog/blog-gallery-02.jpg',
    'blog/blog-gallery-03.jpg'
  ]
};

Object.entries(paths).forEach(([srcFile, destFiles]) => {
  const srcPath = path.join(srcDir, srcFile);
  if (!fs.existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    return;
  }
  destFiles.forEach(destFile => {
    const destPath = path.join(destDir, destFile);
    const destFolder = path.dirname(destPath);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcFile} -> ${destFile}`);
  });
});
