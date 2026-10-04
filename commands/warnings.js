const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

const FILE =
    path.join(
        __dirname,
        "..",
        "data",
        "warnings.json"
    );

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Xem cảnh cáo của thành viên.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Thành viên cần xem.")
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

        const user =
            interaction.options.getUser("user");

        if (!fs.existsSync(FILE)) {
            return interaction.reply({
                content:
                    `📋 **${user.tag}** chưa có cảnh cáo.`,
                ephemeral: true
            });
        }

        let data;

        try {
            data = JSON.parse(
                fs.readFileSync(FILE, "utf8")
            );
        } catch {
            data = {};
        }

        const warnings =
            data?.[interaction.guild.id]?.[user.id] || [];

        if (warnings.length === 0) {
            return interaction.reply({
                content:
                    `📋 **${user.tag}** chưa có cảnh cáo.`,
                ephemeral: true
            });
        }

        const description =
            warnings
                .slice(-10)
                .map((warning, index) => {
                    const date =
                        `<t:${Math.floor(
                            warning.timestamp / 1000
                        )}:R>`;

                    return (
                        `**${index + 1}.** ${warning.reason}\n` +
                        `👮 <@${warning.moderator}> • ${date}`
                    );
                })
                .join("\n\n");

        const embed =
            new EmbedBuilder()
                .setTitle(`⚠️ Warnings — ${user.tag}`)
                .setDescription(description)
                .setColor(0xFFA500)
                .setFooter({
                    text:
                        `Tổng: ${warnings.length} cảnh cáo`
                });

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
