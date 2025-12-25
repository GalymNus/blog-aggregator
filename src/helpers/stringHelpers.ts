export function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (match) {
        const value = Number(match[1]);
        const unit = match[2];
        switch (unit) {
            case "s":
                return value * 1000;
            case "m":
                return value * 60 * 1000;
            case "h":
                return value * 60 * 60 * 1000;
            case "d":
                return value * 60 * 60 * 24 * 1000;
            default:
                throw new Error("Invalid input");
        }
    }
    throw new Error("Invalid input");
}
