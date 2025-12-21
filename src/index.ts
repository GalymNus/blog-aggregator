import { CommandsRegistry, registerCommand, handlerLogin } from "./CommandHandler";

function main() {
    const commandRegistry: CommandsRegistry = {};
    registerCommand(commandRegistry, "login", handlerLogin);
    console.log(process.env);
}

main();