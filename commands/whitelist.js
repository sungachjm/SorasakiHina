const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const configStore =
    require("../services/configStore");

function isOwner(interaction) {
    return (
        process.env.OWNER_ID &&
        interaction.user.id === process.env.OWNER_ID
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription(
            "Quản lý danh sách Whitelist của Protector."
        )
        .addSubcommand(sub =>
            sub
                .setName("add-user")
                .setDescription(
                    "Thêm user vào Whitelist."
                )
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription(
                            "User cần whitelist."
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("remove-user")
                .setDescription(
                    "Xóa user khỏi Whitelist."
                )
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription(
                            "User cần xóa."
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("add-role")
                .setDescription(
                    "Thêm role vào Whitelist."
                )
                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription(
                            "Role cần whitelist."
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("remove-role")
                .setDescription(
                    "Xóa role khỏi Whitelist."
                )
                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription(
                            "Role cần xóa."
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription(
                    "Xem danh sách Whitelist."
                )
        ),

    async execute(interaction) {
        if (!isOwner(interaction)) {
            return interaction.reply({
                content:
                    "❌ Chỉ Owner của bot mới có thể quản lý Whitelist.",
                ephemeral: true
            });
        }

        if (!interaction.guild) {
            return interaction.reply({
                content:
                    "❌ Lệnh này chỉ sử dụng trong server.",
                ephemeral: true
            });
        }

        const subcommand =
            interaction.options.getSubcommand();

        const guildId =
            interaction.guild.id;

        const config =
            configStore.get(guildId);

        if (subcommand === "add-user") {
            const user =
                interaction.options.getUser("user");

            if (
                config.whitelistUsers.includes(
                    user.id
                )
            ) {
                return interaction.reply({
                    content:
                        `⚠️ **${user.tag}** đã có trong Whitelist.`,
                    ephemeral: true
                });
            }

            config.whitelistUsers.push(user.id);

            configStore.update(guildId, {
                whitelistUsers:
                    config.whitelistUsers
            });

            return interaction.reply({
                content:
                    `✅ Đã thêm **${user.tag}** vào Whitelist.`
            });
        }

        if (subcommand === "remove-user") {
            const user =
                interaction.options.getUser("user");

            const users =
                config.whitelistUsers.filter(
                    id => id !== user.id
                );

            if (
                users.length ===
                config.whitelistUsers.length
            ) {
                return interaction.reply({
                    content:
                        `⚠️ **${user.tag}** không có trong Whitelist.`,
                    ephemeral: true
                });
            }

            configStore.update(guildId, {
                whitelistUsers: users
            });

            return interaction.reply({
                content:
                    `✅ Đã xóa **${user.tag}** khỏi Whitelist.`
            });
        }

        if (subcommand === "add-role") {
            const role =
                interaction.options.getRole("role");

            if (
                config.whitelistRoles.includes(
                    role.id
                )
            ) {
                return interaction.reply({
                    content:
                        `⚠️ Role **${role.name}** đã có trong Whitelist.`,
                    ephemeral: true
                });
            }

            config.whitelistRoles.push(role.id);

            configStore.update(guildId, {
                whitelistRoles:
                    config.whitelistRoles
            });

            return interaction.reply({
                content:
                    `✅ Đã thêm role **${role.name}** vào Whitelist.`
            });
        }

        if (subcommand === "remove-role") {
            const role =
                interaction.options.getRole("role");

            const roles =
                config.whitelistRoles.filter(
                    id => id !== role.id
                );

            if (
                roles.length ===
                config.whitelistRoles.length
            ) {
                return interaction.reply({
                    content:
                        `⚠️ Role **${role.name}** không có trong Whitelist.`,
                    ephemeral: true
                });
            }

            configStore.update(guildId, {
                whitelistRoles: roles
            });

            return interaction.reply({
                content:
                    `✅ Đã xóa role **${role.name}** khỏi Whitelist.`
            });
        }

        if (subcommand === "list") {
            const users =
                config.whitelistUsers;

            const roles =
                config.whitelistRoles;

            const userText =
                users.length
                    ? users
                        .map(id => `<@${id}>`)
                        .join("\n")
                    : "Không có";

            const roleText =
                roles.length
                    ? roles
                        .map(id => `<@&${id}>`)
                        .join("\n")
                    : "Không có";

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        "🛡️ PROTECTOR WHITELIST"
                    )
                    .setColor(0x5865f2)
                    .addFields(
                        {
                            name: "👤 Whitelisted Users",
                            value: userText,
                            inline: true
                        },
                        {
                            name: "🎭 Whitelisted Roles",
                            value: roleText,
                            inline: true
                        }
                    )
                    .setFooter({
                        text:
                            "Protector Security System"
                    })
                    .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};
