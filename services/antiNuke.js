const {
    AuditLogEvent,
    PermissionFlagsBits
} = require("discord.js");

const configStore =
    require("./configStore");

const securityLog =
    require("./logger");

const actions = new Map();

async function getExecutor(
    guild,
    type,
    targetId
) {
    try {
        const logs =
            await guild.fetchAuditLogs({
                type,
                limit: 5
            });

        const entry =
            logs.entries.find(
                item =>
                    item.target?.id === targetId &&
                    Date.now() -
                        item.createdTimestamp <
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

function registerAction(
    guildId,
    userId,
    action
) {
    const key =
        `${guildId}:${userId}:${action}`;

    const now = Date.now();

    let data =
        actions.get(key);

    if (
        !data ||
        now - data.startedAt > 10000
    ) {
        data = {
            startedAt: now,
            count: 0
        };
    }

    data.count++;

    actions.set(
        key,
        data
    );

    return data.count;
}

function isWhitelisted(
    guildId,
    userId
) {
    const config =
        configStore.get(
            guildId
        );

    return config.whitelistUsers.includes(
        userId
    );
}

async function punishExecutor(
    guild,
    executor,
    reason
) {
    if (!executor) {
        return false;
    }

    if (
        executor.id === guild.client.user.id
    ) {
        return false;
    }

    if (
        isWhitelisted(
            guild.id,
            executor.id
        )
    ) {
        return false;
    }

    const member =
        guild.members.cache.get(
            executor.id
        );

    if (!member) {
        return false;
    }

    let punished = false;

    try {
        if (
            member.moderatable &&
            member.permissions.has(
                PermissionFlagsBits.ManageGuild
            )
        ) {
            await member.timeout(
                10 * 60 * 1000,
                reason
            );

            punished = true;
        }
    } catch (error) {
        console.error(
            "Anti-Nuke punishment error:",
            error.message
        );
    }

    return punished;
}

async function detect(
    guild,
    {
        type,
        targetId,
        action,
        limit = 3,
        description
    }
) {
    const config =
        configStore.get(
            guild.id
        );

    if (!config.antiNuke) {
        return;
    }

    const entry =
        await getExecutor(
            guild,
            type,
            targetId
        );

    if (!entry) {
        return;
    }

    const executor =
        entry.executor;

    if (!executor) {
        return;
    }

    if (
        isWhitelisted(
            guild.id,
            executor.id
        )
    ) {
        return;
    }

    const count =
        registerAction(
            guild.id,
            executor.id,
            action
        );

    await securityLog(
        guild,
        {
            title:
                "⚠️ Anti-Nuke Activity",

            description,

            color:
                count >= limit
                    ? 0xff0000
                    : 0xffa500,

            fields: [
                {
                    name: "👤 Executor",
                    value:
                        `${executor.tag} (${executor.id})`
                },
                {
                    name: "⚙️ Action",
                    value: action
                },
                {
                    name: "📊 Count",
                    value:
                        `${count}/${limit}`
                }
            ]
        }
    );

    if (count >= limit) {

        const punished =
            await punishExecutor(
                guild,
                executor,
                `Anti-Nuke: ${action}`
            );

        await securityLog(
            guild,
            {
                title:
                    "🚨 ANTI-NUKE TRIGGERED",

                description:
                    `Đã phát hiện hành động hàng loạt từ <@${executor.id}>.`,

                color:
                    0xff0000,

                fields: [
                    {
                        name: "⚙️ Action",
                        value: action
                    },
                    {
                        name: "📊 Detected",
                        value:
                            `${count} lần`
                    },
                    {
                        name: "🔒 Punishment",
                        value:
                            punished
                                ? "Timeout 10 phút"
                                : "Không thể timeout"
                    }
                ]
            }
        );
    }
}

function cleanup() {
    const now = Date.now();

    for (
        const [key, data]
        of actions
    ) {
        if (
            now - data.startedAt >
            60000
        ) {
            actions.delete(key);
        }
    }
}

setInterval(
    cleanup,
    60000
).unref();

module.exports = {
    detect
};
