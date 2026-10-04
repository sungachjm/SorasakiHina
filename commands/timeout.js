const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout một thành viên.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Thành viên cần timeout.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Thời gian timeout, tối đa 28 ngày.")
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Lý do.")
                .setRequired(false)
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
        const minutes = interaction.options.getInteger("minutes");
        const reason =
            interaction.options.getString("reason") ||
            "Không có lý do.";

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Bạn không thể tự timeout mình.",
                ephemeral: true
            });
        }

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
                    "❌ Bot không thể timeout thành viên này.",
                ephemeral: true
            });
        }

        try {
            await member.timeout(
                minutes * 60 * 1000,
                `${reason} | By ${interaction.user.tag}`
            );

            return interaction.reply({
                content:
                    `🔇 Đã timeout **${user.tag}** trong
