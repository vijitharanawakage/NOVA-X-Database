const { cmd } = require('../lib/command');

cmd({
    pattern: "owner",
    react: "✅", 
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {
        const owners = [
            { number: "94773416478", name: "𝙼𝚁 𝙿𝙴𝚃𝙷𝚄𝙼 𝙼𝙰𝙻𝚂𝙰𝚁𝙰" },
            { number: "94741259325", name: "𝙼𝚁 𝚂𝙰𝙽𝙳𝙴𝚂𝙷 𝙱𝙷𝙰𝚂𝙷𝙰𝙽𝙰" }
        ];

        const contactsArray = owners.map(owner => {
            return {
                vcard: `BEGIN:VCARD\n` +
                       `VERSION:3.0\n` +
                       `FN:${owner.name}\n` +  
                       `TEL;type=CELL;type=VOICE;waid=${owner.number}:${owner.number}\n` + 
                       `END:VCARD`
            };
        });

        await conn.sendMessage(from, {
            contacts: {
                displayName: "👥 Ｂᴏᴛ Ｏᴡɴᴇʀꜱ",
                contacts: contactsArray
            }
        });

    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message}`);
    }
});
