const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const configStore =
    require("../services/configStore");

function getStatus(value) {
    return value
        ? "🟢 ĐANG BẬT"
        : "🔴 ĐANG TẮT";
}

function createPanel(guild) {
    const config =
        configStore.get(guild.id);

    const embed = new EmbedBuilder()
        .setTitle("🛡️ PROTECTOR CONTROL PANEL")
        .setDescription(
            "Quản lý hệ thống bảo vệ server bằng các nút bên dưới."
        )
        .addFields(
            {
                name: "🛡️ Anti-Nuke",
                value: getStatus(config.antiNuke),
                inline: true
            },
            {
                name: "🚨 Anti-Raid",
                value: getStatus(config.antiRaid),
                inline: true
            },
            {
                name: "💬 Anti-Spam",
                value: getStatus(config.antiSpam),
                inline: true
            },
            {
                name: "🔗 Anti-Link",
                value: getStatus(config.antiLink),
                inline: true
            },
            {
                name: "🎣 Anti-Phishing",
                value: getStatus(config.antiPhishing),
                inline: true
            },
            {
                name: "🔧 Anti-Webhook",
                value: getStatus(config.antiWebhook),
                inline: true
            },
            {
                name: "🤖 Anti-Bot",
                value: getStatus(config.antiBot),
                inline: true
            },
            {
                name: "🔒 Quarantine",
                value: getStatus(config.quarantine),
                inline: true
            },
            {
                name: "🌐 Language",
                value:
                    config.language === "vi"
                        ? "🇻🇳 Vietnamese"
                        : "🇬🇧 English",
                inline: true
            }
        )
        .setColor(0x5865F2)
        .setFooter({
            text: "Protector Security System"
        })
        .setTimestamp();

    const row1 =
        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(
                    "protector_antinuke"
                )
                .setLabel("Anti-Nuke")
                .setEmoji("🛡️")
                .setStyle(
                    ButtonStyle.Danger
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_antiraid"
                )
                .setLabel("Anti-Raid")
                .setEmoji("🚨")
                .setStyle(
                    ButtonStyle.Danger
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_antispam"
                )
                .setLabel("Anti-Spam")
                .setEmoji("💬")
                .setStyle(
                    ButtonStyle.Primary
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_antilink"
                )
                .setLabel("Anti-Link")
                .setEmoji("🔗")
                .setStyle(
                    ButtonStyle.Primary
                )
        );

    const row2 =
        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(
                    "protector_antiphishing"
                )
                .setLabel("Anti-Phishing")
                .setEmoji("🎣")
                .setStyle(
                    ButtonStyle.Secondary
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_antiwebhook"
                )
                .setLabel("Anti-Webhook")
                .setEmoji("🔧")
                .setStyle(
                    ButtonStyle.Secondary
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_antibot"
                )
                .setLabel("Anti-Bot")
                .setEmoji("🤖")
                .setStyle(
                    ButtonStyle.Secondary
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_quarantine"
                )
                .setLabel("Quarantine")
                .setEmoji("🔒")
                .setStyle(
                    ButtonStyle.Secondary
                )
        );

    const row3 =
        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(
                    "protector_language"
                )
                .setLabel("Language")
                .setEmoji("🌐")
                .setStyle(
                    ButtonStyle.Success
                ),

            new ButtonBuilder()
                .setCustomId(
                    "protector_refresh"
                )
                .setLabel("Refresh")
                .setEmoji("🔄")
                .setStyle(
                    ButtonStyle.Success
                )
        );

    return {
        embeds: [embed],
        components: [
            row1,
            row2,
            row3
        ]
    };
}

module.exports = {

    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription(
            "Mở bảng điều khiển Protector."
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
                    "❌ Bạn cần quyền **Manage Server** để sử dụng lệnh này.",
                ephemeral: true
            });
        }

        await interaction.reply({
            ...createPanel(
                interaction.guild
            ),
            ephemeral: true
        });
    },

    createPanel
};
