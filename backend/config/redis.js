import { Redis } from "@upstash/redis";
import "isomorphic-fetch";

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

const data = await redis.set("foo", "bar");
console.log(data);

export default redis;
