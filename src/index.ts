import { CommandsRegistry, registerCommand, handlerLogin, runCommand, handlerCreateFeed, handlerResetUsers, handlerGetUsers, handlerAggregation, handlerRegister, handlerGetFeeds } from "./CommandHandler";

async function main() {
    const commandRegistry: CommandsRegistry = {};
    registerCommand(commandRegistry, "login", handlerLogin);
    registerCommand(commandRegistry, "register", handlerRegister);
    registerCommand(commandRegistry, "reset", handlerResetUsers);
    registerCommand(commandRegistry, "users", handlerGetUsers);
    registerCommand(commandRegistry, "agg", handlerAggregation);
    registerCommand(commandRegistry, "addfeed", handlerCreateFeed);
    registerCommand(commandRegistry, "feeds", handlerGetFeeds);
    const command = process.argv[2];
    if (!command) {
        console.log("Error: not enough arguments were provided");
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