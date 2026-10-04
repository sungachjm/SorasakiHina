const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(channel) {

    if (!channel.guild) {
        return;
    }

    await antiNuke.detect(
        channel.guild,
        {
            type:
                AuditLogEvent.ChannelDelete,

            targetId:
                channel.id,

            action:
                "CHANNEL_DELETE",

            limit:
                3,

            description:
                `Kênh **${channel.name}** vừa bị xóa.`
        }
    );
};
