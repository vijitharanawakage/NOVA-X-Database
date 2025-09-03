const { cmd } = require("../lib/command");
const { fetchJson } = require("../lib/functions");
const api = `https://nethu-api-ashy.vercel.app`;

let fbSessions = {}; // session storage for reply/number selection

cmd({
  pattern: "facebook2",
  alias: ["fbb2", "fbvideo2", "fb2"],
  react: "🎥",
  desc: "Download videos from Facebook (SD / HD / Audio)",
  category: "download",
  use: ".facebook <facebook_url>",
  filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("🚩 Please give me a facebook url");

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);
    if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
      return reply("❌ I couldn't find any downloadable video.");
    }

    // Save session
    fbSessions[from] = {
      sd: fb.result.sd || null,
      hd: fb.result.hd || null,
      audio: fb.result.audio || null,
    };

    let caption = `*🖥️ 𝐊ꜱᴍ𝐃 𝐅ᴀᴄᴇʙᴏᴏ𝐊 𝐃𝐋*
    
📝 Title : Facebook Video
🔗 Url : ${q}

Select a format:
1. 📺 SD Video
2. 🎬 HD Video
3. 🎵 Audio Only`;

    // Send thumbnail + menu
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

// Handle button clicks & number replies
cmd({
  on: "message",
  fromMe: false,
}, async (conn, mek, m, { from, body }) => {
  try {
    if (!fbSessions[from]) return;

    let choice = null;
    let session = fbSessions[from];

    // Button clicks
    if (body.startsWith("fb:")) {
      choice = body.split(":")[1];
    }

    // Number replies
    if (["1", "2", "3"].includes(body.trim())) {
      if (body.trim() === "1") choice = "sd";
      if (body.trim() === "2") choice = "hd";
      if (body.trim() === "3") choice = "audio";
    }

    if (!choice) return;

    if (choice === "sd" && session.sd) {
      await conn.sendMessage(from, {
        video: { url: session.sd },
        mimetype: "video/mp4",
        caption: "✅ Downloaded as *SD Quality*"
      }, { quoted: mek });
    }

    if (choice === "hd" && session.hd) {
      await conn.sendMessage(from, {
        video: { url: session.hd },
        mimetype: "video/mp4",
        caption: "✅ Downloaded as *HD Quality*"
      }, { quoted: mek });
    }

    if (choice === "audio" && session.audio) {
      await conn.sendMessage(from, {
        audio: { url: session.audio },
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: mek });
    }

    delete fbSessions[from]; // clear session after selection

  } catch (err) {
    console.error("FB Choice Error:", err);
  }
});
