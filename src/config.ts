import fs from "fs";
import os from "os";
import path from "path";

type ConfigType = {
    current_user_name: string;
    db_url: string
}


function getFilePath() {
    return `${os.homedir()}/.gatorconfig.json`;
}

export function readConfig(): ConfigType | void {
    const file = fs.readFileSync(getFilePath());
    return JSON.parse(file.toLocaleString());
}

// function writeConfig(data: ConfigType) {
//     const file = fs.readFileSync(getFilePath());
//     fs.writeFileSync(getFilePath(), file);
// }
