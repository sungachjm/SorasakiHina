const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(role) {

    if (!role.guild) {
        return;
    }

    await antiNuke.detect(
        role.guild,
        {
            type:
                AuditLogEvent.RoleDelete,

            targetId:
                role.id,

            action:
                "ROLE_DELETE",

            limit:
                3,

            description:
                `Role **${role.name}** vừa bị xóa.`
        }
    );
};
