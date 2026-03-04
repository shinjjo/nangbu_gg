const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = '/Users/Shinj/.gemini/antigravity/brain/7eec0a20-b8c0-4d78-8529-42b7787b9ea6';
const destDir = path.join(process.cwd(), 'public', 'images', 'avatars');

const srcName = 'takada_v3_1772489086711.png';
const destName = 'takada.png';

(async () => {
    const srcPath = path.join(brainDir, srcName);
    const destPath = path.join(destDir, destName);
    const tempPath = path.join(destDir, `temp_${destName}`);
    try {
        fs.copyFileSync(srcPath, destPath);
        const imageBuffer = fs.readFileSync(destPath);
        await sharp(imageBuffer)
            .resize(1024, 1024)
            .toBuffer()
            .then(data => sharp(data)
                .extract({ width: 780, height: 780, left: 122, top: 40 })
                .resize(1024, 1024)
                .toFile(tempPath)
            );
        fs.renameSync(tempPath, destPath);
        console.log(`✅ Cropped ${destName}`);
    } catch (e) {
        console.error(`❌ Error:`, e.message);
    }
})();
