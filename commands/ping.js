const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(
            "Kiểm tra độ trễ của bot."
        ),

    async execute(interaction) {
        await interaction.reply({
            content:
                `🏓 Pong! ${interaction.client.ws.ping}ms`,
            ephemeral: true
        });
    }
};
