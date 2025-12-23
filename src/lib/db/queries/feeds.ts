import { db } from "..";
import { feeds } from "../schema";


export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
    console.log(`Created feed ${name}:${url}`);
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

