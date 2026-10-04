const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR =
    path.join(__dirname, "..", "data");

const FILE =
    path.join(DATA_DIR, "warnings.json");

function loadWarnings() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }

    try {
        return JSON.parse(
            fs.readFileSync(FILE, "utf8")
        );
    } catch {
        return {};
    }
}

function saveWarnings(data) {
    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Cảnh cáo một thành viên.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Thành viên cần cảnh cáo.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Lý do cảnh cáo.")
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

        const reason =
            interaction.options.getString("reason");

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Bạn không thể tự warn mình.",
                ephemeral: true
            });
        }

        const data = loadWarnings();

        if (!data[interaction.guild.id]) {
            data[interaction.guild.id] = {};
        }

        if (!data[interaction.guild.id][user.id]) {
            data[interaction.guild.id][user.id] = [];
        }

        data[interaction.guild.id][user.id].push({
            reason,
            moderator: interaction.user.id,
            timestamp: Date.now()
        });

        saveWarnings(data);

        const count =
            data[interaction.guild.id][user.id].length;

        return interaction.reply({
            content:
                `⚠️ Đã cảnh cáo **${user.tag}**.\n` +
                `📝 Lý do: ${reason}\n` +
                `📊 Tổng cảnh cáo: **${count}**`
        });
    }
};
