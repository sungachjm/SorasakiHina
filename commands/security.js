const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const configStore =
    require("../services/configStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("security")
        .setDescription(
            "Xem trạng thái bảo mật của server."
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
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

        const config =
            configStore.get(
                interaction.guild.id
            );

        const status = value =>
            value ? "🟢 BẬT" : "🔴 TẮT";

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "🛡️ SERVER SECURITY STATUS"
                )
                .setDescription(
                    "Trạng thái hệ thống bảo vệ hiện tại."
                )
                .setColor(0x5865f2)
                .addFields(
                    {
                        name: "🛡️ Anti-Nuke",
                        value: status(config.antiNuke),
                        inline: true
                    },
                    {
                        name: "🚨 Anti-Raid",
                        value: status(config.antiRaid),
                        inline: true
                    },
                    {
                        name: "💬 Anti-Spam",
                        value: status(config.antiSpam),
                        inline: true
                    },
                    {
                        name: "🔗 Anti-Link",
                        value: status(config.antiLink),
                        inline: true
                    },
                    {
                        name: "🎣 Anti-Phishing",
                        value: status(config.antiPhishing),
                        inline: true
                    },
                    {
                        name: "🔧 Anti-Webhook",
                        value: status(config.antiWebhook),
                        inline: true
                    },
                    {
                        name: "🤖 Anti-Bot",
                        value: status(config.antiBot),
                        inline: true
                    },
                    {
                        name: "🔒 Quarantine",
                        value: status(config.quarantine),
                        inline: true
                    },
                    {
                        name: "🚨 Lockdown",
                        value: status(config.lockdown),
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
};
