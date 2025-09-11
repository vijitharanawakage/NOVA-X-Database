const { cmd } = require("../lib/command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("../settings");

cmd({
    pattern: "moviedl",
    alias: ["movie", "moviesearch"],
    react: "🎬",
    desc: "Search and download Sinhala sub movies directly with buttons",
    category: "download",
    use: ".moviedl <movie name>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        if (!args.length) return reply("❌ Please provide a movie name\nExample: .moviedl deadpool");

        const query = args.join(" ");
        await reply(`🔎 Searching for *${query}* ...`);

        // 1️⃣ Search movies
        const searchRes = await axios.get(`https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(query)}`);
        if (!searchRes.data.status || !searchRes.data.result?.data?.length) {
            return reply("❌ No movies found. Try another keyword.");
        }

        const results = searchRes.data.result.data.slice(0, 3); // top 3

        if (results.length > 1 && config.BUTTON === "true") {
            // Send buttons to choose movie
            const buttons = results.map((item, index) => ({
                buttonId: `.moviedl_dl ${item.link}`,
                buttonText: { displayText: `${item.title.split("|")[0]}`.slice(0, 30) },
                type: 1
            }));

            await conn.sendMessage(from, {
                text: `🎬 Select a movie to get info and download:`,
                footer: config.FOOTER,
                buttons,
                headerType: 1
            }, { quoted: mek });

        } else {
            // Only one result or buttons disabled, auto fetch
            const movie = results[0];
            await sendMovieInfo(conn, from, mek, movie);
        }

    } catch (err) {
        console.error("MovieDL Search Error:", err);
        reply(`❌ Error: ${err.message || "Failed to fetch movie"}`);
    }
});

// Separate command to handle chosen movie link from button
cmd({
    pattern: "moviedl_dl",
    react: "🎬",
    desc: "Fetch movie info & download from button selection",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const url = args[0];
        if (!url) return reply("❌ No movie link provided.");

        // 2️⃣ Get movie info
        const movieRes = await axios.get(`https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(url)}`);
        const movie = movieRes.data.result.data;

        await sendMovieInfo(conn, from, mek, movie);

    } catch (err) {
        console.error("MovieDL Button Error:", err);
        reply(`❌ Error: ${err.message || "Failed to fetch movie info"}`);
    }
});

// Helper function to send movie info + download
async function sendMovieInfo(conn, from, mek, movie) {
    let caption = `🎬 *${movie.title}*\n`;
    caption += `📅 Date: ${movie.date}\n`;
    caption += `🌍 Country: ${movie.country}\n`;
    caption += `⏱ Runtime: ${movie.runtime}\n`;
    caption += `⭐ IMDB Rate: ${movie.imdbRate}\n`;
    caption += `📝 Description: ${movie.description}\n`;
    caption += `📄 Subtitle Author: ${movie.subtitle_author}\n`;
    caption += `🎬 Director: ${movie.director}\n`;
    caption += `🗂 Categories: ${movie.category.join(", ")}\n\n`;
    caption += `${config.FOOTER}`;

    // Send poster image
    if (movie.image) {
        await conn.sendMessage(from, { image: { url: movie.image }, caption }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: caption }, { quoted: mek });
    }

    // Download & send movie files if links exist
    if (movie.dl_links && movie.dl_links.length) {
        for (const link of movie.dl_links) {
            try {
                await conn.sendMessage(from, { text: `⬇️ Downloading: ${link.name || "Movie"} ...` }, { quoted: mek });
                const response = await axios.get(link.url, { responseType: "arraybuffer" });
                const buffer = Buffer.from(response.data, "binary");

                // Temp file path
                const ext = path.extname(link.url).split("?")[0] || ".mp4";
                const tempPath = path.join(os.tmpdir(), `${movie.title.replace(/\s+/g, "_")}${ext}`);
                fs.writeFileSync(tempPath, buffer);

                // Send file
                await conn.sendMessage(from, { document: fs.readFileSync(tempPath), mimetype: "video/mp4", fileName: `${movie.title}${ext}` }, { quoted: mek });

                fs.unlinkSync(tempPath);
            } catch (err) {
                console.error("Download Error:", err);
                await conn.sendMessage(from, { text: `❌ Failed to download: ${link.name || "Movie"}` }, { quoted: mek });
            }
        }
    } else {
        await conn.sendMessage(from, { text: "❌ No download links available for this movie." }, { quoted: mek });
    }
}
