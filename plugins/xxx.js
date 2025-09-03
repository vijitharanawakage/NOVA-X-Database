// XVIDEO DOWNLOAD COMMAND

const { cmd } = require('../lib/command')
const { fetchJson } = require('../lib/functions')

const apilink = 'https://www.dark-yasiya-api.site/' // API LINK ( DO NOT CHANGE THIS!! )

cmd({
  pattern: "xv",
  alias: ["xxx", "sex"],
  react: "🔞",
  desc: "Download xvideo.com porn video",
  category: "download",
  use: ".xv <query>",
  filename: __filename
},
async (conn, mek, m, { from, quoted, reply, q }) => {
  try {
    if (!q) return await reply("⚡ *Please provide a search query!*")

    const xv_list = await fetchJson(`${apilink}/search/xvideo?text=${encodeURIComponent(q)}`)
    if (!xv_list.result || xv_list.result.length === 0) {
      return await reply("❌ No results found for your query!")
    }

    // First result
    const firstResult = xv_list.result[0]
    const xv_info = await fetchJson(`${apilink}/download/xvideo?url=${firstResult.url}`)

    if (!xv_info.result || !xv_info.result.dl_link) {
      return await reply("⚠️ Could not fetch video download link. Try another video.")
    }

    const msg = `
🔞 *NOVA X XVIDEO DOWNLOADER* 🔞

🥵 *Title* - ${xv_info.result.title || "Unknown"}
👁️ *Views* - ${xv_info.result.views || "N/A"}
👍 *Likes* - ${xv_info.result.like || "N/A"}

> *POWERED BY NOVA X* 🥷
    `

    // Send preview
    await conn.sendMessage(from, {
      text: msg,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Nova-X',
          newsletterJid: "",
        },
        externalAdReply: {
          title: `Nova X Xvideo Downloader`,
          body: `Search: ${q}`,
          thumbnailUrl: xv_info.result.image,
          sourceUrl: firstResult.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek })

    // Send video file
    await conn.sendMessage(from, {
      document: { url: xv_info.result.dl_link },
      mimetype: "video/mp4",
      fileName: `${xv_info.result.title || "xvideo"}.mp4`,
      caption: xv_info.result.title || "Downloaded Video"
    }, { quoted: mek })

  } catch (error) {
    console.log("XVIDEO CMD ERROR:", error)
    reply("❌ Error: " + (error.message || error))
  }
})
