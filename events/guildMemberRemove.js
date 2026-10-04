const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(member) {

    if (!member.guild) {
        return;
    }

    await antiNuke.detect(
        member.guild,
        {
            type:
                AuditLogEvent.MemberKick,

            targetId:
                member.id,

            action:
                "MEMBER_KICK",

            limit:
                3,

            description:
                `Phát hiện kick thành viên hàng loạt.`
        }
    );
};
