# Trading & Economy

[← Back to Manual](../players-manual.md)

---

## The Three Commodities

The Cosmic Horizon economy runs on three essential resources:

| Commodity | Base Price | Produced By | Used For |
|-----------|-----------|-------------|----------|
| **Cyrillium** | 10 cr | Desert, Volcanic, Gaseous planets | Fuel crystals, ship components, warp gates |
| **Food** | 25 cr | Ocean, Goldilocks planets | Colony sustenance, population growth |
| **Tech** | 50 cr | Frozen, Alpine, Gaseous planets | Advanced equipment, upgrades, warp gates |

Tech is the most valuable per unit, but also the hardest to find in large quantities. Cyrillium is cheap and abundant. Food falls in between.

---

## How Trading Works

### Docking at an Outpost

When you're in a sector with an outpost, dock to see prices:

```
> dock
=== Deep Space Depot ===
Commodity    | Mode | Stock | Price
Cyrillium    | sell | 850   | 5 cr    ← outpost selling to you (cheap!)
Food         | buy  | 45    | 42 cr   ← outpost buying from you (expensive!)
Tech         | sell | 200   | 38 cr
```

- **"sell" mode** — The outpost is selling this commodity TO you. You can `buy` it.
- **"buy" mode** — The outpost is buying this commodity FROM you. You can `sell` it.

### Buying and Selling

```
> buy cyrillium 10
Bought 10 cyrillium for 50 credits. Cargo: 10/15.

> sell food 5
Sold 5 food for 210 credits. Cargo: 5/15.
```

**Cost:** Each trade transaction costs 1 energy.

### The Tar'ri Trade Bonus

Tar'ri pilots receive a **+5% trade bonus** on all transactions. This means:
- You pay 5% less when buying
- You receive 5% more when selling

Over hundreds of trades, this adds up to tens of thousands of extra credits.

---

## Price Dynamics

Prices are not fixed — they fluctuate based on supply and demand at each outpost.

### The Price Formula

```
Dynamic Price = Base Price × (2.0 - (stock / capacity × 1.5))
```

This means:
- **Low stock = high prices** — when an outpost is running low, prices can reach up to **2x the base price**
- **High stock = low prices** — when an outpost is overstocked, prices can drop to **0.5x the base price**

### Price Ranges

| Commodity | Min Price (0.5x) | Base Price | Max Price (2x) |
|-----------|-----------------|------------|----------------|
| Cyrillium | 5 cr | 10 cr | 20 cr |
| Food | 12 cr | 25 cr | 50 cr |
| Tech | 25 cr | 50 cr | 100 cr |

### Example: Finding a Profitable Route

**Outpost A** (Sector 42): Cyrillium stock 850/1000 → Price: ~7 cr (sell mode)
**Outpost B** (Sector 88): Cyrillium stock 50/1000 → Price: ~19 cr (buy mode)

Buy 10 cyrillium at A: 70 credits
Sell 10 cyrillium at B: 190 credits
**Profit: 120 credits per trip** (minus 2 energy for the trades + movement energy)

### Stock Replenishment

Outposts slowly replenish their stock and treasury:
- **Treasury injection:** 500 credits per game tick (60 seconds)
- **Base treasury:** 50,000 credits

This means outposts can eventually run out of money to buy your goods. If an outpost's treasury is low, you'll get less for your sales.

---

## Cargo Management

### Cargo Capacity by Ship

| Ship | Base Cargo | Max Cargo (upgraded) |
|------|-----------|---------------------|
| DodgePod | 0 | 0 |
| Scout | 10 | 20 |
| Shadow Runner | 8 | 15 |
| Corvette | 15 | 30 |
| Cruiser | 20 | 40 |
| Battleship | 10 | 25 |
| Freighter | 40 | 80 |
| Colony Ship | 60 | 100 |

### Cargo Types

