const { cmd } = require('../lib/command');
const os = require("os");
const config = require('../settings');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, jsonformat} = require('../lib/functions');
cmd({
    pattern: "alive",
    alias: ["status", "online", "bot"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
    try {
        // Random English quotes/messages
        const messages = [
            "*💫 Keep shining, the bot is alive and ready...!*",
            "*🔥 Energy high, problems low. I'm online...!*",
            "*✨ Life is awesome..! Bot is up and running...!*",
            "*⚡ Stay focused, stay powerful. Bot active now...!*",
            "*🌟 Happiness is key. Bot online and energized...!*",
            "*💡 Creativity flowing, assistance ready anytime...!*",
            "*🚀 Ready for action...! The bot is fully operational...!*",
            "*🎯 Target achieved: Bot is alive and kicking...!*",
            "*🌈 Spread positivity...! The bot is online...!*",
            "*⚡ Lightning fast...! Bot is ready for commands...!*",
            "*🎉 Celebration time...! The bot is up...!*",
            "*💥 Power mode ON! Bot active...!*",
            "*🌟 Star quality...! I'm online...!*",
            "*🔥 Fuelled with energy! Bot ready...!*",
            "*✨ Magic is real...! Bot alive...!*",
            "*💡 Bright ideas flowing...! Bot at your service...!*",
            "*🚀 Launch sequence complete! I'm online...!*",
            "*🎯 Aim high, bot ready to assist...!*",
            "*⚡ Shockwaves incoming...! Bot is alive...!*",
            "🌈 Rainbow vibes...! Bot active and cheerful..!*"
        ];

        // Pick a random message
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        // 1️⃣ Send the random message first
        await conn.sendMessage(from, { text: randomMsg }, { quoted: mek });

        // Memory
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2); // MB
        const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // MB

        // Uptime
        const uptimeSec = os.uptime();
        const hours = Math.floor(uptimeSec / 3600);
        const minutes = Math.floor((uptimeSec % 3600) / 60);
        const seconds = Math.floor(uptimeSec % 60);

        // Platform & architecture
        const platform = os.platform();
        const arch = os.arch();

        const status = `
╭───〔 *🤖 ${config.BOT_NAME} 𝐒ᴛᴀᴛᴜ𝐒* 〕───◉
│✨ *𝙱𝙾𝚃 𝙸𝚂 𝙰𝙲𝚃𝙸𝚅𝙴 & 𝙾𝙽𝙻𝙸𝙽𝙴..!*
│
│🧠 *ＯＷＮＥＲ:* ${config.OWNER_NAME}
│⚡ *ＶＥＲＳＩＯＮ:* 1.0.0
│📝 *ＰＲＥＦＩＸ:* [${config.PREFIX}]
│📳 *ＭＯＤＥ:* [${config.MODE}]
│💾 *ＲＡＭ:* ${usedMem}MB / ${totalMem}MB
│🖥️ *ＰＬＡＴＦＯＲＭ* : ${platform} (${arch})
│⏱️ *ＵＰＴΙＭＥ* : ${hours}ｈ ${minutes}ｍ ${seconds}ｓ
│
╰─────────────────────────◉
${config.FOOTER}`;

        let buttons = [
                {
        buttonId: ".owner",
        buttonText: { displayText: "OWNER👨‍💻" },
        type: 1
    },
    {
        buttonId: ".ping",
        buttonText: { displayText: "PING🧬" },
        type: 1
    }
];

      
        // 2️⃣ Send image + status in separate message
        await conn.sendMessage(from, {
             buttons,
            headerType: 1,
            viewOnce: true,
            image: { url: "https://files.catbox.moe/er0vnl.png" },
            caption: status,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409414874042@newsletter',
                    newsletterName: '𝐍ｏ𝐕𝐀-ｘ Ｍ𝐃',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
