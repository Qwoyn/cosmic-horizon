# Cosmic Horizon - Manual Testing Guide

Use this guide to walk through all major game systems. Open two browser windows to test multiplayer features.

---

## Setup

- **Player 1**: Register as `testpilot1` in browser window 1
- **Player 2**: Register as `testpilot2` in browser window 2

Both players will spawn at a random star mall sector.

---

## Test 1: Registration & Login

### Steps
1. Go to the registration page
2. Register with username `testpilot1`, any email, password 8+ chars
3. Verify you land on the game screen
4. Check the status bar shows: username, sector, energy 500/500, credits 10,000
5. Log out (refresh and go to login)
6. Log back in with the same credentials

### Expected
- Registration succeeds, player appears at a star mall sector
- Status bar populates correctly
- Login with correct password works
- Login with wrong password is rejected

### Red flags
- Blank status bar after login
- Energy showing 0
- No sector data loading

---

## Test 2: Navigation & Exploration

### Steps
1. Type `look` - note your current sector and adjacent sectors
2. Type `move <adjacent_sector_id>` using one of the listed sectors
3. Type `status` to verify sector changed
4. Type `move <original_sector>` to go back
5. Type `map` to see explored sectors
6. Try `move 99999` (non-adjacent) - should fail

### Expected
- `look` shows sector type, adjacent sectors, outposts, planets, players
- Moving costs 1 energy (499/500 after first move)
- Map shows at least 2 explored sectors
- Moving to non-adjacent sector returns error

### Red flags
- Energy not decreasing on move
- Sector not updating in status bar
- Map panel not reflecting visited sectors

---

## Test 3: Star Mall Services

### Steps (must be at a star mall sector)
1. `mall` - view all available services
2. `dealer` - view ships for sale
3. `store` - browse general store items
4. `cantina` - get a random rumor
5. `intel` - buy sector intelligence (costs 500 cr)
6. `refuel 10` - buy 10 energy (costs 100 cr)
7. `garage` - should be empty initially

### Expected
- Mall overview lists all services as OPEN
- Dealer shows 7 ship types with prices
- Store shows ~15 items across categories
- Cantina returns a flavor text rumor
- Intel returns rich outposts, top planets, dangerous sectors
- Refuel increases energy and deducts credits
- Garage shows no stored ships

### Red flags
- "Not at a star mall" error when you are at one
- Dealer showing dodge pods
- Credits not deducting after purchases

---

## Test 4: Ship Purchase & Management

### Steps
1. `dealer` - note corvette price (30,000 cr)
2. You only have 10,000 cr so `buyship corvette` should fail
3. `buyship scout` - buy another scout (5,000 cr)
4. `status` - verify new ship and 5,000 credits remaining
5. If at star mall: `storeship` - store current ship in garage
6. `garage` - verify ship is listed
7. `retrieve <ship_id>` - get it back

### Expected
- Cannot buy ship you can't afford
- Buying a ship switches you to it automatically
- Credits deducted correctly
- Garage store/retrieve cycle works

### Red flags
- Ship purchase succeeding with insufficient credits
- Status not reflecting new ship stats
- Garage retrieve failing

---

## Test 5: Trading

### Steps
1. Navigate to a sector with an outpost (your starting star mall sector likely has one, or `look` to find one)
2. `dock` - view outpost prices and stock levels
3. Note which commodities have mode "sell" (you can buy these)
4. `buy cyrillium 5` (or whichever is in sell mode)
5. `status` - verify cargo updated
6. Navigate to another outpost that buys that commodity
7. `sell cyrillium 5`
8. `status` - verify cargo empty and credits increased

### Expected
- Dock shows commodity prices, stock, capacity, and mode
- Buying adds to cargo and deducts credits
- Selling removes from cargo and adds credits
- Cannot buy commodities the outpost doesn't sell (mode = "buy")
- Cannot buy more than cargo space allows

### Red flags
- Buying a commodity the outpost has in "buy" mode
- Cargo not updating in status
- Credits math incorrect

---

