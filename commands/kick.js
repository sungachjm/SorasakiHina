const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick một thành viên khỏi server.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Người cần kick.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Lý do kick.")
                .setRequired(false)
        ),

    async execute(interaction) {

        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.KickMembers
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Bạn cần quyền Kick Members.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser("user");

        const reason =
            interaction.options.getString("reason") ||
            "Không có lý do.";

        if (
            user.id === interaction.user.id
        ) {
            return interaction.reply({
                content:
                    "❌ Bạn không thể tự kick mình.",
                ephemeral: true
            });
        }

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (!member) {
            return interaction.reply({
                content:
                    "❌ Thành viên này không ở trong server.",
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content:
                    "❌ Bot không thể kick thành viên này. Kiểm tra Role Hierarchy.",
                ephemeral: true
            });
        }

        try {

            await member.kick(
                `${reason} | By ${interaction.user.tag}`
            );

            return interaction.reply({
                content:
                    `👢 Đã kick **${user.tag}**.\n📝 Lý do: ${reason}`
            });

        } catch (error) {

            console.error(
                "Kick error:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Không thể kick thành viên này.",
                ephemeral: true
            });
        }
    }
};
