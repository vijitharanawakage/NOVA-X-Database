const { cmd } = require("../lib/command");

cmd({
  pattern: "owner",
  react: "📇",
  desc: "Send saved contacts as vCards",
  category: "general",
  filename: __filename,
}, async (conn, mek, m) => {
  try {
    // First contact vCard
    let vcard1 = 'BEGIN:VCARD\n' 
               + 'VERSION:3.0\n' 
               + 'FN:𝙼𝚁.𝚂𝙰𝙽𝙳𝙴𝚂𝙷 𝙱𝙷𝙰𝚂𝙷𝙰𝙽𝙰\n' // Contact Name
               + 'ORG:NOVA-X MD;\n' 
               + 'TEL;type=CELL;type=VOICE;waid=94741259325:+94 74 125 9325\n' // WhatsApp number
               + 'END:VCARD';

    await conn.sendMessage(m.chat, {
      contacts: { displayName: "𝙼𝚁.𝚂𝙰𝙽𝙳𝙴𝚂𝙷 𝙱𝙷𝙰𝚂𝙷𝙰𝙽𝙰", contacts: [{ vcard: vcard1 }] }
    }, { quoted: mek });

    // Second contact vCard
    let vcard2 = 'BEGIN:VCARD\n' 
               + 'VERSION:3.0\n' 
               + 'FN:𝙼𝚁.𝙿𝙰𝚃𝙷𝚄𝙼 𝙼𝙰𝙻𝚂𝙰𝚁𝙰\n' 
               + 'ORG:NOVA-X MD;\n' 
               + 'TEL;type=CELL;type=VOICE;waid=94723975388:+94 72 397 5388\n' 
               + 'END:VCARD';

    await conn.sendMessage(m.chat, {
      contacts: { displayName: "𝙼𝚁.𝙿𝙰𝚃𝙷𝚄𝙼 𝙼𝙰𝙻𝚂𝙰𝚁𝙰", contacts: [{ vcard: vcard2 }] }
    }, { quoted: mek });

  } catch (e) {
    console.log(e)
    return m.reply("❌ Error sending contacts!");
  }
});