## Test 6: Planet Claiming & Colonization

### Steps
1. Navigate around until you find a sector with planets (`look` in each sector)
2. Find an unclaimed planet: `land <planet_name>`
3. `claim <planet_name>`
4. `land <planet_name>` again - verify you're the owner
5. Navigate to find a seed planet (class S) - these are in sectors marked has_seed_planet
6. `collect <seed_planet_name> 5` - pick up 5 colonists
7. `status` - verify colonist cargo
8. Navigate back to your planet
9. `colonize <planet_name> 5` - deposit colonists
10. `land <planet_name>` - verify colonist count

### Expected
- Claiming sets you as owner
- Collecting from seed planets adds to colonist cargo
- Colonizing transfers from cargo to planet
- Planet shows production rates based on class
- Cannot claim an already-claimed planet

### Red flags
- Claim succeeding on owned planet
- Colonist cargo not updating
- Production showing 0 for a planet with colonists

---

## Test 7: Combat (Two Players)

### Steps
1. **Player 1**: Navigate to a standard (non-protected) sector
2. **Player 2**: Navigate to the same sector
3. Both type `look` - should see each other listed
4. **Player 1**: `fire testpilot2 5` - fire 5 weapon energy at player 2
5. **Player 2**: Check for combat notification in terminal
6. **Player 2**: `status` - verify damage taken (weapon or engine energy reduced)
7. **Player 2**: `flee` - attempt to escape
8. If flee succeeded, player 2 is now in a random adjacent sector

### Expected
- Both players visible in sector via `look`
- Fire deals damage (shown in response)
- Costs 2 energy to fire
- Defender receives notification of attack
- Flee has a success chance (shown in response)
- Successful flee moves to random adjacent sector

### Red flags
- Fire working in protected sectors
- No damage being dealt
- Flee always succeeding or always failing
- Energy not deducting for combat

---

## Test 8: Combat - Ship Destruction

### Steps
1. Get both players in the same standard sector
2. **Player 1**: Repeatedly fire at Player 2 with high energy: `fire testpilot2 25`
3. Continue until Player 2's ship is destroyed
4. **Player 2**: Should see "ship destroyed" message, now in a dodge pod
5. **Player 2**: `status` - verify dodge pod (0 weapons, 0 cargo, 20 engine)

### Expected
- Ship destruction triggers dodge pod creation
- Destroyed player gets notification
- Combat log created (check with `combatlog`)
- If there were bounties on Player 2, Player 1 receives the reward

### Red flags
- Ship never getting destroyed
- No dodge pod after destruction
- Player unable to move after destruction

---

## Test 9: Protected Sector Safety

### Steps
1. Both players navigate to a protected sector (type shown in `look`)
2. **Player 1**: `fire testpilot2 5`
3. Should receive "Combat not allowed" error

### Expected
- Fire command rejected in protected/harmony sectors
- No damage dealt, no energy spent

---

## Test 10: Deployables

### Steps
1. Navigate to a standard sector
2. `purchase mine_halberd` (must be at star mall first to buy)
3. `deploy mine_halberd`
4. Verify deployment confirmation
5. Navigate away and back
6. `look` or check sector for deployable presence

### Expected
- Purchase deducts credits
- Deploy costs 1 energy
- Cannot deploy in protected sectors
- Mine types require ship with `canCarryMines` capability

### Red flags
- Deploying without purchasing
- Deploy working in protected sectors
- No energy cost

---

## Test 11: Bounties

### Steps
1. **Player 1**: Navigate to star mall
2. `bounties` - view active bounties (may be empty)
3. Register a bounty by interacting with bounty API (current terminal command is placeholder)
4. **Player 2**: `bounties` - should see the bounty listed
5. Destroy the bounty target's ship
6. Check that bounty reward was automatically claimed

### Expected
- Bounties list shows target, reward, placer
- Destroying a bounty target auto-claims all active bounties on them
- Reward added to destroyer's credits
- `combatlog` shows the engagement

---

## Test 12: Cargo Jettison

