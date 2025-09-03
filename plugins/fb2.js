const { cmd } = require('../lib/command');
const { fetchJson } = require('../lib/functions');

const api = `https://nethu-api-ashy.vercel.app`;
global.fbDlSessions = global.fbDlSessions || {};

cmd({
  pattern: "facebook",
  react: "🎥",
  alias: ["fbb", "fbvideo", "fb"],
  desc: "Download videos from Facebook",
  category: "download",
  use: '.facebook <facebook_url>',
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("🚩 Please give me a facebook url");

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);
    if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
      return reply("❌ I couldn't find anything.");
    }

    let caption = `*🖥️ KSMd Facebook DL*\n\n🔗 URL : ${q}`;
    if (fb.result.thumb) {
      await conn.sendMessage(from, { image: { url: fb.result.thumb }, caption }, { quoted: mek });
    }

    // -------- BUTTONS --------
    let buttons = [];
    if (fb.result.sd) buttons.push({ buttonId: `fb_dl sd ${encodeURIComponent(q)}`, buttonText: { displayText: "📹 Download SD" }, type: 1 });
    if (fb.result.hd) buttons.push({ buttonId: `fb_dl hd ${encodeURIComponent(q)}`, buttonText: { displayText: "🎬 Download HD" }, type: 1 });
    if (fb.result.sd || fb.result.hd) buttons.push({ buttonId: `fb_dl audio ${encodeURIComponent(q)}`, buttonText: { displayText: "🎧 Audio Only" }, type: 1 });

    await conn.sendMessage(from, {
      text: "📥 Select download option (use buttons or reply with number):",
      footer: "KSMd FB Downloader",
      buttons,
      headerType: 4
    }, { quoted: mek });

    // -------- REPLY NUMBERS --------
    let msg = `📥 *Select download option (Reply number):*\n\n`;
    let opts = [];
    if (fb.result.sd) { msg += `1. 📹 Download SD\n`; opts.push("sd"); }
    if (fb.result.hd) { msg += `2. 🎬 Download HD\n`; opts.push("hd"); }
    msg += `${opts.length + 1}. 🎧 Audio Only\n\n_Reply with the number._`;

    let sent = await reply(msg);
    global.fbDlSessions[sent.key.id] = { url: q, opts, from };

  } catch (err) {
    console.error(err);
    reply("> *ERROR FB CMD IN KSMD BOT*");
  }
});

// -------- BUTTON HANDLER --------
cmd({
  pattern: "fb_dl",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  let [quality, ...rest] = args;
  let url = decodeURIComponent(rest.join(" "));

  const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(url)}`);
  if (!fb.result) return reply("❌ File not found.");

  if (quality === "sd" && fb.result.sd) {
    return conn.sendMessage(from, { video: { url: fb.result.sd }, mimetype: "video/mp4", caption: `✅ Downloaded as *SD*` }, { quoted: mek });
  }
  if (quality === "hd" && fb.result.hd) {
    return conn.sendMessage(from, { video: { url: fb.result.hd }, mimetype: "video/mp4", caption: `✅ Downloaded as *HD*` }, { quoted: mek });
  }
  if (quality === "audio" && (fb.result.sd || fb.result.hd)) {
    let audioUrl = fb.result.hd || fb.result.sd;
    return conn.sendMessage(from, { audio: { url: audioUrl }, mimetype: "audio/mpeg", caption: `✅ Downloaded as *Audio*` }, { quoted: mek });
  }
  reply("❌ Option not available.");
});

// -------- REPLY NUMBER HANDLER --------
cmd({
  pattern: ".*",
  dontAddCommandList: true,
  filename: __filename
}, async (conn, mek, m, { body, from }) => {
  if (!body || !mek.message?.extendedTextMessage?.contextInfo?.stanzaId) return;

  let replyId = mek.message.extendedTextMessage.contextInfo.stanzaId;
  let sess = global.fbDlSessions[replyId];
  if (!sess) return;

  const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(sess.url)}`);
  let choice = parseInt(body);

  if (choice === 1 && fb.result.sd) {
    await conn.sendMessage(from, { video: { url: fb.result.sd }, mimetype: "video/mp4", caption: "✅ Downloaded as *SD*" }, { quoted: mek });
  } else if (choice === 2 && fb.result.hd) {
    await conn.sendMessage(from, { video: { url: fb.result.hd }, mimetype: "video/mp4", caption: "✅ Downloaded as *HD*" }, { quoted: mek });
  } else {
    await conn.sendMessage(from, { audio: { url: fb.result.hd || fb.result.sd }, mimetype: "audio/mpeg", caption: "✅ Downloaded as *Audio*" }, { quoted: mek });
  }

  delete global.fbDlSessions[replyId];
});
