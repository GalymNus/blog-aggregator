import { eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";


export async function createFeedFollow(userId: string, feedId: string) {
    await db.insert(feedFollows).values({ userId, feedId }).returning();
}

export async function getUserFeedFollows(userId: string) {
    const result = await db.select().from(feedFollows).where(eq(feedFollows.userId, userId))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feeds.userId, users.id));
    return result;
}

