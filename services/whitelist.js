const configStore =
    require("./configStore");

function isWhitelistedMember(member) {
    if (!member || !member.guild) {
        return false;
    }

    const config =
        configStore.get(member.guild.id);

    // Whitelist trực tiếp theo User ID
    if (
        config.whitelistUsers.includes(
            member.id
        )
    ) {
        return true;
    }

    // Whitelist theo Role
    if (
        member.roles?.cache?.some(role =>
            config.whitelistRoles.includes(
                role.id
            )
        )
    ) {
        return true;
    }

    return false;
}

function isWhitelistedUser(
    guild,
    userId
) {
    if (!guild || !userId) {
        return false;
    }

    const config =
        configStore.get(guild.id);

    return config.whitelistUsers.includes(
        userId
    );
}

function isWhitelistedRole(
    guild,
    roleId
) {
    if (!guild || !roleId) {
        return false;
    }

    const config =
        configStore.get(guild.id);

    return config.whitelistRoles.includes(
        roleId
    );
}

module.exports = {
    isWhitelistedMember,
    isWhitelistedUser,
    isWhitelistedRole
};
