const buckets = new Map();

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl.split('?')[0]}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(max - bucket.count, 0)));

    if (bucket.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    next();
  };
};

export default rateLimit;
