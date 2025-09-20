const { cmd } = require("../lib/command");
const config = require("../settings");
const axios = require("axios");
const Jimp = require("jimp"); // npm i jimp

// delay helper
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// download and convert to JPEG buffer (safest for WhatsApp DP)
async function fetchImageAsJpegBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
  const img = await Jimp.read(Buffer.from(res.data, "binary"));
  // resize small if needed and convert to JPEG quality 90
  img.cover(1024, 1024); // ensure square (optional), changes to fit DP nicely
  return await img.quality(90).getBufferAsync(Jimp.MIME_JPEG);
}

// tiny transparent PNG fallback buffer (base64)
const TRANSPARENT_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
const TRANSPARENT_BUFFER = Buffer.from(TRANSPARENT_PNG_BASE64, "base64");

// safe send with retries (to reduce dropped messages)
async function safeSend(conn, jid, payload, retries = 2, wait = 1000) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      // prefer conn.sendMessage if available, otherwise conn.reply/conn.send
      if (typeof conn.sendMessage === "function") {
        return await conn.sendMessage(jid, payload);
      } else if (typeof conn.reply === "function") {
        // try reply if payload is text
        if (payload && payload.text) return await conn.reply(jid, payload.text, null);
        return await conn.reply(jid, JSON.stringify(payload), null);
      } else {
        // fallback: try conn.send
        return await conn.send(jid, payload);
      }
    } catch (e) {
      lastErr = e;
      await delay(wait * (i + 1));
    }
  }
  throw lastErr;
}

