const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const quarantine =
    require("../services/quarantine");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("quarantine")
        .setDescription(
            "Quản lý khu vực cách ly."
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )

        .addSubcommand(sub =>
            sub
                .setName("add")
                .setDescription(
                    "Đưa thành viên vào quarantine."
                )
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription(
                            "Thành viên cần cách ly."
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("remove")
                .setDescription(
                    "Gỡ thành viên khỏi quarantine."
                )
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription(
                            "Thành viên cần gỡ."
                        )
                        .setRequired(true)
                )
        ),

    async execute(interaction) {

        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.ManageGuild
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Bạn cần quyền Manage Server.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser(
                "user"
            );

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (!member) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy thành viên.",
                ephemeral: true
            });
        }

        const subcommand =
            interaction.options.getSubcommand();

        if (
            subcommand === "add"
        ) {

            const success =
                await quarantine.quarantine(
                    member,
                    `Manual quarantine by ${interaction.user.tag}`
                );

            return interaction.reply({
                content:
                    success
                        ? `🔒 Đã quarantine ${member}.`
                        : "❌ Không thể quarantine thành viên này.",
                ephemeral: true
            });
        }

        if (
            subcommand === "remove"
        ) {

            const success =
                await quarantine.unquarantine(
                    member
                );

            return interaction.reply({
                content:
                    success
                        ? `🔓 Đã gỡ quarantine ${member}.`
                        : "❌ Không thể gỡ quarantine.",
                ephemeral: true
            });
        }
    }
};
