const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban một thành viên khỏi server.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Người cần ban.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Lý do ban.")
                .setRequired(false)
        ),

    async execute(interaction) {

        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.BanMembers
            )
        ) {
            return interaction.reply({
                content: "❌ Bạn cần quyền Ban Members.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser("user");

        const reason =
            interaction.options.getString("reason") ||
            "Không có lý do.";

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Bạn không thể tự ban mình.",
                ephemeral: true
            });
        }

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (member) {

            if (
                !member.bannable
            ) {
                return interaction.reply({
                    content:
                        "❌ Bot không thể ban thành viên này. Kiểm tra Role Hierarchy.",
                    ephemeral: true
                });
            }
        }

        try {

            await interaction.guild.members.ban(
                user.id,
                {
                    reason:
                        `${reason} | By ${interaction.user.tag}`
                }
            );

            return interaction.reply({
                content:
                    `🔨 Đã ban **${user.tag}**.\n📝 Lý do: ${reason}`
            });

        } catch (error) {

            console.error("Ban error:", error);

            return interaction.reply({
                content:
                    "❌ Không thể ban thành viên này.",
                ephemeral: true
            });
        }
    }
};
