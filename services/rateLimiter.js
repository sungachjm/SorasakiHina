const buckets = new Map();

function hit(key, limit, windowMs) {
    const now = Date.now();

    let bucket = buckets.get(key);

    if (
        !bucket ||
        now - bucket.startedAt >= windowMs
    ) {
        bucket = {
            startedAt: now,
            count: 0
        };

        buckets.set(key, bucket);
    }

    bucket.count++;

    return bucket.count <= limit;
}

function count(key) {
    const bucket = buckets.get(key);

    if (!bucket) {
        return 0;
    }

    return bucket.count;
}

function reset(key) {
    buckets.delete(key);
}

function cleanup() {
    const now = Date.now();

    for (const [key, bucket] of buckets) {
        if (now - bucket.startedAt > 60000) {
            buckets.delete(key);
        }
    }
}

setInterval(cleanup, 60000).unref();

module.exports = {
    hit,
    count,
    reset
};
