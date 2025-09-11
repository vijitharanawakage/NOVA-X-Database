const { cmd } = require("../lib/command");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../settings");

cmd({
    pattern: "img",
    alias: ["image", "wallpaper", "searchimg"],
    react: "🖼️",
    desc: "Search BestHDWallpaper and get HD images",
    category: "fun",
    use: ".img <keyword> [page]",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        if (!args.length) return reply("🖼️ Usage: .img <keyword> [page]");

        let page = 1;
        if (!isNaN(args[args.length - 1])) {
            page = parseInt(args.pop());
        }

        const query = args.join(" ");
        await reply(`🔍 Searching wallpapers for *${query}* (Page ${page}) ...`);

        const url = `https://www.besthdwallpaper.com/search?q=${encodeURIComponent(query)}&page=${page}`;

        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);
        const wallpapers = [];

        $(".wallpapers .wallpaper-thumb").each((i, el) => {
            const thumb = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
            const link = $(el).find("a").attr("href");
            if (thumb && link) {
                wallpapers.push({
                    thumb,
                    pageLink: "https://www.besthdwallpaper.com" + link
                });
            }
        });

        if (!wallpapers.length) return reply("❌ No wallpapers found. Try another keyword or page.");

        // Send top 10 results
        for (let i = 0; i < Math.min(10, wallpapers.length); i++) {
            // Fetch HD link from wallpaper page
            let hdLink = wallpapers[i].pageLink;
            try {
                const { data: pageData } = await axios.get(hdLink, { headers: { "User-Agent": "Mozilla/5.0" } });
                const $$ = cheerio.load(pageData);
                const dlLink = $$("ul.wallpaper-resolutions li a").first().attr("href");
                if (dlLink) hdLink = "https://www.besthdwallpaper.com" + dlLink;
            } catch (e) {
                // fallback
            }

            await conn.sendMessage(from, {
                image: { url: wallpapers[i].thumb },
                caption: `📷 *Result for:* ${query}\n📄 Page: ${page}\n🔗 [View Page](${wallpapers[i].pageLink})\n📥 [HD Download](${hdLink})\n\n${config.FOOTER}`
            }, { quoted: mek });

            await new Promise(res => setTimeout(res, 1200));
        }

        // Pagination buttons
        if (config.BUTTON === "true") {
            const buttons = [];
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
        console.error("Wallpaper Error:", error);
        reply(`❌ Error: ${error.message || "Failed to fetch wallpapers"}`);
    }
});
