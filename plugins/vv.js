const { cmd } = require("../lib/command");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

cmd({
  pattern: "vv",
  alias: ["viewonce", "retrieve"],
  react: "🐳",
  desc: "Owner Only - retrieve quoted view once message",
  category: "owner",
  filename: __filename,
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, { text: "📛 This is an *owner only* command." }, { quoted: message });
    }

    if (!message.quoted) {
      return await client.sendMessage(from, { text: "🍁 Please reply to a *view once* message!" }, { quoted: message });
    }

    let quoted = message.quoted;
    let viewOnceMsg = quoted.msg?.viewOnceMessageV2 || quoted.msg?.viewOnceMessageV2Extension;

    if (!viewOnceMsg) {
      return await client.sendMessage(from, { text: "❌ That’s not a *view once* message." }, { quoted: message });
    }

    const realMsg = viewOnceMsg.message;
    const mtype = Object.keys(realMsg)[0]; // imageMessage / videoMessage

    const buffer = await downloadMediaMessage(
      { message: realMsg },
      "buffer",
      {},
      { logger: client.logger, reuploadRequest: client.updateMediaMessage }
    );

    if (!buffer) {
      return await client.sendMessage(from, { text: "❌ Failed to retrieve media." }, { quoted: message });
    }

    if (mtype === "imageMessage") {
      await client.sendMessage(from, { image: buffer, caption: "🔓 Unlocked ViewOnce Image" }, { quoted: message });
    } else if (mtype === "videoMessage") {
      await client.sendMessage(from, { video: buffer, caption: "🔓 Unlocked ViewOnce Video" }, { quoted: message });
    } else {
      await client.sendMessage(from, { text: "❌ Only image/video view once supported." }, { quoted: message });
    }

  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, { text: "❌ Error fetching vv:\n" + error.message }, { quoted: message });
  }
});
