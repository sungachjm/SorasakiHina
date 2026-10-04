// commands/timeout.js

const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout một thành viên.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Thành viên cần timeout.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Thời gian timeout tính bằng phút.")
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Lý do timeout.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Lệnh này chỉ sử dụng trong server.",
                ephemeral: true
            });
        }

        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.ModerateMembers
            )
        ) {
            return interaction.reply({
                content: "❌ Bạn cần quyền Moderate Members.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser("user");

        const minutes =
            interaction.options.getInteger("minutes");

        const reason =
            interaction.options.getString("reason") ||
            "Không có lý do";

        try {
            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            if (!member) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy thành viên này.",
                    ephemeral: true
                });
            }

            if (member.id === interaction.user.id) {
                return interaction.reply({
                    content:
                        "❌ Bạn không thể tự timeout chính mình.",
                    ephemeral: true
                });
            }

            if (member.id === interaction.guild.ownerId) {
                return interaction.reply({
                    content:
                        "❌ Không thể timeout chủ server.",
                    ephemeral: true
                });
            }

            if (!member.moderatable) {
                return interaction.reply({
                    content:
                        "❌ Bot không thể timeout thành viên này. Hãy đặt role Bot cao hơn role của họ.",
                    ephemeral: true
                });
            }

            await member.timeout(
                minutes * 60 * 1000,
                reason
            );

            return interaction.reply({
                content:
                    `🔇 Đã timeout **${user.tag}** trong **${minutes}** phút.\n📝 Lý do: ${reason}`
            });
        } catch (error) {
            console.error("Timeout error:", error);

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                return interaction.followUp({
                    content:
                        "❌ Không thể timeout thành viên này.",
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    "❌ Không thể timeout thành viên này.",
                ephemeral: true
            });
        }
    }
};
