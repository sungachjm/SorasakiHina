// services/security.js

const URL_REGEX =
    /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/[^\s]+|discord\.com\/invite\/[^\s]+|[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;

const SUSPICIOUS_DOMAINS = [
    "grabify",
    "iplogger",
    "2no.co",
    "yip.su",
    "ps3cfw.com",
    "discord-nitro",
    "discordgift",
    "discord-gifts",
    "free-nitro",
    "nitro-free",
    "steamcomnunity",
    "steamcommunity-gifts",
    "discordapp-gift",
    "discordgift"
];

const ALLOWED_DOMAINS = [
    "discord.com",
    "discordapp.com",
    "discord.gg",
    "media.discordapp.net",
    "cdn.discordapp.com"
];

function extractUrls(content = "") {
    return content.match(URL_REGEX) || [];
}

function normalizeUrl(value) {
    if (!/^https?:\/\//i.test(value)) {
        return `https://${value}`;
    }

    return value;
}

function getHostname(value) {
    try {
        return new URL(
            normalizeUrl(value)
        ).hostname.toLowerCase();
    } catch {
        return "";
    }
}

function isAllowedUrl(value) {
    const hostname =
        getHostname(value);

    if (!hostname) {
        return false;
    }

    return ALLOWED_DOMAINS.some(
        domain =>
            hostname === domain ||
            hostname.endsWith(`.${domain}`)
    );
}

function isSuspiciousUrl(value) {
    const lower =
        value.toLowerCase();

    if (isAllowedUrl(value)) {
        return false;
    }

    const hostname =
        getHostname(value);

    if (
        SUSPICIOUS_DOMAINS.some(
            domain =>
                hostname.includes(domain) ||
                lower.includes(domain)
        )
    ) {
        return true;
    }

    if (
        hostname.includes("discord") &&
        (
            hostname.includes("nitro") ||
            hostname.includes("gift") ||
            hostname.includes("verify")
        )
    ) {
        return true;
    }

    if (
        lower.includes("free-nitro") ||
        lower.includes("discord-nitro") ||
        lower.includes("nitro-gift") ||
        lower.includes("discord-gift") ||
        lower.includes("steam-gift")
    ) {
        return true;
    }

    return false;
}

module.exports = {
    extractUrls,
    isSuspiciousUrl,
    isAllowedUrl
};
