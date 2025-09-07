const { cmd } = require('../lib/command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

cmd({
  pattern: "vv",
  react: "👁️",
  desc: "Unlock view once photo/video/audio",
  category: "tools",
  filename: __filename
},
async (conn, mek, m, { reply }) => {
  try {
    if (!m.quoted) return reply("⚠️ Reply to a *view once* message.");

    // Extract real view once message
    let qmsg = m.quoted;
    let vmsg = qmsg.message?.viewOnceMessageV2?.message 
            || qmsg.message?.viewOnceMessageV2Extension?.message;

    if (!vmsg) return reply("⚠️ This is not a view once message.");

    // Detect media type
    let type = Object.keys(vmsg)[0]; // imageMessage / videoMessage / audioMessage
    let msgObj = vmsg[type];
    if (!msgObj) return reply("❌ Unsupported or empty view once content.");

    // Download media
    let buffer = await downloadMediaMessage(
      { message: vmsg },
      "buffer",
      {},
      { reuploadRequest: conn.updateMediaMessage }
    );

    // Add caption if exists
    let caption = msgObj.caption ? msgObj.caption : "";
    if (caption.length > 0) {
      caption = "👁️ ViewOnce Unlocked\n\n" + caption;
    } else {
      caption = "👁️ ViewOnce Unlocked";
    }

    // Send unlocked
    if (type === "imageMessage") {
      await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });
    } else if (type === "videoMessage") {
      await conn.sendMessage(m.chat, { video: buffer, caption }, { quoted: m });
    } else if (type === "audioMessage") {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: "audio/mp4" }, { quoted: m });
    } else {
      reply("⚠️ Only photo/video/audio view once supported.");
    }

  } catch (e) {
    console.error("VV Error:", e);
    reply("❌ Error while unlocking view once message.");
  }
});
