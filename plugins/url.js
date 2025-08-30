const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

cmd({
    pattern: "url",
    desc: "Upload image to catbox.moe",
    category: "tools",
}, async (conn, mek, m, { reply }) => {
    try {
        if (!m.quoted || !m.quoted.message.imageMessage) {
            return reply("📌 Image එකක් reply කරන්න.");
        }

      
        let media = await m.quoted.download();
        let tempFile = "./temp.jpg";
        fs.writeFileSync(tempFile, media);

        
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(tempFile));

       
        const res = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
        });

        await reply("✅ Uploaded Successfully:\n" + res.data);

        // temp file delete
        fs.unlinkSync(tempFile);

    } catch (e) {
        console.log(e);
        reply("❌ Upload Error!");
    }
});
