require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

const commands = [];

const commandsPath = path.join(
    __dirname,
    "commands"
);

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    try {
        const command = require(
            path.join(commandsPath, file)
        );

        if (!command.data) {
            console.warn(
                `⚠️ Bỏ qua command: ${file}`
            );
            continue;
        }

        commands.push(
            command.data.toJSON()
        );
    } catch (error) {
        console.error(
            `❌ Lỗi command ${file}:`,
            error.message
        );
    }
}

const rest = new REST({
    version: "10"
}).setToken(
    process.env.DISCORD_TOKEN
);

async function deploy() {
    try {
        console.log(
            `🔄 Đang đăng ký ${commands.length} Slash Commands...`
        );

        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.GUILD_ID
                ),
                {
                    body: commands
                }
            );

            console.log(
                "✅ Đã đăng ký Guild Commands!"
            );
        } else {
            await rest.put(
                Routes.applicationCommands(
                    process.env.CLIENT_ID
                ),
                {
                    body: commands
                }
            );

            console.log(
                "✅ Đã đăng ký Global Commands!"
            );
        }

    } catch (error) {
        console.error(
            "❌ Deploy commands thất bại:",
            error
        );
    }
}

deploy();
