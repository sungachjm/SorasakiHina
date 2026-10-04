const configStore = require("./configStore");
const securityLog = require("./logger");

const joins = new Map();

function registerJoin(guildId, userId) {
    const config = configStore.get(guildId);
    const now = Date.now();

    let data = joins.get(guildId);

    if (
        !data ||
        now - data.startedAt > config.raidWindow
    ) {
        data = {
            startedAt: now,
            users: []
        };

        joins.set(guildId, data);
    }

    data.users.push({
        id: userId,
        timestamp: now
    });

    return data.users.length;
}

function isRaid(guildId) {
    const config = configStore.get(guildId);
    const data = joins.get(guildId);

    if (!data) return false;

    return data.users.length >= config.raidLimit;
}

async function handleRaid(guild, count) {
    const config = configStore.get(guild.id);

    if (!config.antiRaid) {
        return;
    }

    if (config.lockdown) {
        return;
    }

    configStore.update(guild.id, {
        lockdown: true
    });

    await securityLog(guild, {
        title: "🚨 ANTI-RAID ACTIVATED",
        description:
            `Phát hiện **${count} thành viên** tham gia trong thời gian ngắn.`,
        color: 0xff0000,
        fields: [
            {
                name: "⚠️ Trạng thái",
                value: "Lockdown đã được kích hoạt."
            },
            {
                name: "🛡️ Protector",
                value: "Anti-Raid"
            }
        ]
    });
}

function cleanup() {
    const now = Date.now();

    for (const [guildId, data] of joins) {
        if (
            now - data.startedAt > 60000
        ) {
            joins.delete(guildId);
        }
    }
}

setInterval(cleanup, 60000).unref();

module.exports = {
    registerJoin,
    isRaid,
    handleRaid
};
