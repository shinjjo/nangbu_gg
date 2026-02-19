const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inDir = path.join(__dirname, 'public', 'images', 'avatars');
const files = fs.readdirSync(inDir).filter(f => f.endsWith('.png') && f !== 'jeong_jiseon.png' && !f.startsWith('default'));

(async () => {
    console.log(`Starting crop for ${files.length} images...`);
    for (const file of files) {
        const filePath = path.join(inDir, file);
        const tempPath = path.join(inDir, `temp_${file}`);

        try {
            const imageBuffer = fs.readFileSync(filePath);

            // Normalize size first, then crop tightly on the face
            // A 720x720 crop at (x:152, y:80) on a 1024x1024 image removes shoulders and focuses on the head
            await sharp(imageBuffer)
                .resize(1024, 1024)
                .toBuffer()
                .then(data => sharp(data)
                    .extract({ width: 720, height: 720, left: 152, top: 100 })
                    .resize(1024, 1024)
                    .toFile(tempPath)
                );

            fs.renameSync(tempPath, filePath);
            console.log(`✅ Cropped ${file}`);
        } catch (e) {
            console.error(`❌ Error cropping ${file}:`, e.message);
        }
    }
    console.log('Finished cropping all avatars.');
})();
