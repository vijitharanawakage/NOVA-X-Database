const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {

SESSION_ID: process.env.SESSION_ID || 'KSMD~39o0DIiI#kpUFQXyUl3FF0piRGAH0tRh5oDhk9FForwp6KL7nnfs',
MONGODB: process.env.MONGODB || "mongodb://mongo:hSKOyytRSHAikyAFUajcmkoJTEcgoBTR@trolley.proxy.rlwy.net:29757",  
PREFIX: process.env.PREFIX || '.',
ALIVE_IMG: process.env.ALIVE_IMG || 'https://files.catbox.moe/er0vnl.png',   
FOOTER: process.env.FOOTER || '> *©卩ᴏᴡᴇʀᴇᴅ ʙʏ ɴᴏᴠᴀ-x ᴍᴅ 👾*',
ALIVE_MSG: process.env.ALIVE_MSG || '👾 Ｗ𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 𝐍ｏ𝐕𝐀-ｘ Ｍ𝐃',
BOT_NAME: process.env.BOT_NAME || '𝐍ｏ𝐕𝐀-ｘ Ｍ𝐃',
MODE: process.env.MODE === undefined ?"groups" : process.env.MODE,
BUTTON: process.env.BUTTON || 'true',
AUTO_REPLY: process.env.AUTO_REPLY || 'true',
AUTO_VOICE: process.env.AUTO_VOICE || 'true',
AUTO_TYPING: process.env.AUTO_TYPING || 'false',
AUTO_BIO: process.env.AUTO_BIO || 'true',
AUTO_RECORDING: process.env.AUTO_RECORDING || 'false',
OWNER_NAME: process.env.OWNER_NAME || '_Mr Unknown X Luxalgo_',
OWNER_NUMBER: process.env.OWNER_NUMBER || ['94723975388','94741259325'],
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS === undefined ?"true" : process.env.AUTO_READ_STATUS
};
