const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(channel) {
    if (!channel.guild) {
        return;
    }

    await antiNuke.handleAction(
        channel.guild,
        AuditLogEvent.ChannelDelete,
        "Xóa Channel"
    );
};
