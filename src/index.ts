import { CommandsRegistry, registerCommand, handlerLogin, runCommand } from "./CommandHandler";

function main() {
    const commandRegistry: CommandsRegistry = {};
    registerCommand(commandRegistry, "login", handlerLogin);
    const command = process.argv[2];
    if (!command) {
        console.log("Error: not enough arguments were provided");
        process.exit(1);
    } else {
        if (commandRegistry[command]) {
            runCommand(commandRegistry, command, ...process.argv.slice(3));
        } else {
            console.log("Error: not found command ", command);
            process.exit(1);
        }
    }
}

main();