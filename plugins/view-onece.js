const { cmd } = require('../lib/command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

cmd({
  pattern: "vv",
  react: "👁️",
  desc: "View once message unlocker",
  category: "tools",
  filename: __filename
},
async (conn, mek, m, { reply }) => {
  try {
    if (!m.quoted) return reply("⚠️ Reply to a *view once* message.");

    let qmsg = m.quoted;

    // check view once
    let vmsg = qmsg.message?.viewOnceMessageV2?.message 
            || qmsg.message?.viewOnceMessageV2Extension?.message;
    if (!vmsg) return reply("⚠️ This is not a view once message.");

    let type = Object.keys(vmsg)[0]; // imageMessage / videoMessage / audioMessage
    let msgObj = vmsg[type];
    if (!msgObj) return reply("❌ Unsupported media type.");

    // download buffer
    let buffer = await downloadMediaMessage(
      { message: vmsg },
      "buffer",
      {},
      { reuploadRequest: conn.updateMediaMessage }
    );

    // caption if available
    let caption = msgObj.caption ? msgObj.caption : "";
    caption = "👁️ ViewOnce Unlocked\n\n" + caption;

    // send back unlocked
    await conn.sendMessage(m.chat, { [type]: buffer, caption }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply("❌ Error while unlocking view once message.");
  }
});
