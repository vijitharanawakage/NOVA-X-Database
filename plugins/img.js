const { cmd } = require("../lib/command");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require('../settings');

cmd({
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download Google images (HD)",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img cute cats");
        }

        await reply(`> 🔍 𝐒ᴇᴀʀᴄʜɪɴɢ 𝐆ᴏᴏɢʟᴇ 𝐈ᴍᴀɢᴇꜱ 𝐅ᴏʀ *${query}* ...`);

        // Google image search URL
        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;

        // Fetch HTML
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(data);
        let images = [];

        // Extract HD image links
        $("img").each((i, el) => {
            let imgUrl = $(el).attr("data-iurl") || $(el).attr("data-src") || $(el).attr("src");
            if (imgUrl && imgUrl.startsWith("http") && !imgUrl.includes("gstatic.com")) {
                images.push(imgUrl);
            }
        });

        if (images.length === 0) {
            return reply("❌ No HD images found. Try different keywords.");
        }

        // Randomly select 10 high-quality images
        const selected = images.sort(() => 0.5 - Math.random()).slice(0, 10);

        for (const imageUrl of selected) {
            await conn.sendMessage(
                from,
                {
                    image: { url: imageUrl },
                    caption: `📷 𝙷𝙸𝙶𝙷-𝚀𝚄𝙰𝙻𝙸𝚃𝚈 𝚁𝙴𝚂𝚄𝙻𝚃 𝙵𝙾𝚁: *${query}*\n\n${config.FOOTER}`
                },
                { quoted: mek }
            );
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

    } catch (error) {
        console.error("Google Image Error:", error);
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});
