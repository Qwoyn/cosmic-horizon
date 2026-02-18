import db from '../db/connection';
import { checkMissionProgress, updateObjectivesDetail, ObjectiveDetail } from '../engine/missions';
import { awardXP } from '../engine/progression';
import { checkAchievements } from '../engine/achievements';
import { GAME_CONFIG } from '../config/game';

// Award mission rewards (credits, XP, items). Reused by auto-claim and manual claim.
export async function awardMissionRewards(
  playerId: string,
  mission: { reward_credits: number; reward_xp?: number; reward_items?: string | null }
): Promise<{ credits: number; xp: number }> {
  let creditsAwarded = 0;
  let xpAwarded = 0;

  if (mission.reward_credits > 0) {
    await db('players').where({ id: playerId }).increment('credits', mission.reward_credits);
    creditsAwarded = mission.reward_credits;
  }

  // Award mission XP (from template reward_xp, falling back to difficulty-based calc)
  const rewardXp = mission.reward_xp || 0;
  if (rewardXp > 0) {
    const result = await awardXP(playerId, rewardXp, 'mission');
    xpAwarded = result.xpAwarded;
  } else {
    // Fallback for old missions without reward_xp
    const difficulty = Math.max(1, Math.ceil(mission.reward_credits / 500));
    const result = await awardXP(playerId, GAME_CONFIG.XP_MISSION_COMPLETE_BASE * difficulty, 'mission');
    xpAwarded = result.xpAwarded;
  }

  await checkAchievements(playerId, 'mission_complete', {});

  return { credits: creditsAwarded, xp: xpAwarded };
}

export async function checkAndUpdateMissions(
  playerId: string,
  action: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const activeMissions = await db('player_missions')
      .join('mission_templates', 'player_missions.template_id', 'mission_templates.id')
      .where({ 'player_missions.player_id': playerId, 'player_missions.status': 'active' })
      .select(
        'player_missions.id as missionId',
        'mission_templates.type',
        'mission_templates.objectives as templateObjectives',
        'player_missions.progress',
        'player_missions.reward_credits',
        'player_missions.objectives_detail',
        'mission_templates.requires_claim_at_mall',
        'mission_templates.reward_xp'
      );

    for (const mission of activeMissions) {
      const objectives = typeof mission.templateObjectives === 'string'
        ? JSON.parse(mission.templateObjectives) : mission.templateObjectives;
      const progress = typeof mission.progress === 'string'
        ? JSON.parse(mission.progress) : mission.progress;

      const result = checkMissionProgress(
        { type: mission.type, objectives, progress },
        action,
        data
      );

      if (result.updated) {
        // Update objectives_detail if present
        let updatedDetail: ObjectiveDetail[] | null = null;
        if (mission.objectives_detail) {
          const detail = typeof mission.objectives_detail === 'string'
            ? JSON.parse(mission.objectives_detail) : mission.objectives_detail;
          updatedDetail = updateObjectivesDetail(mission.type, result.progress, detail);
        }

        if (result.completed) {
          const requiresClaim = !!mission.requires_claim_at_mall;

          if (requiresClaim) {
            // Don't award rewards yet — player must claim at a Star Mall
            await db('player_missions').where({ id: mission.missionId }).update({
              progress: JSON.stringify(result.progress),
              objectives_detail: updatedDetail ? JSON.stringify(updatedDetail) : undefined,
              status: 'completed',
              completed_at: new Date().toISOString(),
              claim_status: 'pending_claim',
            });
          } else {
            // Auto-claim: award rewards immediately
            await db('player_missions').where({ id: mission.missionId }).update({
              progress: JSON.stringify(result.progress),
              objectives_detail: updatedDetail ? JSON.stringify(updatedDetail) : undefined,
              status: 'completed',
              completed_at: new Date().toISOString(),
              claim_status: 'claimed',
            });
            await awardMissionRewards(playerId, {
              reward_credits: mission.reward_credits,
              reward_xp: mission.reward_xp,
            });
          }
        } else {
          const updateData: Record<string, any> = {
            progress: JSON.stringify(result.progress),
          };
          if (updatedDetail) {
            updateData.objectives_detail = JSON.stringify(updatedDetail);
          }
          await db('player_missions').where({ id: mission.missionId }).update(updateData);
        }
      }
    }
  } catch (err) {
    console.error('Mission tracker error:', err);
  }
}
