import { setUser, readConfig } from './config';
import { createUser, getUserByName, resetUsers, getUsers, getUserById } from './lib/db/queries/users';
import { createFeed, getFeeds, getFeedByURL, getNextFeedToFetch, markFeedFetched } from './lib/db/queries/feeds';
import { createFeedFollow, getUserFeedFollows, deleteFeedFollow, getPostsFromUserFeed } from "./lib/db/queries/feedFollows";
import { fetchFeed } from "./RSSfeed";
import { UserType } from './helpers/userLogin';
import { parseDuration } from './helpers/stringHelpers';
import { FeedType } from './lib/db/schema';
import { createPost } from './lib/db/queries/posts';

export type CommandHandler = (...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>


export async function handlerLogin(...args: string[]) {
    if (args.length < 1) {
        console.log("login command requires username as parameter!");
        process.exit(1);
    }
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

export async function handlerRegister(...args: string[]) {
    if (args.length < 1) {
        console.log("Register command requires name as parameter!");
        process.exit(1);
    }
    const name = args[0];
    await createUser(name);
    setUser(name);
    console.log(`User ${name} has been registered.`)
}


export async function handlerResetUsers(...args: string[]) {
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

export async function handlerGetUsers() {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    if (users.length < 1) {
        console.log("No users found!");
    } else {
        for (const user in users) {
            const username = users[user].name;
            let add = "";
            if (username == currentUser) {
                add = " (current)";
            }
            console.log(`* ${username}${add}`);
        }
    }
}

async function scrapeFeeds() {
    const next: FeedType | undefined = await getNextFeedToFetch();
    if (!next) {
        console.log("No feeds to fetch");
        return;
    }
    await markFeedFetched(next.id);
    console.log("Fetching ", next.url)
    const data = await fetchFeed(next.url);
    if (data) {
        data.items.map((item) => createPost(next.id, item));
    }
}


export async function handlerAggregation(...args: string[]) {
    if (args.length < 1) {
        console.log("agg command requires interval parameter! eg: 1h, 1m or 1s");
        process.exit(1);
    }
    const timeBetweenRequests = parseDuration(args[0]);
    console.log(`Collecting feeds every ${args[0]}`);

    const interval = setInterval(() => {
        scrapeFeeds().catch((e) => {
            console.log("Error: ", e);
            process.exit(1);
        });
    }, timeBetweenRequests);
    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

export async function handlerCreateFeed(user: UserType, ...args: string[]) {
    if (args.length < 2) {
        console.log("addfeed command requires name and url as parameters!");
        process.exit(1);
    }
    const [name, url] = args;
    const feed = await createFeed(name, url, user.id);
    await createFeedFollow(user.id, feed.id);
    console.log(`${user.name} has created new feed ${name} and follows it.`);
}

export async function handlerGetFeeds(...args: string[]) {
    const feeds = await getFeeds();
    console.log("=> List of feeds:")
    if (feeds.length < 1) {
        console.log("No feeds found!");
    } else {
        for (let feedIndex in feeds) {
            const { name, url, userId } = feeds[feedIndex];
            const user = await getUserById(userId);
            console.log(`${parseInt(feedIndex) + 1}| ${name} from ${url} by ${user.name}`);
        }
    }
}

export async function handleSubscribeToFeed(user: UserType, ...args: string[]) {
    if (args.length < 1) {
        console.log("follow command requires feed name as parameter!");
        process.exit(1);
    }
    const feedURL = args[0];
    try {
        const feed = await getFeedByURL(feedURL);
        await createFeedFollow(user.id, feed.id);
        console.log(`${user.name} now follows ${feed.name}`);
    } catch (e) {
        console.log("Error: ", e);
    }
}

export async function handlerGetUserFeeds(user: UserType, ...args: string[]) {
    try {
        const userFeeds = await getUserFeedFollows(user.id);
        if (userFeeds.length < 1) {
            console.log("You don't follow any feeds!");
        } else {
            console.log(`${user.name} follows:`);
            for (const feedIndex in userFeeds) {
                const { users, feeds } = userFeeds[feedIndex];
                console.log(`   ${parseInt(feedIndex) + 1}: ${feeds.name} by [${users.name}] | url:${feeds.url}`)
            }
        }
    } catch (e) {
        console.log("Error: ", e);
    }
}

export async function handlerUnfollowFeed(user: UserType, ...args: string[]) {
    if (args.length < 1) {
        console.log("unfollow command requires feed url as parameter!");
        process.exit(1);
    }
    try {
        const feed = await getFeedByURL(args[0]);
        await deleteFeedFollow(user.id, feed.id);
        console.log(`You unfollowed ${feed.name}`)
    } catch (e) {
        console.log("Error: ", e);
    }
}

export async function handlerBrowseUserPosts(user: UserType, ...args: string[]) {
    let limit = 2;
    if (args.length > 0 && !isNaN(parseInt(args[0]))) {
        limit = parseInt(args[0])
    }
    try {
        const posts = await getPostsFromUserFeed(user.id, limit);
        posts.map(post => {
            console.log(`${post.feeds?.name}: ${post.posts.title}`);
            console.log(post.posts.description);
            console.log(`Url: ${post.posts.url}`);
            console.log(`Published at: ${post.posts.publishedAt}`);
            console.log("<+>=============================================================<+>");
        })
    } catch (e) {
        console.log("Error: ", e);
    }
}


export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
};

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    await registry[cmdName](...args);
}