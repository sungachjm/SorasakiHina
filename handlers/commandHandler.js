const fs = require("node:fs");
const path = require("node:path");

function loadCommands(client) {
    const commandsPath =
        path.join(__dirname, "..", "commands");

    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, {
            recursive: true
        });
    }

    const files = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const command =
                require(
                    path.join(commandsPath, file)
                );

            if (
                !command.data ||
                !command.execute
            ) {
                console.warn(
                    `⚠️ Invalid command: ${file}`
                );

                continue;
            }

            client.commands.set(
                command.data.name,
                command
            );

            console.log(
                `✅ Command loaded: ${command.data.name}`
            );
        } catch (error) {
            console.error(
                `❌ Failed to load ${file}:`,
                error.message
            );
        }
    }
}

module.exports = loadCommands;
