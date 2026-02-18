import db from '../db/connection';
import crypto from 'crypto';
import { GAME_CONFIG } from '../config/game';
import { awardXP } from './progression';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeParseJSON(value: any): any {
  if (value == null) return null;
  return typeof value === 'string' ? JSON.parse(value) : value;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Return every NPC placed in a sector, annotated with the requesting player's
 * encounter / reputation state.
 */
export async function getNPCsInSector(
  sectorId: number,
  playerId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    title: string | null;
    race: string | null;
    factionId: string | null;
    encountered: boolean;
    reputation: number;
    services: any;
    spriteConfig: any;
  }>
> {
  try {
    const rows = await db('npc_definitions')
      .leftJoin('player_npc_state', function () {
        this.on('player_npc_state.npc_id', '=', 'npc_definitions.id').andOn(
          'player_npc_state.player_id',
          '=',
          db.raw('?', [playerId]),
        );
      })
      .where('npc_definitions.sector_id', sectorId)
      .select(
        'npc_definitions.id',
        'npc_definitions.name',
        'npc_definitions.title',
        'npc_definitions.race',
        'npc_definitions.faction_id',
        'npc_definitions.services',
        'npc_definitions.sprite_config',
        'player_npc_state.encountered',
        'player_npc_state.reputation',
      );

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      title: r.title ?? null,
      race: r.race ?? null,
      factionId: r.faction_id ?? null,
      encountered: r.encountered === true || r.encountered === 1,
      reputation: r.reputation ?? 0,
      services: safeParseJSON(r.services),
      spriteConfig: safeParseJSON(r.sprite_config),
    }));
  } catch (err) {
    console.error('getNPCsInSector error:', err);
    throw err;
  }
}

/**
 * Return NPCs in a sector that the player has NOT yet encountered.
 * Includes first_encounter and sprite_config for cutscene building.
 */
export async function getUnencounteredNPCsInSector(
  sectorId: number,
  playerId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    title: string | null;
    race: string | null;
    firstEncounter: any;
    spriteConfig: any;
  }>
