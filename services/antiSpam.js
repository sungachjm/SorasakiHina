const rateLimiter = require("./rateLimiter");

const messageHistory = new Map();

function isSpam(message, config) {
    const userId = message.author.id;
    const guildId = message.guild.id;

    const key = `${guildId}:${userId}`;
    const now = Date.now();

    let history = messageHistory.get(key) || [];

    history = history.filter(
        timestamp =>
            now - timestamp < config.spamWindow
    );

    history.push(now);
    messageHistory.set(key, history);

    return history.length >= config.spamLimit;
}

function checkFlood(message, config) {
    const content = message.content.trim();

    if (!content) return false;

    const key =
        `${message.guild.id}:${message.author.id}:content`;

    const now = Date.now();

    let data = messageHistory.get(key);

    if (!data || now - data.time > config.spamWindow) {
        messageHistory.set(key, {
            time: now,
            content,
            count: 1
        });

        return false;
    }

    if (data.content === content) {
        data.count++;

        if (data.count >= 3) {
            return true;
        }
    } else {
        messageHistory.set(key, {
            time: now,
            content,
            count: 1
        });
    }

    return false;
}

function checkMentions(message) {
    return (
        message.mentions.users.size >= 6 ||
        message.mentions.roles.size >= 4
    );
}

function checkMassContent(message) {
    const content = message.content;

    if (content.length > 2000) {
        return true;
    }

    if (/(.)\1{15,}/i.test(content)) {
        return true;
    }

    return false;
}

function cleanup() {
    const now = Date.now();

    for (const [key, data] of messageHistory) {
        if (Array.isArray(data)) {
            if (
                data.length === 0 ||
                now - data[data.length - 1] > 60000
            ) {
                messageHistory.delete(key);
            }
        } else if (
            now - data.time > 60000
        ) {
            messageHistory.delete(key);
        }
    }
}

setInterval(cleanup, 60000).unref();

module.exports = {
    isSpam,
    checkFlood,
    checkMentions,
    checkMassContent
};
