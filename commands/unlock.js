const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const securityLog =
    require("../services/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Mở khóa kênh hiện tại.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {
        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return interaction.reply({
                content: "❌ Bạn cần quyền Manage Channels.",
                ephemeral: true
            });
        }

        const channel = interaction.channel;

        try {
            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                {
                    SendMessages: null
                }
            );

            await securityLog(interaction.guild, {
                title: "🔓 Channel Unlocked",
                description:
                    `${channel} đã được mở khóa bởi ${interaction.user}.`,
                color: 0x00ff00
            });

            return interaction.reply({
                content:
                    `🔓 Đã mở khóa ${channel}.`
            });
        } catch (error) {
            console.error("Unlock error:", error);

            return interaction.reply({
                content:
                    "❌ Không thể mở khóa kênh.",
                ephemeral: true
            });
        }
    }
};
