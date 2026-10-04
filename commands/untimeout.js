const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("untimeout")
        .setDescription("Gỡ timeout của thành viên.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Thành viên cần untimeout.")
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.memberPermissions?.has(
            PermissionFlagsBits.ModerateMembers
        )) {
            return interaction.reply({
                content: "❌ Bạn cần quyền Moderate Members.",
                ephemeral: true
            });
        }

        const user = interaction.options.getUser("user");

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (!member) {
            return interaction.reply({
                content: "❌ Không tìm thấy thành viên.",
                ephemeral: true
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content:
                    "❌ Bot không thể chỉnh sửa thành viên này.",
                ephemeral: true
            });
        }

        try {
            await member.timeout(
                null,
                `Untimeout by ${interaction.user.tag}`
            );

            return interaction.reply({
                content:
                    `🔊 Đã gỡ timeout cho **${user.tag}**.`
            });

        } catch (error) {
            console.error("Untimeout error:", error);

            return interaction.reply({
                content:
                    "❌ Không thể gỡ timeout.",
                ephemeral: true
            });
        }
    }
};
