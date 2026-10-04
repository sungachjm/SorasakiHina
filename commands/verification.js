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

module.exports = {

    data: new SlashCommandBuilder()
        .setName("verification")
        .setDescription(
            "Quản lý hệ thống xác minh."
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )

        .addSubcommand(sub =>
            sub
                .setName("setup")
                .setDescription(
                    "Tạo bảng xác minh."
                )
                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription(
                            "Role được cấp sau khi verify."
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("disable")
                .setDescription(
                    "Tắt hệ thống xác minh."
                )
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

        const subcommand =
            interaction.options.getSubcommand();

        if (
            subcommand === "disable"
        ) {

            configStore.update(
                interaction.guild.id,
                {
                    verification: false,
                    verificationRoleId: null
                }
            );

            return interaction.reply({
                content:
                    "🔴 Đã tắt hệ thống Verification.",
                ephemeral: true
            });
        }

        const role =
            interaction.options.getRole(
                "role"
            );

        if (
            role.position >=
            interaction.guild.members.me.roles.highest.position
        ) {
            return interaction.reply({
                content:
                    "❌ Role này phải nằm thấp hơn role cao nhất của bot.",
                ephemeral: true
            });
        }

        configStore.update(
            interaction.guild.id,
            {
                verification: true,
                verificationRoleId: role.id
            }
        );

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "🛡️ SERVER VERIFICATION"
                )
                .setDescription(
                    "Chào mừng bạn đến server!\n\n" +
                    "Nhấn nút **Verify** bên dưới để xác minh và nhận quyền truy cập server."
                )
                .setColor(0x5865F2)
                .addFields({
                    name: "🔐 Bảo mật",
                    value:
                        "Không chia sẻ token, mật khẩu hoặc thông tin tài khoản cho bất kỳ ai."
                })
                .setFooter({
                    text:
                        "Protector Verification System"
                });

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            "protector_verify"
                        )
                        .setLabel("Verify")
                        .setEmoji("✅")
                        .setStyle(
                            ButtonStyle.Success
                        )
                );

        await interaction.reply({
            content:
                "✅ Đã tạo bảng Verification.",
            ephemeral: true
        });

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};
