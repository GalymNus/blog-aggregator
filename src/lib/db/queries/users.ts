import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

type UserType = {
    name: string
}

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUsers(): Promise<UserType[]> {
    const result = await db.select({ name: users.name }).from(users);
    return result;
}


export async function getUserByName(name: string) {
    const [result] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.name, name));
    return result;
}


export async function getUserById(id: string) {
    const [result] = await db.select({ name: users.name }).from(users).where(eq(users.id, id));
    return result;
}

export async function resetUsers(): Promise<boolean> {
    try {
        await db.delete(users);
        return true;
    } catch (e) {
        console.log("Error: ", e);
        return false;
    }
}