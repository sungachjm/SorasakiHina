module.exports = async function(client) {
    console.log("");
    console.log("==============================");
    console.log("🛡️ PROTECTOR BOT");
    console.log("==============================");
    console.log(
        `🤖 Bot: ${client.user.tag}`
    );
    console.log(
        `🏠 Servers: ${client.guilds.cache.size}`
    );
    console.log("==============================");
    console.log("✅ Bot is online!");
    console.log("");

    client.user.setPresence({
        activities: [
            {
                name: "/config | Protector",
                type: 3
            }
        ],
        status: "online"
    });
};
