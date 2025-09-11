const { cmd } = require("../lib/command");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require('../settings');

cmd({
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download Google images with pagination (HD quality)",
    category: "fun",
    use: ".img <keywords> [page]",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        if (!args.length) {
            return reply("🖼️ Usage: *.img <query> [page]*\nExample: *.img cute cats 2*");
        }

        // Query + page
        const query = args.slice(0, -1).join(" ") || args.join(" ");
        const pageArg = args[args.length - 1];
        const page = isNaN(pageArg) ? 1 : parseInt(pageArg);

        await reply(`> 🔍 Searching *HD Google Images* for *${query}* (Page ${page}) ...`);

        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}&start=${(page - 1) * 20}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(data);
        let images = [];

        // Scrape JSON script block (contains HD image URLs)
        $("script").each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent && scriptContent.includes("AF_initDataCallback")) {
                const matches = scriptContent.match(/"(https?:\/\/[^"]*\.(jpg|png|jpeg))"/g);
                if (matches) {
                    matches.forEach(url => {
                        url = url.replace(/"/g, "");
                        if (url && url.startsWith("http")) images.push(url);
                    });
                }
            }
        });

        // fallback if no JSON-based URLs
        if (images.length === 0) {
            $("img").each((i, el) => {
                let imgUrl = $(el).attr("data-iurl") || $(el).attr("src");
                if (imgUrl && imgUrl.startsWith("http")) images.push(imgUrl);
            });
        }

        if (images.length === 0) {
            return reply("❌ No HD images found. Try again with another keyword.");
        }

        // Pick 10 results
        const selected = images.slice(0, 10);

        for (const imageUrl of selected) {
            await conn.sendMessage(
                from,
                {
                    image: { url: imageUrl },
                    caption: `📷 *Result for:* ${query}\n📄 Page: ${page}\n\n${config.FOOTER}`
                },
                { quoted: mek }
            );
            await new Promise(resolve => setTimeout(resolve, 1200));
        }

        // Pagination buttons
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
