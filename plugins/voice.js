const fs = require("fs");
const path = require("path");
const { cmd } = require("../lib/command");

let voiceMap = {};
try {
    voiceMap = JSON.parse(fs.readFileSync(path.join(__dirname, "../assets/autovoice.json")));
    console.log("✅ autovoice.json loaded");
} catch (e) {
    console.error("❌ autovoice.json load error:", e.message);
    voiceMap = {};
}

cmd({
    on: "text"
}, async (conn, mek, m) => {
    const text = (m.text || "").toLowerCase();
    if (!text) return;

    for (const key in voiceMap) {
        if (text.includes(key.toLowerCase())) {
            const file = path.join(__dirname, "../assets", voiceMap[key]);
            if (fs.existsSync(file)) {
                await conn.sendMessage(m.chat, {
                    audio: { url: file },
                    mimetype: "audio/mpeg",
                    ptt: true
                }, { quoted: mek });
                console.log(`🎤 Sent voice for "${key}" → ${voiceMap[key]}`);
            } else {
                console.log(`⚠️ Missing file: ${file}`);
            }
            break;
        }
    }
});