> {
  try {
    const rows = await db('npc_definitions')
      .leftJoin('player_npc_state', function () {
        this.on('player_npc_state.npc_id', '=', 'npc_definitions.id').andOn(
          'player_npc_state.player_id',
          '=',
          db.raw('?', [playerId]),
        );
      })
      .where('npc_definitions.sector_id', sectorId)
      .where(function () {
        this.whereNull('player_npc_state.encountered').orWhere(
          'player_npc_state.encountered',
          false,
        );
      })
      .select(
        'npc_definitions.id',
        'npc_definitions.name',
        'npc_definitions.title',
        'npc_definitions.race',
        'npc_definitions.first_encounter',
        'npc_definitions.sprite_config',
      );

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      title: r.title ?? null,
      race: r.race ?? null,
      firstEncounter: safeParseJSON(r.first_encounter),
      spriteConfig: safeParseJSON(r.sprite_config),
    }));
  } catch (err) {
    console.error('getUnencounteredNPCsInSector error:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Player <-> NPC state
// ---------------------------------------------------------------------------

/**
 * Ensure a player_npc_state row exists for the given (player, NPC) pair.
 * Creates one with sensible defaults when absent.
 */
export async function ensurePlayerNPCState(
  playerId: string,
  npcId: string,
): Promise<any> {
  try {
    const existing = await db('player_npc_state')
      .where({ player_id: playerId, npc_id: npcId })
      .first();

    if (existing) return existing;

    const row = {
      id: crypto.randomUUID(),
      player_id: playerId,
      npc_id: npcId,
      encountered: false,
      reputation: 0,
      dialogue_state: JSON.stringify({ currentNode: 'root' }),
    };

    await db('player_npc_state').insert(row);
    return row;
  } catch (err) {
    console.error('ensurePlayerNPCState error:', err);
    throw err;
  }
}

/**
 * Flag an NPC as encountered and award first-encounter XP.
 */
export async function markEncountered(
  playerId: string,
  npcId: string,
): Promise<{ encountered: true; xp: any }> {
  try {
    await ensurePlayerNPCState(playerId, npcId);

    await db('player_npc_state')
      .where({ player_id: playerId, npc_id: npcId })
      .update({
        encountered: true,
        last_visited: new Date().toISOString(),
      });

    const xpResult = await awardXP(
      playerId,
      GAME_CONFIG.XP_NPC_FIRST_ENCOUNTER,
      'explore',
    );

    return { encountered: true, xp: xpResult };
  } catch (err) {
    console.error('markEncountered error:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------------------

/**
 * Core dialogue engine. Retrieves the current dialogue node for a player/NPC
 * pair, optionally advancing via `choiceIndex`, and returns the resulting
 * dialogue frame with annotated options and any side-effects.
 */
export async function processDialogue(
  playerId: string,
  npcId: string,
  choiceIndex?: number,
): Promise<{
  npcName: string;
  npcTitle: string | null;
  text: string;
  options: Array<{
    label: string;
    next: string | null;
    locked: boolean;
    lockReason?: string;
  }>;
  reputation: number;
  effects: any;
  isEnd: boolean;
  xp?: any;
}> {
  try {
    // 1. Fetch NPC definition
    const npc = await db('npc_definitions').where({ id: npcId }).first();
    if (!npc) throw new Error(`NPC not found: ${npcId}`);

    // 2. Ensure state row exists
    const state = await ensurePlayerNPCState(playerId, npcId);

    // 3. First encounter handling
    let xpResult: any;
    const isEncountered =
      state.encountered === true || state.encountered === 1;
    if (!isEncountered) {
      const encounterResult = await markEncountered(playerId, npcId);
      xpResult = encounterResult.xp;
    }

    // 4. Parse trees
    const dialogueTree = safeParseJSON(npc.dialogue_tree);
    let dialogueState = safeParseJSON(state.dialogue_state) || {
      currentNode: 'root',
    };

    let currentNodeKey: string = dialogueState.currentNode || 'root';
    let currentReputation = state.reputation ?? 0;

    // 5. If a choice was made, navigate
    if (choiceIndex !== undefined) {
      const currentNode = dialogueTree[currentNodeKey];
      if (!currentNode) throw new Error(`Dialogue node not found: ${currentNodeKey}`);

      const options: any[] = currentNode.options || [];
      if (choiceIndex < 0 || choiceIndex >= options.length) {
        throw new Error(
          `Invalid choiceIndex ${choiceIndex} — node "${currentNodeKey}" has ${options.length} option(s)`,
        );
      }

      const selected = options[choiceIndex];

      // Check requirements
      if (selected.requires) {
        if (
          selected.requires.reputation !== undefined &&
          currentReputation < selected.requires.reputation
        ) {
          const reqLabel =
            selected.requires.reputation >= GAME_CONFIG.NPC_REP_THRESHOLD_TRUSTED
              ? 'Trusted'
              : selected.requires.reputation >= GAME_CONFIG.NPC_REP_THRESHOLD_FRIENDLY
                ? 'Friendly'
                : `Reputation ${selected.requires.reputation}`;

          // Return locked response — do not advance
          return {
            npcName: npc.name,
            npcTitle: npc.title ?? null,
            text: `[This dialogue option requires: ${reqLabel}]`,
            options: annotateOptions(currentNode.options || [], currentReputation),
            reputation: currentReputation,
            effects: null,
            isEnd: false,
            ...(xpResult ? { xp: xpResult } : {}),
          };
        }
      }

      // Navigate
      if (selected.next === null) {
        // Conversation ends — reset to root
        currentNodeKey = 'root';
        dialogueState.currentNode = 'root';
        await db('player_npc_state')
          .where({ player_id: playerId, npc_id: npcId })
          .update({
            dialogue_state: JSON.stringify(dialogueState),
            last_visited: new Date().toISOString(),
          });

        return {
          npcName: npc.name,
          npcTitle: npc.title ?? null,
          text: selected.endText || 'Farewell, traveler.',
          options: [],
          reputation: currentReputation,
          effects: null,
          isEnd: true,
          ...(xpResult ? { xp: xpResult } : {}),
        };
      }

      currentNodeKey = selected.next;
    }

    // 6. Resolve current node
    const node = dialogueTree[currentNodeKey];
    if (!node) throw new Error(`Dialogue node not found: ${currentNodeKey}`);

    // 7. Apply effects
    let effects: any = null;
    if (node.effects) {
      effects = node.effects;
      if (typeof node.effects.reputation === 'number' && node.effects.reputation !== 0) {
        currentReputation = await adjustReputation(
          playerId,
          npcId,
          node.effects.reputation,
        );

        // Faction spillover
        if (npc.faction_id) {
          await adjustFactionRep(
            playerId,
            npc.faction_id,
            Math.floor(node.effects.reputation * GAME_CONFIG.NPC_FACTION_REP_SPILLOVER),
          );
        }
      }
    }

    // 8. Annotate options
    const annotatedOptions = annotateOptions(node.options || [], currentReputation);

    // 9. Persist dialogue state
    dialogueState.currentNode = currentNodeKey;
    await db('player_npc_state')
      .where({ player_id: playerId, npc_id: npcId })
      .update({
        dialogue_state: JSON.stringify(dialogueState),
        last_visited: new Date().toISOString(),
      });

    return {
      npcName: npc.name,
      npcTitle: npc.title ?? null,
      text: node.text,
      options: annotatedOptions,
      reputation: currentReputation,
      effects,
      isEnd: false,
      ...(xpResult ? { xp: xpResult } : {}),
    };
  } catch (err) {
    console.error('processDialogue error:', err);
    throw err;
  }
}

/**
 * Annotate a list of dialogue options with lock state based on the player's
 * current reputation with the NPC.
 */
function annotateOptions(
  options: any[],
  reputation: number,
): Array<{ label: string; next: string | null; locked: boolean; lockReason?: string }> {
  return options.map((opt: any) => {
    const result: { label: string; next: string | null; locked: boolean; lockReason?: string } = {
      label: opt.label,
      next: opt.next ?? null,
      locked: false,
    };

    if (opt.requires && typeof opt.requires.reputation === 'number') {
      if (reputation < opt.requires.reputation) {
        result.locked = true;
        if (opt.requires.reputation >= GAME_CONFIG.NPC_REP_THRESHOLD_TRUSTED) {
          result.lockReason = 'Requires: Trusted';
        } else if (opt.requires.reputation >= GAME_CONFIG.NPC_REP_THRESHOLD_FRIENDLY) {
          result.lockReason = 'Requires: Friendly';
        } else {
          result.lockReason = `Requires: Reputation ${opt.requires.reputation}`;
        }
      }
    }

    return result;
  });
}

// ---------------------------------------------------------------------------
// Reputation
// ---------------------------------------------------------------------------

/**
 * Adjust a player's reputation with a specific NPC by `amount`.
 * The value is clamped to [NPC_MIN_REPUTATION, NPC_MAX_REPUTATION].
 */
export async function adjustReputation(
  playerId: string,
  npcId: string,
  amount: number,
): Promise<number> {
  try {
    const state = await db('player_npc_state')
      .where({ player_id: playerId, npc_id: npcId })
      .first();

    const current = state?.reputation ?? 0;
    const newRep = Math.max(
      GAME_CONFIG.NPC_MIN_REPUTATION,
      Math.min(GAME_CONFIG.NPC_MAX_REPUTATION, current + amount),
    );

    await db('player_npc_state')
      .where({ player_id: playerId, npc_id: npcId })
      .update({ reputation: newRep });

    return newRep;
  } catch (err) {
    console.error('adjustReputation error:', err);
    throw err;
  }
}

/**
 * Adjust a player's reputation with a faction. Creates the row if it does not
 * yet exist. Clamped to [-100, 100].
 */
export async function adjustFactionRep(
  playerId: string,
  factionId: string,
  amount: number,
): Promise<number> {
  try {
    const existing = await db('player_faction_rep')
      .where({ player_id: playerId, faction_id: factionId })
      .first();

    const clamp = (v: number) => Math.max(-100, Math.min(100, v));

    if (existing) {
      const newRep = clamp(existing.reputation + amount);
      await db('player_faction_rep')
        .where({ player_id: playerId, faction_id: factionId })
        .update({ reputation: newRep });
      return newRep;
    }

    const newRep = clamp(amount);
    await db('player_faction_rep').insert({
      player_id: playerId,
      faction_id: factionId,
      reputation: newRep,
    });
    return newRep;
  } catch (err) {
    console.error('adjustFactionRep error:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Player contact book
// ---------------------------------------------------------------------------

/**
 * List every NPC the player has encountered, ordered by most recently visited.
 */
export async function getContacts(
  playerId: string,
): Promise<
  Array<{
    npcId: string;
    name: string;
    title: string | null;
    race: string | null;
    factionId: string | null;
    factionName: string | null;
    sectorId: number;
    reputation: number;
    lastVisited: string | null;
  }>
> {
  try {
    const rows = await db('player_npc_state')
      .join('npc_definitions', 'player_npc_state.npc_id', 'npc_definitions.id')
      .leftJoin('factions', 'npc_definitions.faction_id', 'factions.id')
      .where('player_npc_state.player_id', playerId)
      .where('player_npc_state.encountered', true)
      .orderBy('player_npc_state.last_visited', 'desc')
      .select(
        'npc_definitions.id as npc_id',
        'npc_definitions.name',
        'npc_definitions.title',
        'npc_definitions.race',
        'npc_definitions.faction_id',
        'factions.name as faction_name',
        'npc_definitions.sector_id',
        'player_npc_state.reputation',
        'player_npc_state.last_visited',
      );

    return rows.map((r: any) => ({
      npcId: r.npc_id,
      name: r.name,
      title: r.title ?? null,
      race: r.race ?? null,
      factionId: r.faction_id ?? null,
      factionName: r.faction_name ?? null,
      sectorId: r.sector_id,
      reputation: r.reputation,
      lastVisited: r.last_visited ?? null,
    }));
  } catch (err) {
    console.error('getContacts error:', err);
    throw err;
  }
}

/**
 * Fetch detailed info about a single NPC the player has already encountered.
 * Returns null when the NPC doesn't exist or hasn't been encountered.
 */
export async function getNPCDetail(
  playerId: string,
  npcId: string,
): Promise<{
  id: string;
  name: string;
  title: string | null;
  race: string | null;
  factionId: string | null;
  factionName: string | null;
  sectorId: number;
  locationType: string;
  reputation: number;
  services: any;
  lastVisited: string | null;
  isKeyNpc: boolean;
} | null> {
  try {
    const row = await db('player_npc_state')
      .join('npc_definitions', 'player_npc_state.npc_id', 'npc_definitions.id')
      .leftJoin('factions', 'npc_definitions.faction_id', 'factions.id')
      .where('player_npc_state.player_id', playerId)
      .where('player_npc_state.npc_id', npcId)
      .where('player_npc_state.encountered', true)
      .select(
        'npc_definitions.id',
        'npc_definitions.name',
        'npc_definitions.title',
        'npc_definitions.race',
        'npc_definitions.faction_id',
        'factions.name as faction_name',
        'npc_definitions.sector_id',
        'npc_definitions.location_type',
        'npc_definitions.services',
        'npc_definitions.is_key_npc',
        'player_npc_state.reputation',
        'player_npc_state.last_visited',
      )
      .first();

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      title: row.title ?? null,
      race: row.race ?? null,
      factionId: row.faction_id ?? null,
      factionName: row.faction_name ?? null,
      sectorId: row.sector_id,
      locationType: row.location_type,
      reputation: row.reputation,
      services: safeParseJSON(row.services),
      lastVisited: row.last_visited ?? null,
      isKeyNpc: row.is_key_npc === true || row.is_key_npc === 1,
    };
  } catch (err) {
    console.error('getNPCDetail error:', err);
    throw err;
  }
}
