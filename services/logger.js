const {
    EmbedBuilder
} = require("discord.js");

const configStore =
    require("./configStore");

async function securityLog(
    guild,
    {
        title,
        description = "",
        color = 0xff0000,
        fields = []
    }
) {
    const config =
        configStore.get(guild.id);

    if (!config.logChannelId) {
        return;
    }

    const channel =
        guild.channels.cache.get(
            config.logChannelId
        );

    if (!channel) {
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({
            text: "Protector Security System"
        });

    if (fields.length > 0) {
        embed.addFields(fields);
    }

    try {
        await channel.send({
            embeds: [embed]
        });
    } catch (error) {
        console.error(
            "Security log error:",
            error.message
        );
    }
}

module.exports = securityLog;
