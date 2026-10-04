const configStore = require("./configStore");
const securityLog = require("./logger");

async function verifyMember(member) {
    const config = configStore.get(member.guild.id);

    if (!config.verificationRoleId) {
        return {
            success: false,
            reason: "Chưa cấu hình Verification Role."
        };
    }

    const role = member.guild.roles.cache.get(
        config.verificationRoleId
    );

    if (!role) {
        return {
            success: false,
            reason: "Verification Role không tồn tại."
        };
    }

    try {
        if (!member.roles.cache.has(role.id)) {
            await member.roles.add(
                role,
                "Protector Verification"
            );
        }

        if (
            config.quarantineRoleId &&
            member.roles.cache.has(
                config.quarantineRoleId
            )
        ) {
            await member.roles.remove(
                config.quarantineRoleId,
                "Protector Verification"
            );
        }

        await securityLog(member.guild, {
            title: "✅ MEMBER VERIFIED",
            description:
                `Đã xác minh <@${member.id}>.`,
            color: 0x00ff00,
            fields: [
                {
                    name: "👤 User",
                    value:
                        `${member.user.tag} (${member.id})`
                },
                {
                    name: "🎭 Role",
                    value: `${role}`
                }
            ]
        });

        return {
            success: true
        };

    } catch (error) {
        console.error(
            "Verification error:",
            error.message
        );

        return {
            success: false,
            reason:
                "Bot không có quyền quản lý role này."
        };
    }
}

module.exports = {
    verifyMember
};
