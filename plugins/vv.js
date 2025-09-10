const { cmd } = require("../lib/command");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

cmd({
    pattern: "vv3",
    desc: "Unlock view once media",
    category: "utility",
    use: ".vv (Reply to a view once message)",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        if (!mek.quoted) return reply("⚠️ Reply to a *view once* photo or video with `.vv`");

        // quoted full object
        const qmsg = mek.quoted.message || {};

        // check view once
        if (!(qmsg.viewOnceMessageV2 || qmsg.viewOnceMessageV2Extension)) {
            return reply("❌ This is not a *view once* message.");
        }

        // Extract real msg inside
        const realMsg = qmsg.viewOnceMessageV2
            ? qmsg.viewOnceMessageV2.message
            : qmsg.viewOnceMessageV2Extension.message;

        const mtype = Object.keys(realMsg)[0]; // imageMessage / videoMessage

        const buffer = await downloadMediaMessage(
            { message: realMsg },
            "buffer",
            {},
            { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
        );

        if (!buffer) return reply("❌ Failed to unlock view once media.");

        if (mtype === "imageMessage") {
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `🔓 ViewOnce Image unlocked\n👤 From: ${mek.quoted.sender}`
            }, { quoted: mek });
        } else if (mtype === "videoMessage") {
            await conn.sendMessage(m.chat, {
                video: buffer,
                caption: `🔓 ViewOnce Video unlocked\n👤 From: ${mek.quoted.sender}`
            }, { quoted: mek });
        } else {
            reply("❌ Unsupported media type.");
        }

    } catch (e) {
        console.error("VV Error:", e);
        reply("❌ Error while unlocking media.");
    }
});

