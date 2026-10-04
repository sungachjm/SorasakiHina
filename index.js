const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require("discord.js");

const loadCommands =
    require("./handlers/commandHandler");

const loadEvents =
    require("./handlers/eventHandler");

if (!process.env.DISCORD_TOKEN) {
    throw new Error(
        "❌ DISCORD_TOKEN chưa được cấu hình!"
    );
}

if (!process.env.CLIENT_ID) {
    throw new Error(
        "❌ CLIENT_ID chưa được cấu hình!"
    );
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ],

    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember
    ]
});

client.commands = new Collection();

loadCommands(client);
loadEvents(client);

process.on(
    "unhandledRejection",
    error => {
        console.error(
            "Unhandled rejection:",
            error
        );
    }
);

process.on(
    "uncaughtException",
    error => {
        console.error(
            "Uncaught exception:",
            error
        );
    }
);

client.login(
    process.env.DISCORD_TOKEN
);
