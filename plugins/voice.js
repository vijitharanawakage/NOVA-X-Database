const fs = require("fs");
const path = require("path");

// voice mapping load
const voiceMap = JSON.parse(fs.readFileSync("./assets/autovoice.json"));

async function handleMessage(conn, m) {
  try {
    const text = (m.body || m.message?.conversation || "").toLowerCase();

    if (voiceMap[text]) {
      let filePath = path.join(__dirname, "assets", voiceMap[text]); 
      // 🛑 media/ folder එකේ audio files තියෙන්න ඕන (hi.m4a, bye.m4a ...)

      let buffer = fs.readFileSync(filePath);
      await conn.sendMessage(m.key.remoteJid, {
        audio: buffer,
        mimetype: "audio/mp4", // m4a කියලා තියෙන නිසා
        ptt: true              // 🎤 Voice note විදිහට යන්න
      }, { quoted: m });
    }
  } catch (e) {
    console.log("Voice auto-send error:", e);
  }
}
