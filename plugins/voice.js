const fs = require("fs");
const path = require("path");

let voiceMap = {};
try {
    voiceMap = JSON.parse(fs.readFileSync(path.join(__dirname, "../assets/autovoice.json")));
} catch (e) {
    console.error("⚠️ autovoice.json not found or invalid JSON!");
    voiceMap = {};
}

const { cmd } = require("../lib/command");

cmd({
    on: "text" // all text messages
}, async (conn, mek, m) => {
    try {
        const body = (m.text || "").toLowerCase(); // user message (lowercase)
        if (!body) return;

        for (const key in voiceMap) {
            if (body.includes(key.toLowerCase())) {
                const filePath = path.join(__dirname, "../assets", voiceMap[key]);
                if (fs.existsSync(filePath)) {
                    await conn.sendMessage(m.chat, {
                        audio: { url: filePath },
                        mimetype: "audio/mpeg",
                        ptt: true // send as voice note
                    }, { quoted: mek });
                    console.log(`✅ AutoVoice sent: ${voiceMap[key]} for keyword "${key}"`);
                    return;
                } else {
                    console.log(`⚠️ File not found: ${filePath}`);
                }
            }
        }
    } catch (err) {
        console.error("❌ Voice Plugin Error:", err);
    }
});
