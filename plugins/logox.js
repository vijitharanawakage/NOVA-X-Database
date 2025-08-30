nst { cmd } = require("../lib/command");
const { fetchJson } = require("../lib/functions");
const config = require("../settings");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, jsonformat} = require('../lib/functions');

cmd({
    pattern: "logo2",
    desc: "Create logos",
    category: "convert",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*_Please give me a text._*");

        if (config.BUTTON === 'true') {
            // Select Button (Native Flow)
            const buttonSections = [
                {
                    title: "Choose Logo Style",
                    rows: [
                        { title: "1. Black Pink", id: `logo 1|${q}` },
                        { title: "2. Black Pink 2", id: `logo 2|${q}` },
                        { title: "3. Black Pink 3", id: `logo 3|${q}` },
                        { title: "4. Naruto", id: `logo 4|${q}` },
                        { title: "5. Digital Glitch", id: `logo 5|${q}` },
                        { title: "6. Pixel Glitch", id: `logo 6|${q}` },
                        { title: "7. Comic Style", id: `logo 7|${q}` },
                        { title: "8. Neon Light", id: `logo 8|${q}` },
                        { title: "9. Free Bear", id: `logo 9|${q}` },
                        { title: "10. Devil Wings", id: `logo 10|${q}` },
                        { title: "11. Futuristic Technology", id: `logo 11|${q}` },
                        { title: "12. Silver 3D", id: `logo 12|${q}` },
                        { title: "13. 3D Paper Cut", id: `logo 13|${q}` },
                        { title: "14. Pubg 1", id: `logo 14|${q}` },
                        { title: "15. Pubg 2", id: `logo 15|${q}` },
                        { title: "16. Free Fire Cover", id: `logo 16|${q}` },
                        { title: "17. Text On Wet Glass", id: `logo 17|${q}` },
                        { title: "18. Typography", id: `logo 18|${q}` },
                        { title: "19. Modern Gold", id: `logo 19|${q}` },
                        { title: "20. Matrix", id: `logo 20|${q}` }
                    ]
                }
            ];

            await conn.sendMessage(from, {
                text: `*NOVA-X LOGO CREATION📨*\n\n*Text:* ${q}\n\n📌 Select a style below:`,
                footer: "Powered by NOVA-X MD",
                buttons: [
                    {
                        buttonId: "select_logo",
                        buttonText: { displayText: "🎨 Select Style" },
                        type: 4,
                        nativeFlowInfo: {
                            name: "single_select",
                            paramsJson: JSON.stringify({
                                title: "Choose Logo Style",
                                sections: buttonSections
                            })
                        }
                    }
                ]
            }, { quoted: mek });

        } else {
            // Old Reply Number System
            let logoMsg = `*NOVA-X LOGO CREATION📨*\n\n*Text :* ${q}\n\n*🔢 Reply Below Number :*\n╭━━━━━━━━━━━━━━━➤\n┃ 1. Black Pink\n┃ 2. Black Pink 2\n┃ 3. Black Pink 3\n┃ 4. Naruto\n┃ 5. Digital Glitch\n┃ 6. Pixel Glitch\n┃ 7. Comic Style\n┃ 8. Neon Light\n┃ 9. Free Bear\n┃ 10. Devil Wings\n┃ 11. Futuristic Tech\n┃ 12. Silver 3D\n┃ 13. 3D Paper Cut\n┃ 14. Pubg 1\n┃ 15. Pubg 2\n┃ 16. Free Fire Cover\n┃ 17. Text On Wet Glass\n┃ 18. Typography\n┃ 19. Modern Gold\n┃ 20. Matrix\n╰━━━━━━━━━━━━━━━➤\n\n> Reply with a number`;
            await conn.sendMessage(from, { text: logoMsg }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
