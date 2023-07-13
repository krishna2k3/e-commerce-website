import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import "isomorphic-fetch";

dotenv.config();

const redis = new Redis({
  url: process.env.REDIS_URL,
  token:
    process.env.REDIS_TOKEN,
});

const data = await redis.set("foo", "bar");
console.log(data);

export default redis;
