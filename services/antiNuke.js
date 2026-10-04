const {
    AuditLogEvent,
    PermissionFlagsBits
} = require("discord.js");

const configStore =
    require("./configStore");

const securityLog =
    require("./logger");

const actions = new Map();

const LIMIT = 3;
const WINDOW = 10000;

function getKey(guildId, userId) {
    return `${guildId}:${userId}`;
}

function registerAction(
    guildId,
    userId
) {
    const key =
        getKey(guildId, userId);

    const now = Date.now();

    let data =
        actions.get(key);

    if (
        !data ||
        now - data.startedAt > WINDOW
    ) {
        data = {
            startedAt: now,
            count: 0
        };
    }

    data.count++;

    actions.set(key, data);

    return data.count;
}

async function getExecutor(
    guild,
    type
) {
    try {
        const logs =
            await guild.fetchAuditLogs({
                type,
                limit: 5
            });

        const entry =
            logs.entries.find(
                entry =>
                    Date.now() -
                        entry.createdTimestamp <
                    10000
            );

        return entry || null;
    } catch (error) {
        console.error(
            "Audit log error:",
            error.message
        );

        return null;
    }
}

async function punishExecutor(
    guild,
    userId,
    reason
) {
    try {
        const member =
            await guild.members
                .fetch(userId)
                .catch(() => null);

        if (!member) {
            return false;
        }

        if (
            member.id === guild.ownerId
        ) {
            return false;
        }

        if (
            member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            try {
                await member.timeout(
                    10 * 60 * 1000,
                    reason
                );

                return true;
            } catch {
                return false;
            }
        }

        if (member.moderatable) {
            await member.timeout(
                10 * 60 * 1000,
                reason
            );

            return true;
        }

        return false;
    } catch (error) {
        console.error(
            "Anti-Nuke punishment error:",
            error.message
        );

        return false;
    }
}

async function handleAction(
    guild,
    auditType,
    actionName
) {
    const config =
        configStore.get(guild.id);

    if (!config.antiNuke) {
        return;
    }

    const entry =
        await getExecutor(
            guild,
            auditType
        );

    if (!entry || !entry.executor) {
        return;
    }

    const executor =
        entry.executor;

    // Không xử lý chính bot
    if (
        executor.id === guild.client.user.id
    ) {
        return;
    }

    // Không xử lý server owner
    if (
        executor.id === guild.ownerId
    ) {
        return;
    }

    const count =
        registerAction(
            guild.id,
            executor.id
        );

    await securityLog(guild, {
        title: "⚠️ Anti-Nuke Detection",
        description:
            `Phát hiện hành động **${actionName}**.`,
        color: 0xff9900,
        fields: [
            {
                name: "👤 Executor",
                value:
                    `<@${executor.id}>`,
                inline: true
            },
            {
                name: "📊 Actions",
                value:
                    `${count}/${LIMIT}`,
                inline: true
            }
        ]
    });

    if (count < LIMIT) {
        return;
    }

    const punished =
        await punishExecutor(
            guild,
            executor.id,
            `Anti-Nuke: ${actionName}`
        );

    await securityLog(guild, {
        title: "🚨 ANTI-NUKE TRIGGERED",
        description:
            `Đã phát hiện hành vi phá server hàng loạt.`,
        color: 0xff0000,
        fields: [
            {
                name: "👤 Người thực hiện",
                value:
                    `<@${executor.id}>`,
                inline: true
            },
            {
                name: "💥 Hành động",
                value:
                    actionName,
                inline: true
            },
            {
                name: "🔨 Xử lý",
                value:
                    punished
                        ? "Đã timeout 10 phút"
                        : "Không thể timeout",
                inline: true
            }
        ]
    });

    actions.delete(
        getKey(
            guild.id,
            executor.id
        )
    );
}

module.exports = {
    handleAction
};
