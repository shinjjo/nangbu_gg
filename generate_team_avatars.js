import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const teams = [
    {
        name: "정지선&박은영",
        out: "team_jeong_jiseon_park_eunyoung.png",
        s1: { file: "jeong_jiseon.png", scale: 0.75, offsetX: 0, offsetY: 25 },
        s2: { file: "park_eunyoung.png", scale: 0.95, offsetX: 0, offsetY: -10 }
    },
    {
        name: "김풍&임태훈",
        out: "team_kim_poong_im_taehoon.png",
        s1: { file: "kim_poong.png", scale: 0.85, offsetX: 0, offsetY: 10 },
        s2: { file: "im_taehoon.png", scale: 1.0, offsetX: 0, offsetY: -5 }
    },
    {
        name: "윤남노&권성준",
        out: "team_yoon_namno_kwon_sungjun.png",
        s1: { file: "yoon_namno.png", scale: 0.85, offsetX: 0, offsetY: 15 },
        s2: { file: "kwon_sungjun.png", scale: 1.3, offsetX: 0, offsetY: -10 }
    },
    {
        name: "김풍&손종원",
        out: "team_kim_poong_son_jongwon.png",
        s1: { file: "kim_poong.png", scale: 0.85, offsetX: 0, offsetY: 15 },
        s2: { file: "son_jongwon.png", scale: 1.3, offsetX: 0, offsetY: -10 }
    }
];

const basePath = path.join(process.cwd(), 'public', 'images', 'avatars');

async function processHalf(config, isLeft) {
    const p = path.join(basePath, config.file);
    if (!fs.existsSync(p)) throw new Error(`Missing ${config.file}`);

    let imageBuffer;

    // Original images are 1024x1024
    if (config.scale >= 1.0) {
        // Zoom in: extract a smaller box from 1024x1024 and resize to 1024x1024
        let boxSize = Math.round(1024 / config.scale);
        let left = Math.round((1024 - boxSize) / 2 - config.offsetX * (1024 / 600));
        let top = Math.round((1024 - boxSize) / 2 - config.offsetY * (1024 / 600));

        left = Math.max(0, Math.min(left, 1024 - boxSize));
        top = Math.max(0, Math.min(top, 1024 - boxSize));

        imageBuffer = await sharp(p).extract({ left, top, width: boxSize, height: boxSize }).resize(600, 600, { fit: 'cover' }).toBuffer();
    } else {
        // Zoom out: resize to smaller than 1024x1024, then composite onto a 1024x1024 canvas
        let scaledSize = Math.round(1024 * config.scale);
        let resized = await sharp(p).resize(scaledSize, scaledSize).toBuffer();

        let leftOffset = Math.round((1024 - scaledSize) / 2 + config.offsetX * (1024 / 600));
        let topOffset = Math.round((1024 - scaledSize) / 2 + config.offsetY * (1024 / 600));

        // Clamp offsets so they are >= 0 and <= 1024 - scaledSize
        leftOffset = Math.max(0, Math.min(leftOffset, 1024 - scaledSize));
        topOffset = Math.max(0, Math.min(topOffset, 1024 - scaledSize));

        let fullCanvas = await sharp({
            create: { width: 1024, height: 1024, channels: 4, background: { r: 241, g: 245, b: 249, alpha: 1 } }
        }).composite([{ input: resized, left: leftOffset, top: topOffset }]).png().toBuffer();

        imageBuffer = await sharp(fullCanvas).resize(600, 600, { fit: 'cover' }).toBuffer();
    }

    // Now extract the center 300x600 slice (since imageBuffer is 600x600)
    const half = await sharp(imageBuffer)
        .extract({ left: 150, top: 0, width: 300, height: 600 })
        .toBuffer();

    return half;
}

async function generateAvatars() {
    for (const team of teams) {
        console.log(`Generating team avatar for ${team.name}...`);
        try {
            const img1 = await processHalf(team.s1, true);
            const img2 = await processHalf(team.s2, false);

            const out = path.join(basePath, team.out);

            await sharp({
                create: {
                    width: 600,
                    height: 600,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            })
                .composite([
                    { input: img1, top: 0, left: 0 },
                    { input: img2, top: 0, left: 300 }
                ])
                .png()
                .toFile(out);

            console.log(`Successfully generated ${team.out}`);
        } catch (e) {
            console.error(`Failed ${team.name}:`, e);
        }
    }
}

generateAvatars().catch(console.error);
