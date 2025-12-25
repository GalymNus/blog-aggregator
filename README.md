### Blog Aggregator agg [TypeScript];

## Description

The goal of the project is to build a cli tool that can keep track off RSS feeds and periodically store posts to a local database. The project can handle multiple users and can be run in the background to keep your feeds up to date. This was my first serious foray into working with databases using go, sqlc, and goose. I gained a profound appreciation for automated and reversable migrations.

## Installation Instructions

# Prerequisites

In your home directory create the file `.gator_config.json`. It will only contain one object with a maximum of two keys `dbUrl` and `currentUserName`. You do not need to set `currentUserName` manually. You will need to provide a connection string for connecting to the postgres database. As an example, your config might look like {"db_url":"postgres://user:password@localhost:5432/gator?sslmode=disable"}

## Use

`gator register {username}` - create a new user
`gator login {username}` - login an existing user
`gator addfeed {feed_name} {url}` - add a new feed. You can choose the name. The creator of a feed also follows that feed. You can remove with unfollow without issue.
`gator follow {url}`  - Add a feed to the logged in user's list.
`gator following` - Show a summary of which feeds the logged in user is following.
`gator reset` - Delete all feeds and users. Clean slate and unrecoverable.
`gator unfollow` - Remove a feed from the users followed list.
`gator browse {n (optional)}` - Show the n (default = 2) most recent posts from any feed.
`gator agg {time duration string}` - Long running monitor of all feeds. Checks 1 feed every interval set by the time duration string. Example strings 1m -> 1 minute, 2h 30m -> 2 hours 30 minutes and so forth. Be a good internet citizen and don't DOS the very people you want to set published info from.