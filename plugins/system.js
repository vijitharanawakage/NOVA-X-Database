const os = require("os");
const { cmd } = require('../lib/command');

cmd({
  pattern: "system",
  desc: "Show bot system info",
  react: "🖥️",
  filename: __filename
}, async (conn, mek, m) => {
  
  // RAM Usage
  let totalMem = (os.totalmem() / 1024 / 1024).toFixed(2); // MB
  let freeMem = (os.freemem() / 1024 / 1024).toFixed(2); // MB
  let usedMem = (totalMem - freeMem).toFixed(2);

  // Uptime
  let uptimeSec = os.uptime();
  let hours = Math.floor(uptimeSec / 3600);
  let minutes = Math.floor((uptimeSec % 3600) / 60);
  let seconds = Math.floor(uptimeSec % 60);

  // Platform & Owner
  let platform = os.platform();
  let arch = os.arch();

  let msg = `
🖥️ *SYSTEM INFO*

💾 RAM Usage: ${usedMem} MB / ${totalMem} MB
⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
🖧 Platform: ${platform} (${arch})
👤 Owner: Pathum Malsara & Sandesh Bhashana
`;

  await conn.sendMessage(m.chat, { text: msg }, { quoted: mek });
});
