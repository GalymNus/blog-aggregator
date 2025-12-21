import { setUser } from './config';

type CommandHandler = (cmd: string, ...args: string[]) => void;
export type CommandsRegistry = Record<string, CommandHandler>


export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("login command requires username as parameter!");
    } else {
        const username = args[0];
        setUser(username);
        console.log(`User has been set to ${username}`)
    }
}


export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
};

// export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
//     registry[cmdName](args);
// }