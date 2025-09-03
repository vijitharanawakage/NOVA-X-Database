const { cmd } = require('../lib/command');
const config = require('../settings');
const { fetchJson } = require('../lib/functions');

const api = `https://nethu-api-ashy.vercel.app`;

// ================== MAIN COMMAND ==================
cmd({
  pattern: "facebook",
  alias: ["fb", "fbb", "fbvideo"],
  react: "🎥",
  desc: "Download videos from Facebook",
  category: "download",
  use: ".facebook <url>",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("🚩 Please provide a valid Facebook URL.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);

    if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
      return reply("❌ Couldn't fetch download links.");
    }

    let caption = `*🖥️ KSMD Facebook Downloader*

🔗 URL: ${q}
📌 Select a format:`;

    // Buttons
    const buttons = [];
    if (fb.result.sd) {
      buttons.push({ buttonId: `.fbdl sd ${q}`, buttonText: { displayText: "📥 SD QUALITY" }, type: 1 });
    }
    if (fb.result.hd) {
      buttons.push({ buttonId: `.fbdl hd ${q}`, buttonText: { displayText: "🎥 HD QUALITY" }, type: 1 });
    }

    // Send thumbnail + caption + buttons + number options
    await conn.sendMessage(from, {
      image: { url: fb.result.thumb },
      caption: caption + `\n\n1. 📥 SD Quality\n2. 🎥 HD Quality\n\n_Reply with 1 or 2 too_`,
      footer: "Powered by KSMD",
      buttons,
      headerType: 4
    }, { quoted: mek });

    // Save session for reply
    global.fbSessions = global.fbSessions || {};
    global.fbSessions[from] = { url: q, sd: fb.result.sd, hd: fb.result.hd };

  } catch (err) {
    console.error(err);
    reply("❌ Error fetching video.");
  }
});

// ================== HANDLE BUTTON COMMAND ==================
cmd({
  pattern: "fbdl",
  desc: "Download selected Facebook format",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { args, from, reply }) => {
  try {
    const type = args[0];
    const url = args[1];
    if (!url) return reply("❌ Invalid request.");

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(url)}`);

    if (type === "sd" && fb.result.sd) {
      await conn.sendMessage(from, { video: { url: fb.result.sd }, caption: "📥 *SD Quality*" }, { quoted: mek });
    } else if (type === "hd" && fb.result.hd) {
      await conn.sendMessage(from, { video: { url: fb.result.hd }, caption: "🎥 *HD Quality*" }, { quoted: mek });
    } else {
      reply("❌ Format not available.");
    }
  } catch (err) {
    console.error(err);
    reply("❌ Error downloading.");
  }
});

// ================== HANDLE NUMBER REPLY ==================
cmd({
  on: "message"
}, async (conn, mek, m, { body, from }) => {
  try {
    if (!global.fbSessions || !global.fbSessions[from]) return;
    const session = global.fbSessions[from];

    if (body === "1" && session.sd) {
      await conn.sendMessage(from, { video: { url: session.sd }, caption: "📥 *SD Quality*" }, { quoted: mek });
      delete global.fbSessions[from];
    } else if (body === "2" && session.hd) {
      await conn.sendMessage(from, { video: { url: session.hd }, caption: "🎥 *HD Quality*" }, { quoted: mek });
      delete global.fbSessions[from];
    }
  } catch (e) {
    console.error(e);
  }
});
