const configStore =
    require("./configStore");

const securityLog =
    require("./logger");

const quarantine =
    require("./quarantine");

async function handleBot(member) {

    if (!member.user.bot) {
        return;
    }

    const config =
        configStore.get(
            member.guild.id
        );

    if (!config.antiBot) {
        return;
    }

    /*
     * Bot trong whitelist được phép hoạt động.
     */

    if (
        config.whitelistUsers.includes(
            member.id
        )
    ) {
        return;
    }

    /*
     * Nếu bot có quyền Administrator
     * và không nằm trong whitelist,
     * đưa vào quarantine.
     */

    const hasAdmin =
        member.permissions.has(
            "Administrator"
        );

    if (hasAdmin) {

        const success =
            await quarantine.quarantine(
                member,
                "Anti-Bot: Unauthorized Administrator Bot"
            );

        await securityLog(
            member.guild,
            {
                title:
                    "🤖 UNAUTHORIZED BOT",

                description:
                    `Phát hiện bot có quyền Administrator chưa được whitelist.`,

                color:
                    0xff0000,

                fields: [
                    {
                        name: "🤖 Bot",
                        value:
                            `${member.user.tag} (${member.id})`
                    },
                    {
                        name: "🔒 Action",
                        value:
                            success
                                ? "Quarantine"
                                : "Không thể quarantine"
                    }
                ]
            }
        );
    }
}

module.exports = {
    handleBot
};
