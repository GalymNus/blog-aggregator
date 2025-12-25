import { setUser, readConfig } from './config';
import { createUser, getUserByName, resetUsers, getUsers, getUserById } from './lib/db/queries/users';
import { createFeed, getFeeds, getFeedByURL } from './lib/db/queries/feeds';
import { createFeedFollow, getUserFeedFollows } from "./lib/db/queries/feedFollows";
import { fetchFeed } from "./RSSfeed";
import { UserType } from './helpers/userLogin';

export type CommandHandler = (cmd: string, ...args: string[]) => Promise<void>;
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

export async function handlerCreateFeed(cmdName: string, user: UserType, ...args: string[]) {
    if (args.length < 2) {
        console.log("addfeed command requires name and url as parameters!");
        process.exit(1);
    } else {
        const [name, url] = args;
        const feed = await createFeed(name, url, user.id);
        await createFeedFollow(user.id, feed.id);
        console.log(`${user.name} has created new feed ${name} and follows it.`);
    }
}

export async function handlerGetFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds();
    console.log("=> List of feeds:")
    for (let feedIndex in feeds) {
        const { name, url, userId } = feeds[feedIndex];
        const user = await getUserById(userId);
        console.log(`${parseInt(feedIndex) + 1}| ${name} from ${url} by ${user.name}`);
    }
}

export async function handleSubscribeToFeed(cmdName: string, user: UserType, ...args: string[]) {
    if (args.length < 1) {
        console.log("follow command requires feed name as parameter!");
        process.exit(1);
    } else {
        const feedURL = args[0];
        try {
            const feed = await getFeedByURL(feedURL);
            await createFeedFollow(user.id, feed.id);
            console.log(`${user.name} now follows ${feed.name}`);
        } catch (e) {
            console.log("Error: ", e);
        }
    }
}

export async function handlerGetUserFeeds(cmdName: string, user: UserType, ...args: string[]) {
    try {
        const userFeeds = await getUserFeedFollows(user.id);
        console.log(`${user.name} follows:`);
        for (const feedIndex in userFeeds) {
            const { users, feeds } = userFeeds[feedIndex];
            console.log(`   ${parseInt(feedIndex) + 1}: ${feeds.name} by [${users.name}]`)
        }
    } catch (e) {
        console.log("Error: ", e);
    }
}


export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
};

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    await registry[cmdName](cmdName, ...args);
}