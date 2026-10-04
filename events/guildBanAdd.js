const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(ban) {
    if (!ban.guild) {
        return;
    }

    await antiNuke.handleAction(
        ban.guild,
        AuditLogEvent.MemberBanAdd,
        "Ban Member"
    );
};
