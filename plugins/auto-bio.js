const moment = require("moment-timezone");
const { cmd } = require("../lib/command");
const config = require("../settings");

const lifeQuotes = [
  "💖 The only way to do great work is to love what you do.",
  "🌟 Strive not to be a success, but rather to be of value.",
  "🧠 The mind is everything. What you think, you become.",
  "🚀 Believe you can and you're halfway there.",
  "🌌 The future belongs to those who believe in their dreams.",
  "⏳ It is never too late to be what you might have been.",
  "🔥 Make the iron hot by striking!",
  "🎨 The best way to predict the future is to create it.",
  "👣 The journey of a thousand miles begins with one step.",
  "😊 Happiness comes from your own actions.",
  "🖤 Always King In The Game.",
  "😏 I am the Artist Who Paints My Life.",
  "☸ I Am Believe In Karma.",
  "⚡ I don’t wait for opportunities, I create them.",
  "🎯 Focus on goals, not obstacles.",
  "🌹 Silence is better than unnecessary drama.",
  "👑 Born to express, not to impress.",
  "🔥 Hustle in silence, let success make the noise.",
  "🌈 Every day is a new beginning, take a deep breath and start again.",
  "🦅 Fly high, no limits.",
  "💎 Pressure creates diamonds, never give up.",
  "🌊 Go with the flow but never forget your goals.",
  "☠️ I fear none, I respect all.",
  "⚔️ Warriors are not born, they are built.",
  "📌 Success is not for the lazy.",
  "🕊️ Peace over everything.",
  "🌍 Be the reason someone smiles today.",
  "🔥 Pain changes people, but it also makes them stronger."
];

let bioUpdateInterval = null;

cmd({
  pattern: "autobio",
  desc: "Enable or disable automatic bio updates with motivational quotes and time.",
  category: "system",
  react: "🧬",
  use: ".autobio",
  filename: __filename,
}, 
async (conn, mek, m, {
  from, sender, reply, isOwner
}) => {

  // 🔒 Block command if AUTO_BIO is disabled in config
  if (config.AUTO_BIO.toLowerCase() !== "true") {
    return reply("❌ Auto Bio system is disabled in config.");
  }

  // Optional: Owner-only check
  if (!isOwner) {
    return reply("⛔ Only the bot owner can use this command.");
  }

  // Function to update the bot's status bio
  const updateBio = async () => {
    try {
      const currentTime = moment().tz("Asia/Colombo").format("HH:mm:ss");
      const quote = lifeQuotes[Math.floor(Math.random() * lifeQuotes.length)];
      const newStatus = `✨📸 𝐍ᴏᴠᴀ-𝐗-𝐌ᴅ 𝐈𝐬 𝐀ᴄᴛɪᴠᴇ 🟢 | ⏰ ${currentTime} 🇱🇰\n💬 ${quote}`;

      await conn.updateProfileStatus(newStatus);
      console.log("✅ Bio updated:", newStatus);
    } catch (err) {
      console.error("❌ Failed to update bio:", err.message);
    }
  };

  // Toggle logic
  if (bioUpdateInterval) {
    clearInterval(bioUpdateInterval);
    bioUpdateInterval = null;
    await reply("🛑 Auto bio updates have been stopped.");
  } else {
    await updateBio(); // Initial run
    bioUpdateInterval = setInterval(updateBio, 60000); // every 1 minute
    await reply("> ✅ Auto bio update enabled..!\n\n```Bot bio will update every 1 minute with current time and quotes.```");
  }
});
