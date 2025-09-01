const { cmd } = require("../lib/command");

cmd({
  pattern: "owner",
  react: "📇",
  desc: "Send owner contacts as separate vCards",
  category: "general",
  filename: __filename,
}, async (conn, mek, m) => {
  try {
    const contacts = [
      {
        name: "𝙼𝚁.𝚂𝙰𝙽𝙳𝙴𝚂𝙷 𝙱𝙷𝙰𝚂𝙷𝙰𝙽𝙰",
        number: "94741259325"
      },
      {
        name: "𝙼𝚁.𝙿𝙰𝚃𝙷𝚄𝙼 𝙼𝙰𝙻𝚂𝙰𝚁𝙰",
        number: "94723975388"
      }
    ];

    for (let contact of contacts) {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
ORG:NOVA-X MD;
TEL;type=CELL;type=VOICE;waid=${contact.number}:${contact.number}
END:VCARD`;

      // Each contact as separate message
      await conn.sendMessage(m.chat, {
        contacts: [{
          displayName: contact.name,
          vcard
        }]
      }, { quoted: mek, react: "📇" });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

  } catch (err) {
    console.log(err);
    m.reply("❌ Error sending contacts!");
  }
});
