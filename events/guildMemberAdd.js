const configStore =
    require("../services/configStore");

const antiRaid =
    require("../services/antiRaid");

const securityLog =
    require("../services/logger");

async function quarantineMember(
    member
) {
    const config =
        configStore.get(
            member.guild.id
        );

    if (!config.quarantineRoleId) {
        return false;
    }

    const role =
        member.guild.roles.cache.get(
            config.quarantineRoleId
        );

    if (!role) {
        return false;
    }

    try {
        await member.roles.add(
            role,
            "Protector Anti-Raid"
        );

        return true;
    } catch (error) {
        console.error(
            "Quarantine error:",
            error.message
        );

        return false;
    }
}

module.exports = async function(member) {

    const guild =
        member.guild;

    const config =
        configStore.get(
            guild.id
        );

    if (!config.antiRaid) {
        return;
    }

    /*
     * Không xử lý bot nếu Anti-Bot tắt
     */

    if (
        member.user.bot &&
        !config.antiBot
    ) {
        return;
    }

    const count =
        antiRaid.registerJoin(
            guild.id,
            member.id
        );

    /*
     * Phát hiện raid
     */

    if (
        antiRaid.isRaid(
            guild.id
        )
    ) {

        await antiRaid.handleRaid(
            guild,
            count
        );

        /*
         * Đưa người mới vào quarantine
         */

        if (config.quarantine) {
            await quarantineMember(
                member
            );
        }

        return;
    }

    /*
     * Tài khoản quá mới
     *
     * Dưới 24 giờ tuổi
     */

    const accountAge =
        Date.now() -
        member.user.createdTimestamp;

    const oneDay =
        24 * 60 * 60 * 1000;

    if (
        config.quarantine &&
        accountAge < oneDay
    ) {

        const quarantined =
            await quarantineMember(
                member
            );

        if (quarantined) {
            await securityLog(
                guild,
                {
                    title:
                        "🔒 New Account Quarantined",

                    description:
                        `Đã đưa tài khoản mới vào quarantine.`,

                    color:
                        0xffa500,

                    fields: [
                        {
                            name: "👤 User",
                            value:
                                `${member.user.tag} (${member.id})`
                        },
                        {
                            name: "📅 Account Age",
                            value:
                                "Dưới 24 giờ"
                        }
                    ]
                }
            );
        }
    }
};
