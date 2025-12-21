import fs from "fs";
import os from "os";
import path from "path";

type ConfigType = {
    currentUserName: string;
    dbUrl: string
}


function getFilePath() {
    return path.join(os.homedir(), ".gatorconfig.json");
}

export function readConfig(): ConfigType {
    const file = fs.readFileSync(getFilePath());
    return JSON.parse(file.toLocaleString());
}

export function writeConfig(data: ConfigType) {
    fs.writeFileSync(getFilePath(), JSON.stringify(data));
};

export function setUser(userName: string): void {
    const config = readConfig();
    config.currentUserName = userName;
    writeConfig(config);
}