Your cargo hold carries four types of goods:
- **Cyrillium** (Cyr)
- **Food** (Fd)
- **Tech** (Tc)
- **Colonists** (Co)

All share the same cargo space. 1 unit of anything = 1 cargo slot.

### Checking Your Cargo

Your cargo is always visible in the context panel's ship card. For a detailed breakdown:

```
> status
...
Cargo: Cyr:10 Fd:5 Tc:0 Co:20 (35/40)
```

### Ejecting Cargo

Sometimes you need to dump cargo — maybe you're being chased and need to lighten your load, or you want to make room for higher-value goods:

```
> eject cyrillium 10
Ejected 10 cyrillium into space. Cargo: 25/40.
```

Ejected cargo is gone forever. There's no recovering it.

---

## Trade Strategies

### The Basic Loop

The simplest profitable strategy:

1. Find two outposts that deal in the same commodity — one selling (high stock), one buying (low stock)
2. Buy at the cheap outpost, fly to the expensive one, sell
3. Repeat

```
Example route:
Sector 42 (sells cyrillium at 6 cr) → Sector 88 (buys cyrillium at 18 cr)
Profit: ~12 cr per unit × 40 cargo = 480 cr per round trip
```

### Maximizing Profits

**1. Use a high-cargo ship.** A Freighter (40 cargo) earns 4x per trip compared to a Scout (10 cargo). A Colony Ship (60 cargo) earns even more but moves slower.

**2. Trade tech when possible.** The spread on tech (25–100 cr) is much wider than cyrillium (5–20 cr). A full Freighter of tech can earn 3,000+ credits per trip.

**3. Watch the stock levels.** As you buy from an outpost, their stock drops and price rises. As you sell to an outpost, their stock rises and price drops. Don't overtrade a single route — rotate between several.

**4. Cargo upgrades are worth it.** A Cargo Expander Mk2 (+25 cargo) costs 7,000 credits but pays for itself in a few trips.

**5. Use notes to track routes.**

```
> note Sector 42: cheap cyrillium (5cr), sector 88: buys cyrillium (18cr)
> note Sector 201: cheap tech (28cr), sector 315: buys tech (95cr)
```

### Multi-Commodity Trading

Advanced traders don't just haul one commodity:

1. **Outpost A** sells cyrillium cheap and buys food expensive
2. **Outpost B** sells food cheap and buys cyrillium expensive

Buy cyrillium at A → sell at B → buy food at B → sell at A → repeat. You profit both ways!

### Planet-to-Outpost Trading

Once you have producing planets, collect their output and sell at nearby outposts:

```
> land MyPlanet
...
Stocks: Cyrillium: 450  Food: 200  Tech: 100

> collect MyPlanet cyrillium 40
Collected 40 cyrillium from MyPlanet. Cargo: 40/40.
```

Then fly to an outpost that buys cyrillium at a good price. This is pure profit since your planet produced the goods for free.

---

## Trading XP

Every trade earns experience:

| Action | XP per Unit |
|--------|-------------|
| Buying | 2 XP |
| Selling | 5 XP |

Selling is worth more than buying, so always complete your trade loop. Selling 40 tech earns you 200 XP — a significant chunk toward your next level.

---

## Tips

- **Check outpost stock before buying** — if stock is already low, the price will be high even in "sell" mode
- **Don't carry cargo through dangerous sectors** — losing a full hold of tech hurts. Use protected sector routes when possible
- **Fuel Cells save time** — if you're on a long trade route, carry a Fuel Cell to refuel without returning to a Star Mall
- **The Tar'ri trade bonus compounds** — over 1,000 trades, that 5% adds up to thousands of credits
- **Outpost treasuries run dry** — if you keep selling to the same outpost, it will eventually have no money to buy. Let it regenerate or find another buyer
- **Tech is king** — if you can find a reliable tech route, you'll outpace cyrillium traders by 5:1

[← Back to Manual](../players-manual.md)
