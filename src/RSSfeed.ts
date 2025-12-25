import { XMLParser } from "fast-xml-parser";

export type ItemType = {
    title: string,
    link: string,
    description: string,
    pubDate: Date,
}

type RssResultType = {
    title: string,
    link: string,
    description: string,
    items: ItemType[];
}

export async function fetchFeed(feedURL: string) {
    const response = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-agent": "gator"
        }
    })
    const parser = new XMLParser();
    const parsedText = parser.parse(await response.text());
    console.log("parsed", parsedText);
    if (parsedText.rss) {
        const { title, link, description } = parsedText.rss.channel;
        console.log("s", title, link, description);
        let item = parsedText.rss.channel.item;
        const data: RssResultType = { title, link, description, items: [] };
        if (item ?? Array.isArray(item)) {
            for (const i in item) {
                const { title, link, description, pubDate } = item[i];
                if (!title || !link || !description || !pubDate) {
                    continue;
                } else {
                    data.items.push({
                        title, link, description, pubDate
                    });
                }
            }
        }
        return data;
    }
}
