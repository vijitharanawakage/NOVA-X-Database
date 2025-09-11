const { cmd } = require("../lib/command");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require('../settings');

cmd({
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download Google images with pagination",
    category: "fun",
    use: ".img <keywords> [page]",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        if (!args.length) {
            return reply("🖼️ Usage: *.img <query> [page]*\nExample: *.img cute cats 2*");
        }

        // query + page
        const query = args.slice(0, -1).join(" ") || args.join(" ");
        const pageArg = args[args.length - 1];
        const page = isNaN(pageArg) ? 1 : parseInt(pageArg);

        await reply(`> 🔍 Searching Google Images for *${query}* (Page ${page}) ...`);

        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}&start=${(page - 1) * 20}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(data);
        let images = [];

        // Try HD links first
        $("img").each((i, el) => {
            let imgUrl = $(el).attr("data-iurl") || $(el).attr("data-src");
            if (imgUrl && imgUrl.startsWith("http")) {
                images.push(imgUrl);
            }
        });

        // Fallback if no HD
        if (images.length === 0) {
            $("img").each((i, el) => {
                let fallbackUrl = $(el).attr("src");
                if (fallbackUrl && fallbackUrl.startsWith("http")) {
                    images.push(fallbackUrl);
                }
            });
        }

        if (images.length === 0) {
            return reply("❌ No images found. Try again.");
        }

        // Pick 10 images for current page
        const selected = images.slice(0, 10);

        for (const imageUrl of selected) {
            await conn.sendMessage(
                from,
                {
                    image: { url: imageUrl },
                    caption: `📷 𝚁𝚎𝚜𝚞𝚕𝚝 𝚏𝚘𝚛: *${query}*\n📄 Page: ${page}\n\n${config.FOOTER}`
                },
                { quoted: mek }
            );
            await new Promise(resolve => setTimeout(resolve, 1200));
        }

        // Pagination buttons (if enabled)
        if (config.BUTTON === 'true') {
            let buttons = [];
            if (page > 1) buttons.push({ buttonId: `.img ${query} ${page - 1}`, buttonText: { displayText: "⏮ Prev" }, type: 1 });
            buttons.push({ buttonId: `.img ${query} ${page + 1}`, buttonText: { displayText: "⏭ Next" }, type: 1 });

            await conn.sendMessage(from, {
                text: `🔎 Results for *${query}* - Page ${page}`,
                footer: config.FOOTER,
                buttons,
                headerType: 2
            }, { quoted: mek });
        }

    } catch (error) {
        console.error("Google Image Error:", error);
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});
