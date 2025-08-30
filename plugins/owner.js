const { cmd } = require('../lib/command');

cmd({
    pattern: "owner",
    react: "✅", 
    desc: "Get owner numbers",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        // Owners list
        const owners = [
            { name: "Sandesh", number: "94773416478" },
            { name: "pathum", number: "94741259325" }
        ];

        let contactsArray = [];

        for (let o of owners) {
            const vcard =
                'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                `FN:${o.name}\n` +
                `TEL;type=CELL;type=VOICE;waid=${o.number}:${o.number}\n` +
                'END:VCARD';

            contactsArray.push({
                displayName: o.name,
                vcard
            });
        }

        await conn.sendMessage(from, {
            contacts: {
                displayName: "Bot Owners",
                contacts: contactsArray
            }
        });

    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message}`);
    }
});
