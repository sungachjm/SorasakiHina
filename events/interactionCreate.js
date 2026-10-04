const configStore =
    require("../services/configStore");

const configCommand =
    require("../commands/config");

const verification =
    require("../services/verification");

module.exports = async function(interaction) {

    // ==========================================
    // SLASH COMMANDS
    // ==========================================

    if (interaction.isChatInputCommand()) {

        const command =
            interaction.client.commands.get(
                interaction.commandName
            );

        if (!command) {
            return;
        }

        try {

            await command.execute(interaction);

        } catch (error) {

            console.error(
                `Command ${interaction.commandName} error:`,
                error
            );

            const response = {
                content:
                    "❌ Đã xảy ra lỗi khi thực hiện lệnh.",
                ephemeral: true
            };

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp(
                        response
                    );

                } else {

                    await interaction.reply(
                        response
                    );
                }

            } catch (replyError) {

                console.error(
                    "Interaction reply error:",
                    replyError.message
                );
            }
        }

        return;
    }


    // ==========================================
    // BUTTONS
    // ==========================================

    if (!interaction.isButton()) {
        return;
    }


    // ==========================================
    // VERIFICATION BUTTON
    // ==========================================

    if (
        interaction.customId ===
        "protector_verify"
    ) {

        try {

            await interaction.deferReply({
                ephemeral: true
            });

            if (
                !interaction.guild ||
                !interaction.member
            ) {

                return interaction.editReply({
                    content:
                        "❌ Không thể xác minh ở đây."
                });
            }

            const result =
                await verification.verifyMember(
                    interaction.member
                );

            if (!result.success) {

                return interaction.editReply({
                    content:
                        `❌ Xác minh thất bại: ${result.reason}`
                });
            }

            return interaction.editReply({
                content:
                    "✅ **Xác minh thành công!**\n" +
                    "Bạn đã được cấp quyền truy cập server."
            });

        } catch (error) {

            console.error(
                "Verification interaction error:",
                error
            );

            try {

                if (interaction.deferred) {

                    return interaction.editReply({
                        content:
                            "❌ Đã xảy ra lỗi trong quá trình xác minh."
                    });

                }

            } catch {}

            return;
        }
    }


    // ==========================================
    // PROTECTOR CONFIG BUTTONS
    // ==========================================

    if (
        !interaction.customId.startsWith(
            "protector_"
        )
    ) {
        return;
    }


    // Chỉ OWNER_ID được sử dụng Config
    if (
        !process.env.OWNER_ID ||
        interaction.user.id !==
        process.env.OWNER_ID
    ) {

        return interaction.reply({
            content:
                "❌ Chỉ Owner của bot mới có thể sử dụng Protector Config.",
            ephemeral: true
        });
    }


    if (!interaction.guild) {

        return interaction.reply({
            content:
                "❌ Chức năng này chỉ dùng trong server.",
            ephemeral: true
        });
    }


    const guildId =
        interaction.guild.id;

    const config =
        configStore.get(guildId);


    // ==========================================
    // CONFIG SETTINGS
    // ==========================================

    const settings = {

        protector_antinuke:
            "antiNuke",

        protector_antiraid:
            "antiRaid",

        protector_antispam:
            "antiSpam",

        protector_antilink:
            "antiLink",

        protector_antiphishing:
            "antiPhishing",

        protector_antiwebhook:
            "antiWebhook",

        protector_antibot:
            "antiBot",

        protector_quarantine:
            "quarantine"
    };


    const setting =
        settings[
            interaction.customId
        ];


    // ==========================================
    // TOGGLE SECURITY
    // ==========================================

    if (setting) {

        const newValue =
            !config[setting];

        configStore.update(
            guildId,
            {
                [setting]:
                    newValue
            }
        );

        try {

            await interaction.update(
                configCommand.createPanel(
                    interaction.guild
                )
            );

        } catch (error) {

            console.error(
                "Config update error:",
                error.message
            );
        }

        return;
    }


    // ==========================================
    // LANGUAGE
    // ==========================================

    if (
        interaction.customId ===
        "protector_language"
    ) {

        const newLanguage =
            config.language === "vi"
                ? "en"
                : "vi";

        configStore.update(
            guildId,
            {
                language:
                    newLanguage
            }
        );

        return interaction.update(
            configCommand.createPanel(
                interaction.guild
            )
        );
    }


    // ==========================================
    // REFRESH
    // ==========================================

    if (
        interaction.customId ===
        "protector_refresh"
    ) {

        return interaction.update(
            configCommand.createPanel(
                interaction.guild
            )
        );
    }
};
