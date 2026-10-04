const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const configStore =
    require("../services/configStore");

const securityLog =
    require("../services/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription(
            "Khóa toàn bộ kênh text trong server."
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

        await interaction.deferReply({
            ephemeral: true
        });

        let locked = 0;

        try {
            const channels =
                interaction.guild.channels.cache.filter(
                    channel =>
                        channel.type ===
                            ChannelType.GuildText ||
                        channel.type ===
                            ChannelType.GuildAnnouncement
                );

            for (const channel of channels.values()) {
                try {
                    await channel.permissionOverwrites.edit(
                        interaction.guild.roles.everyone,
                        {
                            SendMessages: false
                        }
                    );

                    locked++;
                } catch (error) {
                    console.error(
                        `Lockdown ${channel.id}:`,
                        error.message
                    );
                }
            }

            configStore.update(
                interaction.guild.id,
                {
                    lockdown: true
                }
            );

            await securityLog(interaction.guild, {
                title: "🚨 SERVER LOCKDOWN",
                description:
                    `${interaction.user} đã kích hoạt lockdown.`,
                color: 0xff0000,
                fields: [
                    {
                        name: "🔒 Kênh đã khóa",
                        value: `${locked}`,
                        inline: true
                    }
                ]
            });

            return interaction.editReply({
                content:
                    `🚨 **LOCKDOWN ĐÃ KÍCH HOẠT**\n` +
                    `🔒 Đã khóa **${locked}** kênh.`
            });
        } catch (error) {
            console.error(
                "Lockdown error:",
                error
            );

            return interaction.editReply({
                content:
                    "❌ Không thể kích hoạt lockdown."
            });
        }
    }
};
