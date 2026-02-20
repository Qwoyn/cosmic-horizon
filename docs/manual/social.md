# Social & Communication

[← Back to Manual](../players-manual.md)

---

## Chat

### Sector Chat

Send messages to all players in your current sector:

```
> chat Anyone want to trade?
[YourName] Anyone want to trade?
```

**Alias:** `say` works the same.

Messages appear in the mini chat in the context panel (right sidebar) and in the full Comms panel.

### Chat Channels

The mini chat supports three channels, switchable via tabs:

| Channel | Visibility | Tab |
|---------|-----------|-----|
| **Sector** | All players in your current sector | Sector |
| **Syndicate** | All members of your syndicate | Synd |
| **Alliance** | All members of your alliance | Ally |

Click the channel tabs in the mini chat to switch. The Comms activity panel shows the full chat interface with more message history.

---

## In-Game Mail

Send private messages to any player.

### Sending Mail

```
> mail send SpaceCowboy Trade Offer | I've got 40 tech at sector 88. Interested in buying at 60 cr/unit?
```

Format: `mail send <player> <subject> | <body>`

### Reading Mail

```
> mail
=== INBOX ===
[1] From: SpaceCowboy — "Trade Offer" (unread)
[2] From: Nova7 — "Alliance proposal" (read)

> mail read 1
From: SpaceCowboy
Subject: Trade Offer
---
I've got 40 tech at sector 88. Interested in buying at 60 cr/unit?
```

### Other Mail Commands

```
> mail sent          View your sent messages
> mail delete 1      Delete message #1
```

### Mail Limits

- **Maximum 50 messages** per player
- **Message body limited** to 1,000 characters
- **Unread count** shown when you have new mail

---

## Notes

Personal notes for tracking anything — trade routes, planet locations, sector intel, to-do lists.

### Creating Notes

```
> note Sector 42 has cheap cyrillium (5 cr), outpost buys food at 40 cr
Note saved! (ID: 1)

> note Seed planet found in sector 1842 — collect colonists here
Note saved! (ID: 2)
```

**Alias:** `n` works for creating notes.

### Viewing Notes

```
> notes
=== YOUR NOTES ===
[1] Sector 42 has cheap cyrillium (5 cr), outpost buys food at 40 cr
[2] Seed planet found in sector 1842 — collect colonists here
```

### Searching Notes

```
> notes search cyrillium
=== SEARCH: "cyrillium" ===
[1] Sector 42 has cheap cyrillium (5 cr), outpost buys food at 40 cr
```

### Deleting Notes

```
> note del 1
Note #1 deleted.
```

### What to Track with Notes

- **Trade routes:** "Sector 42 → 88: cyrillium, 12 cr profit/unit"
- **Seed planet locations:** "Seed world in sector 1842"
- **Dangerous sectors:** "Sector 501: heavy mines, avoid"
- **Player intel:** "SpaceCowboy frequents sectors 40-50, flies Corvette"
- **Unclaimed planets:** "Sector 315: unclaimed Volcanic planet"
- **Warp gate locations:** "Void Reapers gate in sector 127 → 2501, 500 cr toll"

---

## Bounties

Place bounties on players you want hunted. See [Combat](combat.md#bounties) for full details.

```
> bounties
=== ACTIVE BOUNTIES ===
SpaceCowboy: 5,000 cr (placed by: Nova7)
Rogue_Alpha: 12,500 cr (3 bounties stacked)
```

---

## Combat Log

Review recent combat events:

```
> combatlog
=== COMBAT LOG ===
[12:45] You fired 10 at SpaceCowboy → 15 damage
[12:46] SpaceCowboy fired 15 at you → 12 damage
[12:47] SpaceCowboy fled to sector 201
```

**Alias:** `clog`

---

## Leaderboards

See how you stack up against other pilots:

```
> leaderboard
=== LEADERBOARD OVERVIEW ===
Credits: 1. SpaceCowboy (2.5M) 2. Nova7 (1.8M) ...
Planets: 1. Nova7 (12) 2. Rogue_Alpha (8) ...
Combat: 1. Rogue_Alpha (47 kills) ...
Explored: 1. SpaceCowboy (2,100 sectors) ...
Trade: 1. Nova7 (45,000 units) ...
Level: 1. SpaceCowboy (Lv.42) ...
Syndicate: 1. Void Reapers (12 members) ...

> leaderboard credits
=== TOP 20 BY CREDITS ===
1. SpaceCowboy — 2,500,000 cr
2. Nova7 — 1,800,000 cr
...
```

**Aliases:** `lb`, `top`

**Categories:** `credits`, `planets`, `combat`, `explored`, `trade`, `syndicate`, `level`

Rankings refresh every 5 minutes.

---

## NPC Interactions

Non-player characters are scattered across the galaxy, offering quests, items, and information.

### Reputation System

NPCs remember your interactions:

| Reputation | Range | Effect |
|-----------|-------|--------|
| Neutral | -19 to +19 | Standard interactions |
| Friendly | +20 to +49 | Better prices, more quests |
| Trusted | +50 to +100 | Best deals, exclusive content |

- **Each conversation:** +1 reputation
- **Reputation range:** -100 to +100
- **Faction spillover:** Gaining rep with one NPC gives 25% to others in the same faction

### First Encounter

Meeting an NPC for the first time earns **15 XP**.

---

## Communication Strategy

### For Traders

- **Use notes extensively** — track every profitable route, outpost stock level, and seed planet location
- **Mail trade offers** to players you meet — "I have X, looking for Y"
- **Check bounties** before entering dangerous sectors — know who's being hunted

### For Combat Pilots

- **Monitor sector chat** — incoming players often chat before fighting
- **Use bounties strategically** — place bounties on rivals to incentivize others to hunt them
- **Combat log review** — analyze your fights to improve tactics

### For Syndicate Leaders

- **Use syndicate chat** for private coordination — sector chat is visible to everyone
- **Mail important announcements** to members who might miss chat
- **Track enemy movements** in notes — build an intel database

---

## Tips

- **Notes persist forever** — they're your personal wiki. Use them liberally
- **`notes search` is powerful** — search any keyword to find old intel
- **Mail is asynchronous** — recipients see it when they log in, making it great for coordination across time zones
- **Sector chat only reaches players in your current sector** — use mail for cross-galaxy communication
- **NPC reputation builds slowly** — visit NPCs regularly for reputation gains
- **Leaderboards are motivating** — pick a category and grind for the top 20

[← Back to Manual](../players-manual.md)
