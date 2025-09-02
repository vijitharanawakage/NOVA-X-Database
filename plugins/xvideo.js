const axios = require("axios");
const config = require('../settings');
const { cmd } = require("../lib/command");

cmd({
  pattern: "xsearch",
  react: "🔞",
  desc: "Search adult videos from xnxx",
  category: "adult",
  use: ".xsearch <query>",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  const query = args.join(" ");
  if (!query) return reply("*⚡ Please provide a search query..!*\nExample: *.xsearch big boobs*");

  await reply("> 🔍 ＳᴇＡʀＣʜＩɴＧ ＶɪＤᴇＯꜱ...");

  try {
    const api = `https://api-aswin-sparky.koyeb.app/api/search/xnxx?search=${encodeURIComponent(query)}`;
    const { data } = await axios.get(api);

    if (!data?.status || !data.result?.status || !Array.isArray(data.result.result)) {
      return reply("❌ Failed to fetch search results!");
    }

    const results = data.result.result;
    if (results.length === 0) {
      return reply("❌ No videos found for your query!");
    }

    // only show first 5
    const sliced = results.slice(0, 5);

    let textMsg = `🔞 𝐍ᴏᴠᴀ-𝐗 18+ 𝐕ɪᴅᴇ𝐎 𝐒ᴇᴀʀᴄʜ𝐇 📥\n\n`;
    textMsg += `~*Search Results For:*~ ${query}\n\n`;

    const sections = [
      {
        title: "📥 Ｄᴏᴡɴʟᴏᴀᴅ Ｏᴘᴛɪᴏɴꜱ",
        rows: sliced.map((v, i) => ({
          title: v.title,
          rowId: `.xvideo ${v.link}`,
          description: v.info.replace(/\n/g, " ").trim()
        }))
      }
    ];

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "🔞 𝐍ᴏᴠᴀ-x 𝐌ᴅ 𝐗ᴠɪᴅᴇᴏ 𝐃ᴏᴡɴʟᴏᴀᴅᴇʀ\n\n> ву ѕαη∂єѕн внαѕнαηα χ ραтнυм мαℓѕαяα",
      title: "𝚂𝙴𝙻𝙴𝙲𝚃 𝙰 𝚅𝙸𝙳𝙴𝙾 𝚃𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳",
      buttonText: "ＲＥＳＵＬＴＳ",
      sections
    }, { quoted: mek });

  } catch (e) {
    console.log("XNXX Search Error:", e);
    reply("❌ Error occurred while searching videos.");
  }
});

cmd({
  pattern: "xvideo",
  react: "⬇️",
  desc: "Download adult video from xnxx",
  category: "adult",
  use: ".xvideo <link>",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  const url = args[0];
  if (!url) return reply("*⚡ Please provide a valid xnxx URL...!*\nExample: *.xvideo https://www.xvideos.com/videoXXXXX/title*");

  await reply("_*⏳ Ｆ𝙴𝚃𝙲𝙷𝙸𝙽𝙶 Ｖ𝙸𝙳𝙴𝙾 Ｄ𝙴𝚃𝙰𝙸𝙻𝚂....*_");

  try {
    const api = `https://api-aswin-sparky.koyeb.app/api/downloader/xnxx?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(api);

    if (!data?.status || !data.data?.files) {
      return reply("❌ Failed to fetch video. Try another link!");
    }

    const videoData = data.data;
    const videoUrl = videoData.files.high || videoData.files.low;
    if (!videoUrl) return reply("❌ No downloadable video found!");

    const title = videoData.title || "xnxx_video";
    const duration = videoData.duration || "Unknown";

    let caption = `🔞 _*${title}*_\n⏱ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${duration} Sec\n\n${config.FOOTER}`;

    // file size check
    let fileSize = 0;
    try {
      const head = await axios.head(videoUrl);
      fileSize = parseInt(head.headers["content-length"] || "0");
    } catch { }

    const maxSize = 64 * 1024 * 1024; // 64MB WhatsApp limit
    if (fileSize && fileSize > maxSize) {
      return reply(`*⚠️ File too large for WhatsApp..!*\n_Please Download Manually It:_\n${videoUrl}\n\n${config.FOOTER}`);
    }

    await conn.sendMessage(mek.chat, {
      document: { url: videoUrl },
      mimetype: "video/mp4",
      fileName: `${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 32)}.mp4`,
      caption: caption
    }, { quoted: mek });

