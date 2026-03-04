import express from 'express';
import path from 'path';

const app = express();
app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    body { font-family: sans-serif; background: #222; color: #fff; text-align: center; }
                    .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 20px; }
                    .team { border: 1px solid #555; padding: 10px; background: #333; border-radius: 8px; }
                    .avatars { display: flex; gap: 10px; margin-bottom: 10px; justify-content: center; }
                    img { width: 150px; height: 150px; object-fit: cover; border-radius: 50%; }
                    .result { width: 300px; height: 300px; object-fit: contain; border-radius: 0; }
                </style>
            </head>
            <body>
                <h1>Team Avatars</h1>
                <div class="container">
                    ${["team_jeong_jiseon_park_eunyoung.png", "team_kim_poong_im_taehoon.png", "team_yoon_namno_kwon_sungjun.png", "team_kim_poong_son_jongwon.png"].map(file => `
                        <div class="team">
                            <h3>${file}</h3>
                            <div class="avatars">
                                <img src="/images/avatars/${file}" class="result" />
                            </div>
                        </div>
                    `).join('')}
                </div>
            </body>
        </html>
    `);
});
app.listen(5174, () => console.log('Listening on http://localhost:5174'));