### Steps
1. Buy some cargo from an outpost
2. `status` - note cargo
3. `eject cyrillium 3` - jettison 3 units
4. `status` - verify cargo reduced

### Expected
- Cargo count decreases
- Cannot eject more than you have

---

## Test 13: Cloaking (Shadow Runner only)

### Steps
1. Purchase a Shadow Runner at star mall (`buyship stealth`)
2. `cloak` - toggle cloaking on
3. `cloak` - toggle cloaking off
4. Try cloaking in a non-stealth ship - should fail

### Expected
- Only Shadow Runner can cloak
- Cloak toggles on/off
- Other ships get "Ship cannot cloak" error

---

## Test 14: Energy Regeneration

### Steps
1. Note current energy via `status`
2. Spend some energy (move around, trade)
3. Wait 2-3 minutes
4. `status` again - energy should have increased

### Expected
- Energy increases by 1 per minute (2/min for new players in first 72 hours)
- Energy never exceeds max (500)

---

## Test 15: Edge Cases

### Try each of these:
- `move` with no argument
- `buy` with no arguments
- `fire` with no target
- `sell food 999999` (more than you have)
- `buy cyrillium 999999` (more than cargo space)
- Register with a duplicate username
- Register with a 3-character password
- Access game endpoints without logging in (open incognito, go to game URL)

### Expected
- All return helpful error messages
- No server crashes
- No data corruption

---

## Test 16: Missions & Quests

### Steps
1. Navigate to a Star Mall sector
2. `missionboard` - browse available missions
3. Note a mission template ID from the list
4. `accept <template_id>` - accept a mission
5. `missions` - verify mission appears as active with progress
6. Complete the mission objective (e.g., move to a sector for visit_sector type)
7. `missions` - verify progress updated or mission completed
8. Try accepting a 6th mission (should fail if you already have 5)
9. `abandon <mission_id>` - abandon an active mission

### Expected
- Mission board shows up to 6 available missions with difficulty, rewards, and time limits
- Accept adds mission to active list
- Progress updates automatically as you perform relevant actions
- Completion awards credits
- Cannot exceed 5 active missions
- Abandon removes mission from active list

### Red flags
- Mission board empty at Star Mall
- Progress not updating after relevant actions
- Credits not awarded on completion
- Accepting missions outside Star Mall

---

## Test 17: Sector Events & Anomalies

### Steps
1. Navigate through several sectors, using `look` in each
2. Find a sector with an event/anomaly listed (or wait for game ticks to spawn them)
3. `investigate` - interact with the event
4. Note the outcome (credits, cargo, energy change)
5. `look` - verify the event is resolved/gone
6. Try `investigate` again - should fail (no event)

### Expected
- Events appear in `look` output with type
- Investigating costs 1 energy
- Outcome varies by event type (cargo, credits, or energy gain/loss)
- Event removed after investigation
- Cannot investigate an already-resolved event

### Red flags
- Investigating with no event in sector
- No energy cost
- Event still showing after resolution
- Server error on investigate

---

## Test 18: Leaderboards

### Steps
1. `leaderboard` - view overview (top 5 per category)
2. `leaderboard credits` - view top 20 by credits
3. `leaderboard planets` - view top 20 by planets owned
4. `leaderboard combat` - view top 20 by combat kills
5. `leaderboard explored` - view top 20 by sectors explored
6. `leaderboard trade` - view top 20 by trade volume
7. `leaderboard syndicate` - view top 20 syndicates

### Expected
- Overview shows 6 categories with top 5 each
- Category view shows up to 20 entries with rank, name, score
- Your player appears in relevant categories after activity
- Data refreshes periodically (every ~5 minutes)

### Red flags
- Empty leaderboards after player activity
- Incorrect ranking order
- Duplicate entries
- Server error on category lookup

---

## Test 19: Player Messaging

