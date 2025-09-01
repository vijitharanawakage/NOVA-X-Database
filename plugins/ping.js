const config = require('../settings');
const { cmd, commands } = require('../lib/command');

// ⚡ PING2
cmd({
    pattern: "ping2",
    alias: ["speed", "pong"],
    use: '.ping2',
    desc: "Check bot's response time (alt).",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const text = `> *📍 ɴᴏᴠᴀ-x ᴘɪɴɢ: ${responseTime.toFixed(2)} ᴍs ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409414874042@newsletter',
                    newsletterName: "𝐍ｏ𝐕𝐀-ｘ Ｍ𝐃",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping2 command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// 🍂 MAIN PING
cmd({
    pattern: "ping",
    desc: "Check bot's response time.",
    category: "main",
    react: "🍂",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now();
        const { key } = await conn.sendMessage(from, { text: '*𝙿𝙸𝙽𝙶𝙸𝙽𝙶 𝙽𝙾𝚅𝙰-𝚇...*' });
        const endTime = Date.now();
        const ping = endTime - startTime;
    
        const loadingStages = [
            'ʟᴏᴀᴅɪɴɢ 《 ▭▭▭▭▭▭▭▭▭▭ 》0%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▭▭▭▭▭▭▭▭▭ 》10%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▭▭▭▭▭▭▭▭ 》20%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▭▭▭▭▭▭▭ 》30%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▭▭▭▭▭▭ 》40%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▭▭▭▭▭ 》50%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▭▭▭▭ 》60%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▭▭▭ 》70%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▬▭▭ 》80%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▬▬▭ 》90%',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▬▬▬ 》100%',
            `✅ 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐒𝐩𝐞𝐞𝐝 ${ping} 𝐦𝐬`,
        ];
    
        for (let stage of loadingStages) {
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key,
                        type: 14,
                        editedMessage: { conversation: stage }
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log("Ping failed, fallback to ping2...");
        // fallback -> run ping2
        commands["ping2"].function(conn, mek, m, { from, reply });
    }
});
