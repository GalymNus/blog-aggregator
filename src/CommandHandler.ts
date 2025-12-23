import { setUser, readConfig } from './config';
import { createUser, getUserByName, resetUsers, getUsers, getUserById } from './lib/db/queries/users';
import { createFeed, getFeeds } from './lib/db/queries/feeds';
import { fetchFeed } from "./RSSfeed";

type CommandHandler = (cmd: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        console.log("login command requires username as parameter!");
        process.exit(1);
    } else {
        const username = args[0];
        const is_registered = await getUserByName(username);
        if (is_registered) {
            setUser(username);
            console.log(`User has been set to ${username}`)
        } else {
            console.log(`User: ${username} not found!`);
            process.exit(1);
        }
    }
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        console.log("Register command requires name as parameter!");
        process.exit(1);
    } else {
        const name = args[0];
        await createUser(name);
        setUser(name);
        console.log(`User ${name} has been registered.`)
    }
}


export async function handlerResetUsers(cmdName: string, ...args: string[]) {
    const is_success = await resetUsers()
    if (is_success) {
        setUser("");
        console.log(`Users table was reset.`)
        process.exit(0);
    } else {
        console.log(`Users table was not reset.`)
        process.exit(1);
    }
}

export async function handlerGetUsers(cmdName: string) {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    for (const user in users) {
        const username = users[user].name;
        let add = "";
        if (username == currentUser) {
            add = " (current)";
        }
        console.log(`* ${username}${add}`);
    }
}

export async function handlerAggregation(cmdName: string, ...args: string[]) {
    const text = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(text);
}

export async function handlerCreateFeed(cmdName: string, ...args: string[]) {
    if (args.length < 2) {
        console.log("addfeed command requires name and url as parameters!");
        process.exit(1);
    } else {
        const currentUserName = readConfig().currentUserName;
        const user = await getUserByName(currentUserName);
        const text = await createFeed(args[0], args[1], user.id);
    }
}

export async function handlerGetFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds();
    for (let feed in feeds) {
        const { name, url, userId } = feeds[feed];
        const user = await getUserById(userId);
        console.log(`${feed + 1}| ${name} from ${url} by ${user.name}`);
    }
}



export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
};

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    await registry[cmdName](cmdName, ...args);
}