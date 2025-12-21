import { readConfig } from './config';

function main() {
    const config = readConfig();
    console.log("config", config);
}

main();