import db from '../db/connection';
import { checkMissionProgress } from '../engine/missions';

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
        'player_missions.reward_credits'
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
        if (result.completed) {
          await db('player_missions').where({ id: mission.missionId }).update({
            progress: JSON.stringify(result.progress),
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
          // Award credits
          if (mission.reward_credits > 0) {
            await db('players').where({ id: playerId }).increment('credits', mission.reward_credits);
          }
        } else {
          await db('player_missions').where({ id: mission.missionId }).update({
            progress: JSON.stringify(result.progress),
          });
        }
      }
    }
  } catch (err) {
    console.error('Mission tracker error:', err);
  }
}
