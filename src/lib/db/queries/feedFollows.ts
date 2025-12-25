import { and, eq } from "drizzle-orm";
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


export async function deleteFeedFollow(userId: string, feedId: string) {
    await db.delete(feedFollows).where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
}