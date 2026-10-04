const configStore = require("./configStore");
const securityLog = require("./logger");

async function quarantine(member, reason = "Protector") {
    const config = configStore.get(member.guild.id);

    if (!config.quarantineRoleId) {
        return false;
    }

    const role = member.guild.roles.cache.get(
        config.quarantineRoleId
    );

    if (!role) {
        return false;
    }

    try {
        await member.roles.add(
            role,
            reason
        );

        await securityLog(
            member.guild,
            {
                title: "🔒 QUARANTINE",
                description:
                    `Đã đưa <@${member.id}> vào khu vực cách ly.`,
                color: 0xffa500,
                fields: [
                    {
                        name: "👤 User",
                        value:
                            `${member.user.tag} (${member.id})`
                    },
                    {
                        name: "📝 Reason",
                        value: reason
                    }
                ]
            }
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

async function unquarantine(member) {
    const config = configStore.get(member.guild.id);

    if (!config.quarantineRoleId) {
        return false;
    }

    const role = member.guild.roles.cache.get(
        config.quarantineRoleId
    );

    if (!role) {
        return false;
    }

    try {
        await member.roles.remove(
            role,
            "Protector: Unquarantine"
        );

        return true;
    } catch (error) {
        console.error(
            "Unquarantine error:",
            error.message
        );

        return false;
    }
}

module.exports = {
    quarantine,
    unquarantine
};
