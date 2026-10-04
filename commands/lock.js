const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const securityLog =
    require("../services/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Khóa kênh hiện tại.")
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
                    SendMessages: false
                }
            );

            await securityLog(interaction.guild, {
                title: "🔒 Channel Locked",
                description:
                    `${channel} đã được khóa bởi ${interaction.user}.`,
                color: 0xff9900
            });

            return interaction.reply({
                content:
                    `🔒 Đã khóa ${channel}.`
            });
        } catch (error) {
            console.error("Lock error:", error);

            return interaction.reply({
                content:
                    "❌ Không thể khóa kênh.",
                ephemeral: true
            });
        }
    }
};
