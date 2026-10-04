const fs = require("node:fs");
const path = require("node:path");

function loadEvents(client) {
    const eventsPath =
        path.join(__dirname, "..", "events");

    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, {
            recursive: true
        });
    }

    const files = fs
        .readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const event =
                require(
                    path.join(eventsPath, file)
                );

            const eventName =
                file.replace(".js", "");

            client.on(
                eventName,
                (...args) => event(...args)
            );

            console.log(
                `✅ Event loaded: ${eventName}`
            );
        } catch (error) {
            console.error(
                `❌ Failed to load event ${file}:`,
                error.message
            );
        }
    }
}

module.exports = loadEvents;
