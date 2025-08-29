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
  let sentMsg = await conn.sendMessage(m.chat, { text: "🏓 Pinging..." }, { quoted: mek })

  // end timer
  let end = performance.now()
  let ping = (end - start).toFixed(0)

  // edit message with ping result
  await conn.sendMessage(m.chat, { 
    text: `*PONG 🏓*\n📡 Response Time: \`${ping} ms\`` 
  }, { quoted: mek })
})
