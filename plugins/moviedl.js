const { cmd } = require("../lib/command");
const axios = require("axios");
const config = require("../settings");

cmd({
    pattern: "moviedl",
    alias: ["movie", "moviesearch", "sinhalamovie"],
    react: "🎬",
    desc: "Search and download Sinhala movies",
    category: "fun",
    use: ".moviedl <movie name>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        if (!args.length) return reply("❌ Usage: .moviedl <movie name>");

        const query = args.join(" ");
        await reply(`🔍 Searching movies for *${query}* ...`);

        // 1️⃣ Search API
        const searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchUrl);
        const movies = searchRes.data.results;

        if (!movies || !movies.length) return reply("❌ No movies found. Try another keyword.");

        // If only one result, fetch movie info directly
        if (movies.length === 1) {
            const movieUrl = movies[0].url;
            const movieInfoRes = await axios.get(`https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(movieUrl)}`);
            const movieData = movieInfoRes.data;

            await conn.sendMessage(from, {
                text: `🎬 *${movieData.title}*\n\n📝 ${movieData.description || "No description"}\n📥 Download: ${movieData.download || "Not available"}\n\n${config.FOOTER}`
            }, { quoted: mek });

            return;
        }

        // If multiple results, send buttons for selection
        if (config.BUTTON === "true") {
            const buttons = movies.slice(0, 5).map((movie, i) => ({
                buttonId: `.moviedl ${movie.title}`,
                buttonText: { displayText: movie.title },
                type: 1
            }));

            await conn.sendMessage(from, {
                text: `🎬 Found multiple movies for *${query}*. Select one:`,
                footer: config.FOOTER,
                buttons,
                headerType: 2
            }, { quoted: mek });
        } else {
            // fallback: list movie titles
            let text = "🎬 Found movies:\n\n";
            movies.slice(0, 5).forEach((movie, i) => {
                text += `• ${movie.title}\n`;
            });
            text += `\nReply with .moviedl <movie name> to get info & download link.`;
            await reply(text);
        }

    } catch (error) {
        console.error("MovieDL Error:", error);
        reply(`❌ Error: ${error.message || "Failed to fetch movies"}`);
    }
});
