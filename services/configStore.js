const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "guild-config.json");

const DEFAULT_CONFIG = {
    antiSpam: true,
    antiRaid: true,
    antiNuke: true,
    antiLink: true,
    antiPhishing: true,
    antiWebhook: true,
    antiBot: true,

    verification: false,
    quarantine: true,

    lockdown: false,

    language: "vi",

    logChannelId: null,
    quarantineRoleId: null,
    verificationRoleId: null,

    whitelistUsers: [],
    whitelistRoles: [],

    spamLimit: 6,
    spamWindow: 7000,

    raidLimit: 8,
    raidWindow: 15000
};

function ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(
            FILE,
            JSON.stringify({}, null, 2)
        );
    }
}

function read() {
    ensureFile();

    try {
        return JSON.parse(
            fs.readFileSync(FILE, "utf8")
        );
    } catch {
        return {};
    }
}

function write(data) {
    ensureFile();

    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    );
}

function get(guildId) {
    const data = read();

    return {
        ...DEFAULT_CONFIG,
        ...(data[guildId] || {})
    };
}

function update(guildId, changes) {
    const data = read();

    data[guildId] = {
        ...DEFAULT_CONFIG,
        ...(data[guildId] || {}),
        ...changes
    };

    write(data);

    return data[guildId];
}

function reset(guildId) {
    const data = read();

    data[guildId] = {
        ...DEFAULT_CONFIG
    };

    write(data);

    return data[guildId];
}

module.exports = {
    get,
    update,
    reset,
    DEFAULT_CONFIG
};
