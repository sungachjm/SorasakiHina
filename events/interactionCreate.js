const {
    PermissionFlagsBits
} = require("discord.js");

const configStore =
    require("../services/configStore");

const configCommand =
    require("../commands/config");

module.exports = async function(interaction) {

    // =====================================
    // SLASH COMMAND
    // =====================================

    if (
        interaction.isChatInputCommand()
    ) {

        const command =
            interaction.client.commands.get(
                interaction.commandName
            );

        if (!command) {
            return;
        }

        try {

            await command.execute(
                interaction
            );

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
        }

        return;
    }

    // =====================================
    // BUTTON
    // =====================================

    if (!interaction.isButton()) {
        return;
    }

    if (
        !interaction.customId.startsWith(
            "protector_"
        )
    ) {
        return;
    }

    // =====================================
    // CHECK PERMISSION
    // =====================================

    if (
        !interaction.memberPermissions?.has(
            PermissionFlagsBits.ManageGuild
        )
    ) {
        return interaction.reply({
            content:
                "❌ Bạn cần quyền **Manage Server**.",
            ephemeral: true
        });
    }

    const guildId =
        interaction.guild.id;

    const config =
        configStore.get(guildId);

    // =====================================
    // SETTINGS MAP
    // =====================================

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

    // =====================================
    // TOGGLE SECURITY
    // =====================================

    if (setting) {

        const newValue =
            !config[setting];

        configStore.update(
            guildId,
            {
                [setting]: newValue
            }
        );

        await interaction.update(
            configCommand.createPanel(
                interaction.guild
            )
        );

        return;
    }

    // =====================================
    // LANGUAGE
    // =====================================

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
                language: newLanguage
            }
        );

        await interaction.update(
            configCommand.createPanel(
                interaction.guild
            )
        );

        return;
    }

    // =====================================
    // REFRESH
    // =====================================

    if (
        interaction.customId ===
        "protector_refresh"
    ) {

        await interaction.update(
            configCommand.createPanel(
                interaction.guild
            )
        );

        return;
    }
};
