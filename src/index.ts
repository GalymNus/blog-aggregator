import { CommandsRegistry, registerCommand, handleSubscribeToFeed, handlerGetUserFeeds, handlerLogin, runCommand, handlerCreateFeed, handlerResetUsers, handlerGetUsers, handlerAggregation, handlerRegister, handlerGetFeeds } from "./CommandHandler";
import { userAuthMiddleware } from './helpers/userLogin';

async function main() {
    const commandRegistry: CommandsRegistry = {};
    registerCommand(commandRegistry, "login", handlerLogin);
    registerCommand(commandRegistry, "register", handlerRegister);
    registerCommand(commandRegistry, "reset", handlerResetUsers);
    registerCommand(commandRegistry, "agg", handlerAggregation);
    // TODO: handle empty users
    registerCommand(commandRegistry, "users", userAuthMiddleware(handlerGetUsers));
    registerCommand(commandRegistry, "addfeed", userAuthMiddleware(handlerCreateFeed));
    // TODO: handle empty feeds
    registerCommand(commandRegistry, "feeds", handlerGetFeeds);
    registerCommand(commandRegistry, "follow", userAuthMiddleware(handleSubscribeToFeed));
    registerCommand(commandRegistry, "following", userAuthMiddleware(handlerGetUserFeeds));
    const command = process.argv[2];
    if (!command) {
        console.log("Error: not enough arguments were provided");
        // TODO: add help and expand on log above
        process.exit(1);
    } else {
        if (commandRegistry[command]) {
            await runCommand(commandRegistry, command, ...process.argv.slice(3));
        } else {
            console.log("Error: not found command ", command);
            process.exit(1);
        }
    }
    process.exit(0);
}

main();