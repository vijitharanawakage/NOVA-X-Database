const { cmd } = require('../lib/command');
const os = require("os");
const config = require('../settings');
const moment = require("moment-timezone");
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
        // 🕒 Sri Lanka Time
        const hour = moment().tz("Asia/Colombo").hour();
        const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");  // 📅 Date
        const time = moment().tz("Asia/Colombo").format("HH:mm:ss");   // ⏰ Time

        let greeting;
        if (hour >= 0 && hour < 12) {
            greeting = "*┇ Ｇ𝙾𝙾𝙳 爪𝙾𝚁𝙽𝙸𝙽𝙶 🌞 ┇*";
        } else if (hour >= 12 && hour < 15) {
            greeting = "*┇ Ｇ𝙾𝙾𝙳 Ａ𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 ☀️ ┇*";
        } else if (hour >= 15 && hour < 18) {
            greeting = "*┇ Ｇ𝙾𝙾𝙳 乇𝚅𝙴𝙽𝙸𝙽𝙶 🌇 ┇*";
        } else {
            greeting = "*┇ Ｇ𝙾𝙾𝙳 Ｎ𝙸𝙶Ｈ𝚃 🌙 ┇*";
        }

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
            "*🌈 Rainbow vibes...! Bot active and cheerful..!*"
        ];

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        // 1️⃣ Send the greeting + random message
        await conn.sendMessage(from, { text: `👋 ${greeting}\n${randomMsg}` }, { quoted: mek });

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

        //USER
        const senderName = m.pushName || "User"

        const status = `
👋 𝙷𝙴𝙻𝙻𝙾𝚆 *${senderName}*,

*╭─「 > ᴜꜱᴇʀ 」*
*│* *${senderName}*
*╰──────────●●►*

*╭─「 > ɢʀᴇᴇᴛɪɴɢ 」*
*│* *${greeting}*
*╰──────────●●►*

*╭─「 > ᴅᴀᴛᴇ & ᴛɪᴍᴇ 」*
*│*📅 *Ｄᴀᴛᴇ*: ${date}
*│*⏰ *Ｔɪᴍᴇ*: ${time}
*╰──────────●●►*

👾 Ｗ𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 𝐍ｏ𝐕𝐀-ｘ Ｍ𝐃 👾
╭─────────────────◉
│👨‍💻 *Ｏᴡɴᴇʀ:* ${config.OWNER_NAME}
│⚡ *Ｖᴇʀꜱɪᴏɴ:* 1.0.0
│📝 *Ｐʀᴇꜰɪx:* [${config.PREFIX}]
│📳 *Ｍᴏᴅᴇ:* [${config.MODE}]
│💾 *Ｒᴀᴍ:* ${usedMem}MB / ${totalMem}MB
│🖥️ *Ｐʟᴀᴛꜰᴏʀᴍ* : ${platform} (${arch})
│⏱️ *Ｕᴘᴛɪᴍᴇ* : ${hours}ｈ ${minutes}ｍ ${seconds}ｓ
╰──────────────────◉
${config.FOOTER}`;

        let buttons = [
            {
                buttonId: ".owner",
                buttonText: { displayText: "❭❭ 𝙾𝚆𝙽𝙴𝚁 ✗" },
                type: 1
            },
            {
                buttonId: ".ping",
                buttonText: { displayText: "❭❭ 𝙿𝙸𝙽𝙶 ✗" },
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
