const { performance } = require("perf_hooks")
const { cmd } = require('../lib/command')

cmd({
  pattern: "ping",
  desc: "Check bot ping",
  react: "📡",
  filename: __filename

},
async (conn, mek, m) => {
  // start timer
  let start = performance.now()

  // send temporary message
  let sentMsg = await conn.sendMessage(m.chat, { text: "🏓 𝙿𝙸𝙽𝙶𝙸𝙽𝙶 < | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️..." }, { quoted: mek })

  // end timer
  let end = performance.now()
  let ping = (end - start).toFixed(0)

  // edit message with ping result
  await conn.sendMessage(m.chat, { 
    text: `*𝐏𝐎𝐍𝐆 🏓*\n\n📡 ʀᴇꜱᴘᴏɴꜱᴇ ꜱᴘᴇᴇᴅ: \`${ping} ᴍꜱ\`` 
  }, { quoted: mek })
})
