const phishingPatterns = [
    /free[-_ ]?nitro/i,
    /discord[-_ ]?nitro/i,
    /nitro[-_ ]?free/i,
    /steam[-_ ]?gift/i,
    /free[-_ ]?gift/i,
    /claim[-_ ]?reward/i,
    /claim[-_ ]?nitro/i,
    /discord[-_ ]?gift/i,
    /verify[-_ ]?account/i,
    /login[-_ ]?discord/i,
    /discord[-_ ]?login/i
];

const shorteners = [
    "bit.ly",
    "tinyurl.com",
    "cutt.ly",
    "shorturl.at",
    "is.gd",
    "t.co"
];

function extractUrls(text) {
    return text.match(
        /https?:\/\/[^\s<>()]+/gi
    ) || [];
}

function isDiscordInvite(url) {
    return /discord(?:\.gg|\.com\/invite)\//i.test(
        url
    );
}

function isPhishing(text) {
    return phishingPatterns.some(
        pattern => pattern.test(text)
    );
}

function isShortener(url) {
    try {
        const hostname =
            new URL(url).hostname
                .toLowerCase()
                .replace(/^www\./, "");

        return shorteners.includes(hostname);
    } catch {
        return false;
    }
}

function isSuspiciousUrl(url) {
    try {
        const parsed = new URL(url);
        const hostname =
            parsed.hostname.toLowerCase();

        // IP address thay cho domain
        if (
            /^\d{1,3}(\.\d{1,3}){3}$/.test(
                hostname
            )
        ) {
            return true;
        }

        // Domain giả mạo Discord
        if (
            hostname.includes("discord") &&
            !(
                hostname === "discord.com" ||
                hostname === "discord.gg" ||
                hostname === "discordapp.com"
            )
        ) {
            return true;
        }

        if (isShortener(url)) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

function analyzeMessage(message) {
    const text = message.content || "";

    const urls = extractUrls(text);

    return {
        urls,

        hasInvite:
            urls.some(isDiscordInvite),

        phishing:
            isPhishing(text),

        suspiciousUrls:
            urls.filter(isSuspiciousUrl)
    };
}

module.exports = {
    extractUrls,
    isDiscordInvite,
    isPhishing,
    isSuspiciousUrl,
    analyzeMessage
};
