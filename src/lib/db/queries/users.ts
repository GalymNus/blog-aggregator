import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";
import { UserType } from "src/helpers/userLogin";

interface UserFullType extends UserType {
    created_at: Date;
    updated_at: Date;
}

export async function createUser(name: string): Promise<UserFullType> {
    const [result]: any = await db.insert(users).values({ name: name }).returning();
    result.userId = result.id;
    delete result.id;
    return result;
}

export async function getUsers(): Promise<UserType[]> {
    const result = await db.select({ id: users.id, name: users.name }).from(users);
    return result;
}


export async function getUserByName(name: string): Promise<UserType> {
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