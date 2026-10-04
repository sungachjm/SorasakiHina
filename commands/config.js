const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const configStore =
    require("../services/configStore");

function createPanel(guild) {
    const config =
        configStore.get(guild.id);

    const status = value =>
        value ? "🟢 BẬT" : "🔴 TẮT";

    const embed =
        new EmbedBuilder()
            .setTitle("🛡️ PROTECTOR SECURITY")
            .setDescription(
                "Bảng điều khiển bảo mật server.\n\n" +
                "Chọn chức năng bên dưới để bật/tắt."
            )
            .setColor(0x5865F2)
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
                    name: "🌐 Language",
                    value:
                        config.language === "vi"
                            ? "🇻🇳 Tiếng Việt"
                            : "🇺🇸 English",
                    inline: true
                }
            )
            .setFooter({
                text: "Protector Security System"
            })
            .setTimestamp();

    const row1 =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("protector_antinuke")
                    .setLabel("Anti-Nuke")
                    .setEmoji("🛡️")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("protector_antiraid")
                    .setLabel("Anti-Raid")
                    .setEmoji("🚨")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("protector_antispam")
                    .setLabel("Anti-Spam")
                    .setEmoji("💬")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("protector_antilink")
                    .setLabel("Anti-Link")
                    .setEmoji("🔗")
                    .setStyle(ButtonStyle.Primary)
            );

    const row2 =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("protector_antiphishing")
                    .setLabel("Anti-Phishing")
                    .setEmoji("🎣")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("protector_antiwebhook")
                    .setLabel("Anti-Webhook")
                    .setEmoji("🔧")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("protector_antibot")
                    .setLabel("Anti-Bot")
                    .setEmoji("🤖")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("protector_quarantine")
                    .setLabel("Quarantine")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Secondary)
            );

    const row3 =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("protector_language")
                    .setLabel("Language")
                    .setEmoji("🌐")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("protector_refresh")
                    .setLabel("Refresh")
                    .setEmoji("🔄")
                    .setStyle(ButtonStyle.Success)
            );

    return {
        embeds: [embed],
        components: [row1, row2, row3]
    };
}

module.exports = {

    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription(
            "Mở bảng điều khiển Protector."
        ),

    async execute(interaction) {

        if (
            !process.env.OWNER_ID ||
            interaction.user.id !==
            process.env.OWNER_ID
        ) {
            return interaction.reply({
                content:
                    "❌ Bạn không có quyền sử dụng Protector Config.",
                ephemeral: true
            });
        }

        if (!interaction.guild) {
            return interaction.reply({
                content:
                    "❌ Lệnh này chỉ sử dụng trong server.",
                ephemeral: true
            });
        }

        return interaction.reply({
            ...createPanel(interaction.guild),
            ephemeral: true
        });
    },

    createPanel
};
