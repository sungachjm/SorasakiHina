const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Xóa nhiều tin nhắn.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        )
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Số tin nhắn cần xóa.")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.memberPermissions?.has(
            PermissionFlagsBits.ManageMessages
        )) {
            return interaction.reply({
                content:
                    "❌ Bạn cần quyền Manage Messages.",
                ephemeral: true
            });
        }

        const amount =
            interaction.options.getInteger("amount");

        if (
            !interaction.channel ||
            !interaction.channel.isTextBased()
        ) {
            return interaction.reply({
                content:
                    "❌ Không thể sử dụng lệnh ở kênh này.",
                ephemeral: true
            });
        }

        try {
            const deleted =
                await interaction.channel.bulkDelete(
                    amount,
                    true
                );

            return interaction.reply({
                content:
                    `🧹 Đã xóa **${deleted.size}** tin nhắn.`,
                ephemeral: true
            });

        } catch (error) {
            console.error("Clear error:", error);

            return interaction.reply({
                content:
                    "❌ Không thể xóa tin nhắn.",
                ephemeral: true
            });
        }
    }
};
