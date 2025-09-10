const { cmd } = require("../lib/command");

cmd({
  pattern: "send", // .send ලෙස prefix trigger
  alias: ["sendme", "save", "evpn", "Ewhm", "Evapan", "dapan", "Dapan", "dpn"],
  react: '📤',
  desc: "Forwards quoted message or status/story back to user",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 𝐏ʟᴇᴀꜱᴇ 𝐑ᴇᴘʟʏ 𝐓ᴏ 𝐀 𝐌ᴇꜱꜱᴀɢᴇ / 𝐒ᴛᴀᴛᴜs ...!*"
      }, { quoted: message });
    }

    const quoted = match.quoted;
    const mtype = quoted.mtype;
    const options = { quoted: message };
    let messageContent = {};

    // ✅ Status (view once) or normal media
    if ((mtype === "imageMessage" || mtype === "videoMessage") && quoted.download) {
      const buffer = await quoted.download();
      messageContent = mtype === "imageMessage"
        ? { image: buffer, caption: quoted.text || '', mimetype: quoted.mimetype || "image/jpeg" }
        : { video: buffer, caption: quoted.text || '', mimetype: quoted.mimetype || "video/mp4" };
    } 
    else if (mtype === "viewOnceMessage" && quoted.viewOnceMessage?.message) {
      const inner = quoted.viewOnceMessage.message;
      const innerType = Object.keys(inner)[0]; // imageMessage / videoMessage
      const buffer = await inner[innerType].download();
      messageContent = innerType === "imageMessage"
        ? { image: buffer, caption: inner[innerType].caption || '', mimetype: "image/jpeg" }
        : { video: buffer, caption: inner[innerType].caption || '', mimetype: "video/mp4" };
    } 
    else {
      return await client.sendMessage(from, { text: "❌ Only image/video/status messages are supported!" }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);

  } catch (error) {
    console.error("Send Command Error:", error);
    await client.sendMessage(from, { text: "❌ Error forwarding/downloading message:\n" + error.message }, { quoted: message });
  }
});
