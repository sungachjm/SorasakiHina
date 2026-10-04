const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Gỡ ban một thành viên.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        )
        .addStringOption(option =>
            option
                .setName("userid")
                .setDescription("Discord User ID.")
                .setRequired(true)
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

        const userId =
            interaction.options.getString("userid");

        if (!/^\d{17,20}$/.test(userId)) {
            return interaction.reply({
                content:
                    "❌ User ID không hợp lệ.",
                ephemeral: true
            });
        }

        try {

            const ban =
                await interaction.guild.bans
                    .fetch(userId)
                    .catch(() => null);

            if (!ban) {
                return interaction.reply({
                    content:
                        "❌ User này không nằm trong danh sách ban.",
                    ephemeral: true
                });
            }

            await interaction.guild.members.unban(
                userId,
                `Unban by ${interaction.user.tag}`
            );

            return interaction.reply({
                content:
                    `🔓 Đã unban **${ban.user.tag}**.`
            });

        } catch (error) {

            console.error(
                "Unban error:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Không thể unban user này.",
                ephemeral: true
            });
        }
    }
};
