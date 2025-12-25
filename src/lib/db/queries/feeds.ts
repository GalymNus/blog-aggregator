import { eq, or, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, FeedType } from "../schema";


export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeedByURL(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function markFeedFetched(id: string) {
    const now = new Date();
    await db.update(feeds).set({ lastFetchedAt: now, updatedAt: now }).where(eq(feeds.id, id));
}

export async function getNextFeedToFetch(): Promise<FeedType | undefined> {
    const [result] = await db.execute(sql`select * from "feeds" order by last_fetched_at NULLS FIRST`);
    return result as FeedType | undefined;
}


