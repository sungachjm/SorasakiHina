const {
    AuditLogEvent
} = require("discord.js");

const antiNuke =
    require("../services/antiNuke");

module.exports = async function(
    ban
) {

    await antiNuke.detect(
        ban.guild,
        {
            type:
                AuditLogEvent.MemberBanAdd,

            targetId:
                ban.user.id,

            action:
                "MEMBER_BAN",

            limit:
                3,

            description:
                `Phát hiện ban thành viên hàng loạt.`
        }
    );
};
