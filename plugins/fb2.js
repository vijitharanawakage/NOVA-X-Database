const { cmd } = require("../lib/command");
const { fetchJson } = require("../lib/functions");
const api = `https://nethu-api-ashy.vercel.app`;

// session store for reply/button
let fbSessions = {};

cmd({
  pattern: "facebook2",
  alias: ["fbb2", "fbvideo2", "fb2"],
  react: "🎥",
  desc: "Download videos from Facebook (SD / HD / Audio)",
  category: "download",
  use: ".facebook2 <facebook_url>",
  filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("🚩 Please give me a Facebook URL");

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);
    if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
      return reply("❌ I couldn't find any downloadable video.");
    }

    // save session
    fbSessions[from] = {
      sd: fb.result.sd || null,
      hd: fb.result.hd || null,
      audio: fb.result.audio || fb.result.hd || fb.result.sd, // fallback
    };

    let caption = `*🖥️ KSMd Facebook DL*\n\n📝 Title: Facebook Video\n🔗 URL: ${q}\n\nSelect a format:\n1. 📺 SD Video\n2. 🎬 HD Video\n3. 🎵 Audio Only`;

    await conn.sendMessage(from, {
      image: { url: fb.result.thumb },
      caption: caption,
      footer: "KSMd Facebook Downloader",
      buttons: [
        { buttonId: "fb:sd", buttonText: { displayText: "📺 SD Video" }, type: 1 },
        { buttonId: "fb:hd", buttonText: { displayText: "🎬 HD Video" }, type: 1 },
        { buttonId: "fb:audio", buttonText: { displayText: "🎵 Audio Only" }, type: 1 },
      ],
      headerType: 4,
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Error while processing Facebook video.");
  }
});

// handle button clicks & number replies
cmd({
  on: "message",
  fromMe: false,
}, async (conn, mek) => {
  try {
    const from = mek.key.remoteJid;
    if (!fbSessions[from]) return;
    const session = fbSessions[from];

    let choice = null;

    // -------- Button Response --------
    if (mek.message.buttonsResponseMessage) {
      choice = mek.message.buttonsResponseMessage.selectedButtonId.split(":")[1];
    }

    // -------- Number Reply --------
    if (mek.message.conversation || mek.message.extendedTextMessage) {
      const text = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
      if (text.trim() === "1") choice = "sd";
      if (text.trim() === "2") choice = "hd";
      if (text.trim() === "3") choice = "audio";
    }

    if (!choice) return;

    if (choice === "sd" && session.sd) {
      await conn.sendMessage(from, { video: { url: session.sd }, mimetype: "video/mp4", caption: "✅ Downloaded as *SD Quality*" }, { quoted: mek });
    } else if (choice === "hd" && session.hd) {
      await conn.sendMessage(from, { video: { url: session.hd }, mimetype: "video/mp4", caption: "✅ Downloaded as *HD Quality*" }, { quoted: mek });
    } else if (choice === "audio" && session.audio) {
      await conn.sendMessage(from, { audio: { url: session.audio }, mimetype: "audio/mpeg", ptt: false }, { quoted: mek });
    }

    delete fbSessions[from]; // clear session

  } catch (err) {
    console.error("FB Choice Error:", err);
  }
});