### Steps
1. **Player 1**: `mail` - view inbox (should be empty)
2. **Player 1**: `mail send testpilot2 Greetings | Hello from Player 1!`
3. **Player 2**: `mail` - should see 1 unread message
4. **Player 2**: `mail read <message_id>` - read the message
5. **Player 2**: `mail` - message should now show as read
6. **Player 2**: `mail send testpilot1 Reply | Got your message!`
7. **Player 1**: `mail` - should see reply
8. **Player 1**: `mail sent` - view sent messages
9. **Player 1**: `mail delete <message_id>` - delete a message

### Expected
- Inbox shows messages newest first with read/unread status
- Reading a message marks it as read
- Sent view shows outgoing messages
- Delete removes message from inbox
- Cannot send to nonexistent player
- Message body limited to 1,000 characters

### Red flags
- Messages not appearing in recipient's inbox
- Read status not updating
- Deleted messages still showing
- Sending to self or nonexistent player not handled

---

## Test 20: Ship Upgrades

### Steps
1. Navigate to a Star Mall sector
2. `upgrades` - browse available upgrade types
3. Note an upgrade ID (e.g., `weapon_mk1`)
4. `install weapon_mk1` - install the upgrade
5. `shipupgrades` - verify upgrade is listed on your ship
6. `status` - verify ship stats reflect the bonus
7. Install the same upgrade again (stacking)
8. `shipupgrades` - verify two entries, second with diminished bonus
9. `uninstall <install_id>` - remove an upgrade
10. `shipupgrades` - verify upgrade removed

### Expected
- Upgrades list shows all 8 types with price, slot, and bonus
- Installing deducts credits and adds upgrade to ship
- Stacking same upgrade applies diminishing returns (80% of previous)
- Maximum 3 stacks of same type, 6 total upgrades per ship
- Uninstall removes upgrade (no refund)
- Must be at Star Mall to install/uninstall

### Red flags
- Stats not reflecting installed upgrades
- Exceeding max stack or total limits
- Credits not deducting
- Upgrades persisting after uninstall

---

## Test 21: Warp Gates

### Steps
1. Create a syndicate: ensure Player 1 is in a syndicate (as leader or officer)
2. Navigate to a standard sector
3. `warp` - should show no gates (unless one exists)
4. `warp build <destination_sector_id>` - build a gate (costs 100,000 credits, 500 tech, 200 cyrillium)
5. `warp` - verify gate listed with destination and toll
6. Use the warp gate to travel to the destination sector
7. `look` - verify you're in the destination sector
8. `warp toll <gate_id> 500` - set a 500 credit toll
9. `warp list` - view all syndicate gates
10. **Player 2** (non-syndicate member): Navigate to the gate sector and use the gate, verify toll is charged

### Expected
- Building requires syndicate officer+, resources, and credits
- Gate appears in both sectors (bidirectional)
- Using gate costs 2 energy + toll amount
- Syndicate members travel toll-free
- Maximum 3 gates per syndicate
- Toll collected goes to syndicate treasury

### Red flags
- Building without sufficient resources succeeding
- Gate not appearing in destination sector
- Toll not charging non-members
- Energy not deducting on use
- Exceeding max gate limit

---

## Quick Smoke Test Checklist

Run through this abbreviated flow to verify the basics work:

- [ ] Register a new player
- [ ] `look` - see sector contents (including events and warp gates)
- [ ] `move` to adjacent sector and back
- [ ] `status` - verify energy decreased
- [ ] `dock` at outpost, `buy` a commodity
- [ ] `sell` it at another outpost
- [ ] `dealer` at star mall
- [ ] `land` on a planet
- [ ] `claim` an unclaimed planet
- [ ] `help` shows all commands
- [ ] Second player can see first player in same sector
- [ ] `fire` works in standard sector, blocked in protected
- [ ] `flee` returns success/failure with chance
- [ ] `missionboard` shows available missions at Star Mall
- [ ] `accept` and `missions` track mission progress
- [ ] `investigate` resolves a sector event
- [ ] `leaderboard` shows player rankings
- [ ] `mail send` and `mail` for messaging
- [ ] `upgrades` and `install` at Star Mall garage
- [ ] `warp` shows gates, travel works with toll
