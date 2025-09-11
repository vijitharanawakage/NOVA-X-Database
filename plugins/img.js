const { cmd } = require("../lib/command");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../settings");

cmd({
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download HD wallpapers",
    category: "fun",
    use: ".img <keyword> [page]",
    filename: __filename,
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        if (!args.length) {
            return reply("🖼️ Usage: `.img <keyword> [page]`\nExample: `.img cars 2`");
        }

        let query = args.slice(0, -1).join(" ") || args.join(" ");
        let lastArg = args[args.length - 1];
        let page = isNaN(lastArg) ? 1 : parseInt(lastArg);

        await reply(`> 🔍 Searching BestHDWallpaper for *${query}* (Page ${page})...`);

        // Search URL
        let url = `https://www.besthdwallpaper.com/search?q=${encodeURIComponent(query)}&page=${page}`;

        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $ = cheerio.load(data);
        let wallpapers = [];

        $(".wallpapers .wallpaper-thumb").each((i, el) => {
            let img = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
            let link = $(el).find("a").attr("href");
            if (img && link) {
                wallpapers.push({
                    thumb: img,
                    link: `https://www.besthdwallpaper.com${link}`,
                });
            }
        });

        if (wallpapers.length === 0) {
            return reply("❌ No wallpapers found. Try another keyword or page.");
        }

        // Send 10 results per page
        for (let i = 0; i < Math.min(10, wallpapers.length); i++) {
            // Visit wallpaper page to get HD download link
            let { data: dlPage } = await axios.get(wallpapers[i].link, {
                headers: { "User-Agent": "Mozilla/5.0" },
            });
            let $$ = cheerio.load(dlPage);
            let hdLink = $$(".wallpaper-resolutions a")
                .first()
                .attr("href");

            if (hdLink) hdLink = "https://www.besthdwallpaper.com" + hdLink;

            await conn.sendMessage(
                from,
                {
                    image: { url: wallpapers[i].thumb },
                    caption: `📷 *Result for:* ${query}\n📄 Page: ${page}\n🔗 [View Wallpaper Page](${wallpapers[i].link})\n📥 [Download HD](${hdLink || wallpapers[i].link})\n\n${config.FOOTER}`,
                },
                { quoted: mek }
            );
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        // Pagination buttons (if enabled)
        if (config.BUTTON === "true") {
            let buttons = [];
            if (page > 1)
                buttons.push({
                    buttonId: `.img ${query} ${page - 1}`,
                    buttonText: { displayText: "⏮ Prev" },
                    type: 1,
                });
            buttons.push({
                buttonId: `.img ${query} ${page + 1}`,
                buttonText: { displayText: "⏭ Next" },
                    type: 1,
            });

            await conn.sendMessage(
                from,
                {
                    text: `🔎 Results for *${query}* - Page ${page}`,
                    footer: config.FOOTER,
                    buttons,
                    headerType: 2,
                },
                { quoted: mek }
            );
        }
    } catch (error) {
        console.error("BestHDWallpaper Error:", error);
        reply(`❌ Error: ${error.message || "Failed to fetch wallpapers"}`);
    }
});
