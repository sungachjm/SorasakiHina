const configStore =
    require("../services/configStore");

const antiRaid =
    require("../services/antiRaid");

const antiBot =
    require("../services/antiBot");

const quarantine =
    require("../services/quarantine");

const securityLog =
    require("../services/logger");

module.exports = async function(member) {

    const guild =
        member.guild;

    const config =
        configStore.get(
            guild.id
        );

    /*
     * ANTI-BOT
     */

    if (member.user.bot) {

        await antiBot.handleBot(
            member
        );

        return;
    }

    /*
     * ANTI-RAID
     */

    if (!config.antiRaid) {
        return;
    }

    const count =
        antiRaid.registerJoin(
            guild.id,
            member.id
        );

    if (
        antiRaid.isRaid(
            guild.id
        )
    ) {

        await antiRaid.handleRaid(
            guild,
            count
        );

        if (config.quarantine) {

            await quarantine.quarantine(
                member,
                "Anti-Raid: Suspicious Join"
            );
        }

        return;
    }

    /*
     * ACCOUNT AGE CHECK
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

        const success =
            await quarantine.quarantine(
                member,
                "New Discord Account"
            );

        if (success) {

            await securityLog(
                guild,
                {
                    title:
                        "🔒 NEW ACCOUNT",

                    description:
                        `Tài khoản mới được đưa vào quarantine.`,

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
