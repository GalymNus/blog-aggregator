import { readConfig } from "src/config";
import { CommandHandler } from '../CommandHandler';
import { getUserByName } from "src/lib/db/queries/users";


export type UserCommandHandlerType = (
    cmdName: string,
    user: UserType,
    ...args: string[]
) => Promise<void>;


export type UserType = {
    id: string,
    name: string,
}

export function userAuthMiddleware(handler: UserCommandHandlerType): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const { currentUserName } = readConfig();
        if (!currentUserName) {
            throw new Error("User not logged in");
        }
        const user = await getUserByName(currentUserName);
        if (!user) {
            throw new Error(`User ${currentUserName} not found`);
        }
        return await handler(cmdName, user, ...args);
    };
}
