import { eq, or, sql } from "drizzle-orm";
import { db } from "..";
import { posts, FeedType } from "../schema";
import { ItemType } from "src/RSSfeed";

export type PostType = typeof posts.$inferSelect;

export async function createPost(feedId: string, post: ItemType) {
    const { title, link, pubDate, description } = post;
    console.log("createPost ", feedId, post);
    const [result] = await db.insert(posts).values({ feedId, title, publishedAt: new Date(pubDate), url: link, description }).returning();
    return result;
}
