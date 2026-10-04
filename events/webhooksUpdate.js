const {
    AuditLogEvent
} = require("discord.js");

const configStore =
    require("../services/configStore");

const securityLog =
    require("../services/logger");

async function getRecentWebhookCreator(
    guild,
    webhookId
) {
    try {
        const logs =
            await guild.fetchAuditLogs({
                type:
                    AuditLogEvent.WebhookCreate,
                limit: 5
            });

        return logs.entries.find(
            entry =>
                entry.target?.id === webhookId &&
                Date.now() -
                    entry.createdTimestamp <
                    15000
        );
    } catch {
        return null;
    }
}

module.exports = async function(channel) {

    if (!channel.guild) {
        return;
    }

    const config =
        configStore.get(
            channel.guild.id
        );

    if (!config.antiWebhook) {
        return;
    }

    try {
        const webhooks =
            await channel.fetchWebhooks();

        for (const webhook of webhooks.values()) {

            const entry =
                await getRecentWebhookCreator(
                    channel.guild,
                    webhook.id
                );

            if (!entry) {
                continue;
            }

            const executor =
                entry.executor;

            if (!executor) {
                continue;
            }

            if (
                config.whitelistUsers.includes(
                    executor.id
                )
            ) {
                continue;
            }

            /*
             * Không tự xóa webhook của bot.
             */

            if (
                executor.id ===
                channel.client.user.id
            ) {
                continue;
            }

            try {
                await webhook.delete(
                    "Protector Anti-Webhook"
                );
            } catch (error) {
                console.error(
                    "Webhook delete error:",
                    error.message
                );
            }

            await securityLog(
                channel.guild,
                {
                    title:
                        "🔧 UNAUTHORIZED WEBHOOK",

                    description:
                        `Đã phát hiện webhook không được whitelist.`,

                    color:
                        0xff0000,

                    fields: [
                        {
                            name: "👤 Creator",
                            value:
                                `${executor.tag} (${executor.id})`
                        },
                        {
                            name: "📍 Channel",
                            value:
                                `${channel}`
                        },
                        {
                            name: "🔒 Action",
                            value:
                                "Webhook đã bị xóa"
                        }
                    ]
                }
            );
        }

    } catch (error) {
        console.error(
            "Anti-Webhook error:",
            error.message
        );
    }
};
