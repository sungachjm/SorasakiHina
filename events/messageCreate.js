const configStore =
    require("../services/configStore");

const securityLog =
    require("../services/logger");

const antiSpam =
    require("../services/antiSpam");

const security =
    require("../services/security");

const warnedUsers = new Map();

async function safeDelete(message) {
    try {
        if (message.deletable) {
            await message.delete();
            return true;
        }
    } catch (error) {
        console.error(
            "Message delete error:",
            error.message
        );
    }

    return false;
}

async function timeoutUser(
    member,
    duration = 60000
) {
    try {
        if (
            member &&
            member.moderatable
        ) {
            await member.timeout(
                duration,
                "Protector Security System"
            );

            return true;
        }
    } catch (error) {
        console.error(
            "Timeout error:",
            error.message
        );
    }

    return false;
}

module.exports = async function(message) {

    if (!message.guild) {
        return;
    }

    if (message.author.bot) {
        return;
    }

    const config =
        configStore.get(
            message.guild.id
        );

    /*
     * WHITELIST
     */

    if (
        config.whitelistUsers.includes(
            message.author.id
        )
    ) {
        return;
    }

    if (
        message.member &&
        message.member.roles.cache.some(
            role =>
                config.whitelistRoles.includes(
                    role.id
                )
        )
    ) {
        return;
    }

    /*
     * ANTI-SPAM
     */

    if (config.antiSpam) {

        const spam =
            antiSpam.isSpam(
                message,
                config
            );

        const flood =
            antiSpam.checkFlood(
                message,
                config
            );

        const mentions =
            antiSpam.checkMentions(
                message
            );

        const massContent =
            antiSpam.checkMassContent(
                message
            );

        if (
            spam ||
            flood ||
            mentions ||
            massContent
        ) {

            await safeDelete(message);

            const now = Date.now();

            const lastWarn =
                warnedUsers.get(
                    message.author.id
                ) || 0;

            if (
                now - lastWarn > 10000
            ) {

                warnedUsers.set(
                    message.author.id,
                    now
                );

                const timedOut =
                    await timeoutUser(
                        message.member,
                        60000
                    );

                await securityLog(
                    message.guild,
                    {
                        title:
                            "🚨 Anti-Spam Triggered",

                        description:
                            `Đã phát hiện spam từ <@${message.author.id}>.`,

                        color:
                            0xffa500,

                        fields: [
                            {
                                name: "👤 User",
                                value:
                                    `${message.author.tag} (${message.author.id})`
                            },
                            {
                                name: "🔒 Action",
                                value:
                                    timedOut
                                        ? "Xóa tin nhắn + Timeout 60 giây"
                                        : "Xóa tin nhắn"
                            }
                        ]
                    }
                );
            }

            return;
        }
    }

    /*
     * ANTI-LINK / ANTI-PHISHING
     */

    const analysis =
        security.analyzeMessage(
            message
        );

    if (
        config.antiLink &&
        analysis.hasInvite
    ) {

        await safeDelete(message);

        await securityLog(
            message.guild,
            {
                title:
                    "🔗 Discord Invite Blocked",

                description:
                    `Đã chặn Discord invite từ <@${message.author.id}>.`,

                color:
                    0xff9900,

                fields: [
                    {
                        name: "👤 User",
                        value:
                            `${message.author.tag}`
                    },
                    {
                        name: "📍 Channel",
                        value:
                            `${message.channel}`
                    }
                ]
            }
        );

        return;
    }

    if (
        config.antiPhishing &&
        (
            analysis.phishing ||
            analysis.suspiciousUrls.length > 0
        )
    ) {

        await safeDelete(message);

        const timedOut =
            await timeoutUser(
                message.member,
                5 * 60 * 1000
            );

        await securityLog(
            message.guild,
            {
                title:
                    "🎣 Phishing Link Blocked",

                description:
                    `Đã phát hiện nội dung/link đáng ngờ từ <@${message.author.id}>.`,

                color:
                    0xff0000,

                fields: [
                    {
                        name: "👤 User",
                        value:
                            `${message.author.tag}`
                    },
                    {
                        name: "🔗 URLs",
                        value:
                            analysis.urls.length
                                ? analysis.urls
                                    .slice(0, 3)
                                    .join("\n")
                                : "Không có URL"
                    },
                    {
                        name: "🔒 Action",
                        value:
                            timedOut
                                ? "Xóa + Timeout 5 phút"
                                : "Xóa tin nhắn"
                    }
                ]
            }
        );

        return;
    }
};