cmd({
  pattern: "end",
  desc: "Remove all members from group and reset link (Bot Owner only)",
  category: "group",
  react: "🔚",
  filename: __filename
},
async (conn, mek, m, { isAdmin, isBotAdmin, groupMetadata, sender, from, reply, args, isOwner }) => {
  try {
    if (!m?.isGroup) return reply("❌ This command only works in group chats.");
    if (!isOwner) return reply("⛔ Only the bot owner can use this command.");

    // find creator id safely
    let creatorId = null;
    try {
      const parts = groupMetadata?.participants || [];
      const creatorObj = parts.find(p => p?.isCreator || p?.admin === "creator" || p?.admin === "superadmin");
      creatorId = creatorObj?.id || null;
    } catch (err) {
      creatorId = null;
    }

    // BUTTON confirmation flow
    if (config.BUTTON === "true" && args[0] !== "now") {
      return await conn.sendMessage(from, {
        text: "⚠️ *𝐃ᴏ 𝐘ᴏᴜ 𝐖ᴀɴᴛ 𝐓ᴏ 𝐑ᴇᴍᴏᴠᴇ 𝐀ʟʟ 𝐌ᴇᴍʙᴇʀꜱ (ᴡɪᴛʜᴏᴜᴛ ʏᴏᴜ ᴀɴᴅ ᴀᴅᴍɪɴꜱ) 𝐀ɴᴅ 𝐑ᴇꜱᴇᴛ 𝐓ʜᴇ 𝐆ʀᴏᴜᴘ 𝐋ɪɴᴋ..?*",
        footer: "🚨 < | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️ 𝐆ʀᴏᴜᴩ 𝐇ɪᴊᴀᴄᴋ 𝐒ʏꜱᴛᴇ𝐌",
        buttons: [
          { buttonId: `${m?.prefix || "."}end now`, buttonText: { displayText: "✅ 𝚈𝙴𝚂, 𝙴𝙽𝙳 𝙶𝚁𝙾𝚄𝙿" }, type: 1 },
          { buttonId: `${m?.prefix || "."}cancel`, buttonText: { displayText: "❌ 𝙲𝙰𝙽𝙲𝙴𝙻 𝙶𝚁𝙾𝚄𝙿 𝙴𝙽𝙳" }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m });
    }

    // --- DP: download & convert ---
    const primaryUrl = "https://files.catbox.moe/qvm47t.png";
    let imageBuffer = null;
    try {
      imageBuffer = await fetchImageAsJpegBuffer(primaryUrl);
      // if too small, fallback
      if (!imageBuffer || imageBuffer.length < 100) throw new Error("invalid image buffer");
    } catch (err) {
      console.warn("Primary DP download/convert failed:", err?.message || err);
      imageBuffer = TRANSPARENT_BUFFER;
    }

    // update subject
    try {
      if (typeof conn.groupUpdateSubject === "function") {
        await conn.groupUpdateSubject(from, "🖥️ Ｈⁱᴊᵃᴄᵏᴇᴅ 🅱ㄚ < | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️");
      } else if (typeof conn.groupUpdateName === "function") {
        await conn.groupUpdateName(from, "🖥️ Ｈⁱᴊᵃᴄᵏᴇᴅ 🅱ㄚ < | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️");
      }
    } catch (err) {
      console.warn("Failed to update subject:", err?.message || err);
    }

    // update profile picture - try several method names
    let dpSet = false;
    const dpMethods = [
      async () => conn.updateProfilePicture ? await conn.updateProfilePicture(from, imageBuffer) : Promise.reject(new Error("no updateProfilePicture")),
      async () => conn.groupUpdatePicture ? await conn.groupUpdatePicture(from, imageBuffer) : Promise.reject(new Error("no groupUpdatePicture")),
      async () => conn.groupUpdateProfilePicture ? await conn.groupUpdateProfilePicture(from, imageBuffer) : Promise.reject(new Error("no groupUpdateProfilePicture")),
      async () => conn.profilePictureUpdate ? await conn.profilePictureUpdate(from, imageBuffer) : Promise.reject(new Error("no profilePictureUpdate")),
      // URL fallback
      async () => conn.updateProfilePicture ? await conn.updateProfilePicture(from, { url: primaryUrl }) : Promise.reject(new Error("no url-fallback"))
    ];

    for (const fn of dpMethods) {
      try {
        await fn();
        dpSet = true;
        break;
      } catch (e) {
        console.warn("DP attempt failed:", e?.message || e);
        await delay(500);
      }
    }
    if (!dpSet) console.warn("All DP attempts failed — may be library permission or API limitation.");

    // update description
    try {
      if (typeof conn.groupUpdateDescription === "function") {
        await conn.groupUpdateDescription(from,
          `🔒 *Ｇʀᴏᴜᴘ Ａᴄᴄᴇꜱꜱꜱ Ｒᴇꜱᴛʀɪᴄᴋᴇᴅ Ｂʏ < | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️ Ｈɪᴊᴀᴄᴋ Ｓʏꜱᴛᴇᴍ*\n\n•𝚃𝙷𝙸𝚂 𝙶𝚁𝙾𝙿 𝙸𝚂 𝙽𝙾𝚆 𝚂𝙴𝙲𝚄𝚁𝙴𝙳 𝙱𝚈 *< | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️* 🛡️\n\n* 𝙰𝙻𝙻 𝙰𝙳𝙼𝙸𝙽 𝙲𝙾𝙽𝚃𝚁𝙾𝙻𝚂 𝙰𝙽𝙳 𝙿𝙴𝚁𝙼𝙸𝚂𝚂𝙸𝙾𝙽𝚂 𝙰𝚁𝙴 𝙼𝙰𝙽𝙰𝙶𝙴 𝙱𝚈 𝚃𝙷𝙴 𝙽𝙴𝚆 𝚂𝙴𝙲𝚄𝚁𝙸𝚃𝚈 𝙿𝚁𝙾𝚃𝙾𝙲𝙾𝙻𝙴\n* 𝙰𝙻𝙻 𝙰𝙳𝙼𝙸𝙽 𝚁𝙸𝙶𝙷𝚃𝚂 𝚁𝙴𝚅𝙾𝙺𝙴𝙳 | 𝙶𝚁𝙾𝙿 𝙻𝙸𝙽𝙺𝚂 𝚁𝙴𝚂𝙴𝚃 𝙵𝙾𝚁 𝙼𝙰𝚇𝙸𝙼𝚄𝙼 𝚂𝙰𝙵𝙴𝚃𝚈\n\n𝙵𝙾𝚁 𝙸𝙽𝚀𝚄𝙸𝚁𝙸𝙴𝚂, 𝙿𝙻𝙴𝙰𝚂𝙴 𝙲𝙾𝙽𝚃𝙰𝙲𝚁 𝚃𝙷𝙴 𝙶𝚁𝙾𝚄𝙿 𝙼𝙰𝙽𝙰𝙶𝙴𝙼𝙴𝙽𝚃 📩\n\n#< | 𝐐ᴜᴇᴇɴ 𝐉ᴜꜱᴍʏ 𝐌ᴅ 🧚‍♀️`
        );
      }
    } catch (err) {
      console.warn("Failed to update description:", err?.message || err);
    }

    // lock chat (announcement)
    try {
      if (typeof conn.groupSettingUpdate === "function") {
        await conn.groupSettingUpdate(from, "announcement");
      }
    } catch (err) {
      console.warn("Failed to set group to announcement:", err?.message || err);
    }

    // hacker lines (send safely)
    const hackerLines = [
      "🦹‍♂️ *卄ⁱＪᵃ匚Ҝ  ˢㄒᴀʀㄒ  ⁿㄖʷ...!*",
      "*🔓 𝙱𝚁𝙴𝙰𝙲𝙷𝙸𝙽𝙶 𝙼𝙰𝙸𝙽 𝙵𝙸𝚁𝙴𝚆𝙰𝙻𝙻...*",
      "*[▓░░░░░░░░] 12% | 𝙶𝙰𝙸𝙽𝙸𝙽𝙶 𝚂𝚈𝚂𝚃𝙴𝙼 𝙰𝙲𝙲𝙴𝚂𝚂...*",
      "*⚡ 𝙱𝚈𝙿𝙰𝚂𝚂𝙸𝙽𝙶 𝙰𝙳𝙼𝙸𝙽 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃𝙸𝙾𝙽𝚂...*",
      "🚨 *_𝐆𝐑𝐎𝐔𝐏 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐇𝐈𝐉𝐀𝐂𝐊𝐄𝐃..!_*"
    ];

    for (const line of hackerLines) {
      try {
        await safeSend(conn, from, { text: line }, 2, 800);
      } catch (err) {
        console.warn("Failed to send hacker line:", err?.message || err);
      }
      await delay(1200);
    }

    // Build participants list and exclude bot, creator and admins
    const participantsRaw = (groupMetadata?.participants || []);
    const toRemove = participantsRaw
      .filter(p => {
        if (!p || !p.id) return false;
        const id = p.id;
        if (id === conn.user?.id) return false; // don't remove bot
        if (id === creatorId) return false;     // don't remove creator
        if (p.isAdmin || p.isSuperAdmin || p.isCreator) return false; // skip admins
        if (p.admin === "admin" || p.admin === "superadmin" || p.admin === "creator") return false;
        return true;
      })
      .map(p => p.id);

    // revoke invite (reset link)
    try {
      if (typeof conn.groupRevokeInvite === "function") {
        await conn.groupRevokeInvite(from);
      }
    } catch (err) {
      console.warn("Failed to revoke invite:", err?.message || err);
    }

    // remove each member safely
    for (let memberId of toRemove) {
      try {
        if (typeof conn.groupParticipantsUpdate === "function") {
          await conn.groupParticipantsUpdate(from, [memberId], "remove");
        }
        await delay(1200);
      } catch (err) {
        console.log(`⚠️ Failed to remove ${memberId}:`, err?.message || err);
      }
    }

    // final confirmation
    try {
      await safeSend(conn, from, { text: "✅ 𝐆ʀᴏᴜᴩ 𝐄ɴᴅᴇᴅ 𝐒ᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ. 𝐀ʟʟ 𝐍ᴏɴ-𝐀ᴅᴍɪɴ 𝐌ᴇᴍʙᴇʀꜱ 𝐑ᴇᴍᴏᴠᴇᴅ, 𝐍ᴀᴍᴇ & 𝐃ᴇꜱᴄ 𝐔ᴘᴅᴀᴛᴇᴅ, 𝐂ʜᴀᴛ 𝐋ᴏᴄᴋᴇᴅ." }, 2, 800);
    } catch (err) {
      console.warn("Final confirmation failed:", err?.message || err);
      return reply("✅ Operation completed (some notifications may not have delivered).");
    }

  } catch (e) {
    console.error("End command error:", e);
    return reply(`❌ Error occurred while ending the group.\n\nError: ${e?.message || e}`);
  }
});
