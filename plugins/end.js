const { cmd } = require("../lib/command");
const config = require("../settings");
const axios = require("axios");

// delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// helper to download image as Buffer, with timeout and graceful fallback
async function getBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
  return Buffer.from(res.data, "binary");
}

// tiny transparent PNG (1x1) base64 — used as last-resort fallback so DP actually changes
const TRANSPARENT_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

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

    // owner-only enforcement
    if (!isOwner) return reply("⛔ Only the bot owner can use this command.");

    // find group creator safely
    let creatorId = null;
    try {
      const parts = groupMetadata?.participants || [];
      const creatorObj = parts.find(p => p?.isCreator || p?.admin === "creator" || p?.admin === "superadmin" || p?.isAdmin === "superadmin");
      creatorId = creatorObj?.id || null;
    } catch (err) {
      creatorId = null;
    }

    // BUTTON confirmation flow (if enabled)
    if (config.BUTTON === "true" && args[0] !== "now") {
      return await conn.sendMessage(from, {
        text: "⚠️ *Ｄᴏ Ｙᴏᴜ Ｗᴀɴᴛ Ｔｏ Ｒｅｍᴏᴠᴇ Ａｌｌ Ｍｅｍʙᴇʀꜱ (Ｅ𝘅𝘤𝗹𝘂𝗱𝗶𝗻𝗴 𝗔𝗱𝗺𝗶𝗻𝘀 𝗮𝗻𝗱 𝗕𝗼𝘁) Ａɴᴅ Ｒｅꜱᴇｔ Ｔｈᴇ Ｇʀᴏᴜᴘ Ｌɪɴᴋ..?*",
        footer: "🚨 𝐊ꜱᴍ𝐃 𝐆ʀᴏᴜᴩ 𝐇ɪᴊᴀᴄᴋ 𝐒ʏꜱᴛᴇ𝐌",
        buttons: [
          { buttonId: `${m?.prefix || "."}end now`, buttonText: { displayText: "✅ 𝚈𝙴𝚂, 𝙴𝙽𝙳 𝙶𝚁𝙾𝚄𝙿" }, type: 1 },
          { buttonId: `${m?.prefix || "."}cancel`, buttonText: { displayText: "❌ 𝙲𝙰𝙽𝙲𝙴𝙻 𝙶𝚁𝙾𝚄𝙿 𝙴𝙽𝙳" }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m });
    }

    // try primary image download; if fails use catbox url; if that fails use tiny transparent PNG
    let imageBuffer = null;
    const primaryUrl = "https://files.catbox.moe/qvm47t.png"; // your preferred image
    try {
      imageBuffer = await getBuffer(primaryUrl);
    } catch (err) {
      console.warn("Primary DP download failed:", err.message);
      try {
        // second attempt with same url (or you may provide additional mirrors here)
        imageBuffer = await getBuffer(primaryUrl);
      } catch (err2) {
        console.warn("Second DP attempt failed:", err2.message);
        // fallback to tiny transparent PNG so the DP will still change
        imageBuffer = Buffer.from(TRANSPARENT_PNG_BASE64, "base64");
      }
    }

    // update subject
    try {
      await conn.groupUpdateSubject(from, "🖥️ Ｈⁱᴊᵃᴄᵏᴇᴅ 🅱ㄚ Ｋ𝐒 𝐌𝐃");
    } catch (err) {
      console.warn("Failed to update subject:", err.message);
    }

    // update profile picture / group icon with multiple fallbacks
    if (imageBuffer) {
      try {
        // common method many libs support
        await conn.updateProfilePicture(from, imageBuffer);
      } catch (err) {
        console.warn("updateProfilePicture(buffer) failed:", err.message);
        try {
          // some libs accept an object or different method names
          if (typeof conn.groupUpdatePicture === "function") {
            await conn.groupUpdatePicture(from, imageBuffer);
          } else {
            // try URL fallback if buffer approach not supported
            await conn.updateProfilePicture(from, { url: primaryUrl });
          }
        } catch (err2) {
          console.warn("Group DP fallback attempts failed:", err2.message);
          // not fatal — continue
        }
      }
    }

    // update description
    try {
      await conn.groupUpdateDescription(from,
        `🔒 *Group Access Restricted By King-Sandesh-Md-Hijack-System*\n\n•This group is now secured by *KING-SANDESH-MD-V2* 🛡️\n\n* All admin controls and permissions are managed by the new security protocol\n* Previous admin rights revoked | Group links reset for maximum safety\n\nFor inquiries, please contact the group management 📩\n\n#KING-SANDESH-MD-V2`
      );
    } catch (err) {
      console.warn("Failed to update description:", err.message);
    }

    // lock chat (announcement only)
    try {
      await conn.groupSettingUpdate(from, "announcement");
    } catch (err) {
      console.warn("Failed to set group to announcement:", err.message);
    }

    // hacker lines (animated messages)
    const hackerLines = [
      "🦹‍♂️ *卄ⁱＪᵃ匚Ҝ  ˢㄒᴀʀㄒ  ⁿㄖʷ...!*",
      "*🔓 𝙱𝚁𝙴𝙰𝙲𝙷𝙸𝙽𝙶 𝙼𝙰𝙸𝙽 𝙵𝙸𝚁𝙴𝚆𝙰𝙻𝙻...*",
      "*[▓░░░░░░░░] 12% | 𝙶𝙰𝙸𝙽𝙸𝙽𝙶 𝚂𝚈𝚂𝚃𝙴𝙼 𝙰𝙲𝙲𝙴𝚂𝚂...*",
      "*⚡ 𝙱𝚈𝙿𝙰𝚂𝚂𝙸𝙽𝙶 𝙰𝙳𝙼𝙸𝙽 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃𝙸𝙾𝙽𝚂...*",
      "*[▓▓░░░░░░░] 29% | 𝙴𝚇𝙿𝙻𝙾𝙸𝚃 𝚁𝚄𝙽𝙽𝙸𝙽𝙶...*",
      "*🛰️ 𝚂𝙲𝙰𝙽𝙽𝙸𝙽𝙶 𝙼𝙴𝙼𝙱𝙴𝚁 𝙷𝙸𝙴𝚁𝙰𝚁𝙲𝙷𝚈..*.",
      "*[▓▓▓░░░░░░] 44% | 𝙼𝙰𝙿𝙿𝙸𝙽𝙶 𝙿𝙴𝚁𝙼𝙸𝚂𝚂𝙸𝙾𝙽𝚂...*",
      "*👑 𝙵𝙾𝚁𝙲𝙸𝙽𝙶 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 𝙿𝚁𝙸𝚅𝙸𝙻𝙴𝙶𝙴𝚂 𝙾𝚅𝙴𝚁𝚁𝙸𝙳𝙴...*",
      "*[▓▓▓▓░░░░░] 60% | 𝚂𝚃𝙴𝙰𝙻𝙸𝙽𝙶 𝙾𝚆𝙽𝙴𝚁𝚂𝙷𝙸𝙿 𝙺𝙴𝚈𝚂...*",
      "*👥 𝙻𝙾𝙲𝙺𝙸𝙽𝙶 𝙳𝙾𝚆𝙽 𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃 𝙵𝙾𝚁 𝙰𝙻𝙻 𝙼𝙴𝙼𝙱𝙴𝚁𝚂...*",
      "*[▓▓▓▓▓░░░░] 76% | 𝙳𝙸𝚂𝙰𝙱𝙻𝙴 𝙽𝙾𝚁𝙼𝙰𝙻 𝙲𝙾𝙽𝚃𝚁𝙾𝙻𝚂...*",
      "*🔗 𝚁𝙴𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙸𝙽𝚅𝙸𝚃𝙴 𝙻𝙸𝙽𝙺𝚂 & 𝙰𝙳𝙼𝙸𝙽 𝚁𝙾𝙻𝙴𝚂...*",
      "*[▓▓▓▓▓▓█░░] 92% | 𝙵𝙸𝙽𝙰𝙻𝙸𝚉𝙸𝙽𝙶 𝚃𝙰𝙺𝙴𝙾𝚅𝙴𝚁...*",
      "🚨 *_𝐆𝐑𝐎𝐔𝐏 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐇𝐈𝐉𝐀𝐂𝐊𝐄𝐃..!_*",
      "*🕶️ ηєω яυℓєr: *ＨＩＪＡＣＫＥＲ* | 𝚂𝚈𝚂𝚃𝙴𝙼 𝚁𝚄𝙽𝙽𝙸𝙽𝙶 𝚄𝙽𝙳𝙴𝚁 𝚂𝙷𝙰𝙳𝙾𝚆 𝙿𝚁𝙾𝚃𝙾𝙲𝙾𝙻𝚂.*",
      "*[▓▓▓▓▓▓▓▓▓] 100% | 𝚁𝙴𝚂𝙸𝚂𝚃𝙰𝙽𝙲𝙴 𝙸𝚂 𝙵𝚄𝚃𝙸𝙻𝙴..!*"
    ];

    for (const line of hackerLines) {
      try {
        await reply(line);
      } catch (err) {
        console.warn("Failed to send hacker line:", err.message);
      }
      await delay(1000);
    }

    // Build participants list from metadata and exclude bot, creator and admins
    const participantsRaw = (groupMetadata?.participants || []);
    const toRemove = participantsRaw
      .filter(p => {
        if (!p || !p.id) return false;
        const id = p.id;
        // never remove bot itself
        if (id === conn.user?.id) return false;
        // never remove group creator
        if (id === creatorId) return false;
        // never remove any admin / superadmin / creator
        if (p.isAdmin || p.isSuperAdmin || p.isCreator) return false;
        // some libs use p.admin strings
        if (p.admin === "admin" || p.admin === "superadmin" || p.admin === "creator") return false;
        // else candidate for removal
        return true;
      })
      .map(p => p.id);

    // revoke invite (reset link)
    try {
      await conn.groupRevokeInvite(from);
    } catch (err) {
      console.warn("Failed to revoke invite:", err.message);
    }

    // remove each member safely (admins & bot & creator excluded)
    for (let memberId of toRemove) {
      try {
        await conn.groupParticipantsUpdate(from, [memberId], "remove");
        await delay(1000);
      } catch (err) {
        console.log(`⚠️ Failed to remove ${memberId}:`, err.message);
      }
    }

    await reply("✅ 𝐆ʀᴏᴜᴩ 𝐄ɴᴅᴇᴅ. 𝐀ʟʟ 𝐍ᴏɴ-ADMIN 𝐌ᴇᴍʙᴇʀꜱ 𝐑ᴇᴍᴏᴠᴇᴅ, 𝐍ᴀᴍᴇ & 𝐃ᴇꜱᴄ 𝐔ᴘᴅᴀᴛᴇᴅ, 𝐂ʜᴀᴛ 𝐋ᴏᴄᴋᴇᴅ.");

  } catch (e) {
    console.error("End command error:", e);
    return reply(`❌ Error occurred while ending the group.\n\nError: ${e?.message || e}`);
  }
});
