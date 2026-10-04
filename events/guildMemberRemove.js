const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(member) {
    if (!member.guild) {
        return;
    }

    await antiNuke.handleAction(
        member.guild,
        AuditLogEvent.MemberKick,
        "Kick Member"
    );
};
