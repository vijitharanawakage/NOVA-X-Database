const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {

SESSION_ID: process.env.SESSION_ID === undefined ? 'KSMD~yhQSDJSC#W4T-ig9ejWwgs4Ci6B2YP7jorMcNf6u9bIBBjW5GZC8' : process.env.SESSION_ID,
PREFIX: process.env.PREFIX || '.',
FOOTER: process.env.FOOTER || '> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴏᴠᴀ-x-ᴍᴅ 💸*',
BOT_NAME: process.env.BOT_NAME || '𝐍ｏ𝐕𝐀-ｘ Ｍ𝐃',
BUTTON: process.env.BUTTON || 'true',
OWNER_NAME: process.env.OWNER_NAME || '_Mr Unknown X Luxalgo_',
MODE: process.env.MODE === undefined ?"groups" : process.env.MODE,
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS === undefined ?"true" : process.env.AUTO_READ_STATUS
};
