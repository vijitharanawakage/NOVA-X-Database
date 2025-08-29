const config = require('../settings');
const { performance } = require("perf_hooks")
const { cmd } = require('../lib/command')

cmd({
  pattern: "ping",
  desc: "Check bot ping",
  react: "📡",
  filename: __filename
},
async (conn, mek, m) => {
  let start = performance.now()

  // Send initial message
  let loadingMsg = await conn.sendMessage(m.chat, {
    text: "```[░░░░░░░░░░] 0%```"
  }, { quoted: mek })

  const updateMsg = async (text) => {
    await conn.sendMessage(m.chat, { text, edit: loadingMsg.key })
  }

  // Fast progress (200ms each)
  await new Promise(r => setTimeout(r, 200))
  await updateMsg("```[██░░░░░░░░] 20%```")

  await new Promise(r => setTimeout(r, 200))
  await updateMsg("```[████░░░░░░] 40%```")

  await new Promise(r => setTimeout(r, 200))
  await updateMsg("```[██████░░░░] 60%```")

  await new Promise(r => setTimeout(r, 200))
  await updateMsg("```[████████░░] 80%```")

  await new Promise(r => setTimeout(r, 200))
  await updateMsg("```[██████████] 100%✅```")

  // Calculate ping
  let end = performance.now()
  let ping = (end - start).toFixed(0)

  // Final message
  await new Promise(r => setTimeout(r, 200))
  await updateMsg(`*PONG 🏓*\n\n📡 *Response Time:* \`${ping} ms\``)
})
