// events/roleDelete.js

const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(role) {
    if (!role.guild) {
        return;
    }

    await antiNuke.handleAction(
        role.guild,
        AuditLogEvent.RoleDelete,
        "Xóa Role"
    );
};
