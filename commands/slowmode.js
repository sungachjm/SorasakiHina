const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Thiết lập Slowmode cho kênh.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        )
        .addIntegerOption(option =>
            option
                .setName("seconds")
                .setDescription(
                    "Số giây Slowmode, 0 để tắt."
                )
                .setMinValue(0)
                .setMaxValue(21600)
                .setRequired(true)
        ),

    async execute(interaction) {
        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Bạn cần quyền Manage Channels.",
                ephemeral: true
            });
        }

        const seconds =
            interaction.options.getInteger("seconds");

        const channel = interaction.channel;

        if (!channel?.setRateLimitPerUser) {
            return interaction.reply({
                content:
                    "❌ Kênh này không hỗ trợ Slowmode.",
                ephemeral: true
            });
        }

        try {
            await channel.setRateLimitPerUser(
                seconds,
                `Slowmode by ${interaction.user.tag}`
            );

            return interaction.reply({
                content:
                    seconds === 0
                        ? "🐢 Đã tắt Slowmode."
                        : `🐢 Đã bật Slowmode: **${seconds} giây**.`
            });
        } catch (error) {
            console.error(
                "Slowmode error:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Không thể thay đổi Slowmode.",
                ephemeral: true
            });
        }
    }
};
