const { performance } = require("perf_hooks") 
const { cmd } = require('../lib/command')

// 🔹 ping2 command (default fallback)
cmd({
  pattern: "ping2",
  desc: "Check bot ping",
  react: "📡",
  filename: __filename

},
async (conn, mek, m) => {
  // start timer
  let start = performance.now()

  // send temporary message
  let sentMsg = await conn.sendMessage(m.chat, { text: "🏓 Pinging..." }, { quoted: mek })

  // end timer
  let end = performance.now()
  let ping = (end - start).toFixed(0)

  // edit message with ping result
  // final ping message
const text = `*PONG 🏓*\n📡 Response Time: \`${ping} ms\` ${reactionEmoji}`;
await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
    }
}, { quoted: mek });


    } catch (e) {
        console.error("ping2 error:", e);
        reply(`ping2 fallback failed: ${e.message}`);
    }
});

// 🔹 ping command (with auto fallback to ping2)
cmd({
    pattern: "ping",
    desc: "Check bot's response time.",
    category: "main",
    react: "📡",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        const start = new Date().getTime();
        const { key } = await conn.sendMessage(from, { text: '*𝙿𝙸𝙽𝙶𝙸𝙽𝙶 𝙺𝚂𝙼𝙳...*' });
        const end = new Date().getTime();
        const ping = end - start;

        const loadingStages = [
            'ʟᴏᴀᴅɪɴɢ 《 ▭▭▭▭▭▭▭▭▭▭ 》0%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▭▭▭▭▭▭▭▭▭ 》10%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▭▭▭▭▭▭▭▭ 》20%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▭▭▭▭▭▭▭ 》30%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▭▭▭▭▭▭ 》40%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▭▭▭▭▭ 》50%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▭▭▭▭ 》60%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▭▭▭ 》70%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▬▭▭ 》80%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▬▬▭ 》90%,',
            'ʟᴏᴀᴅɪɴɢ 《 ▬▬▬▬▬▬▬▬▬▬ 》100%,',
            `𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐒𝐩𝐞𝐞𝐝 ${ping} 𝐦𝐬`
        ];

        for (let i = 0; i < loadingStages.length; i++) {
            await conn.relayMessage(from, {
                protocolMessage: {
                    key: key,
                    type: 14,
                    editedMessage: { conversation: loadingStages[i] }
                }
            }, {});
        }
    } catch (e) {
        console.log("ping error:", e);
        // Auto fallback to ping2
        await cmd.commands.get("ping2").callback(conn, mek, m, { from, quoted, sender: m.sender, reply });
    }
});
