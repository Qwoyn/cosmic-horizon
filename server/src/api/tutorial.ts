import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTutorialStep, TUTORIAL_STEPS, TUTORIAL_REWARD_CREDITS, TOTAL_TUTORIAL_STEPS } from '../config/tutorial';
import { resetPlayerForRealGame } from '../services/tutorial-sandbox';
import db from '../db/connection';

const router = Router();

// Get tutorial status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const currentStep = player.tutorial_step || 0;
    const completed = !!player.tutorial_completed;
    const nextStep = getTutorialStep(currentStep + 1);

    res.json({
      currentStep,
      completed,
      totalSteps: TOTAL_TUTORIAL_STEPS,
      nextStep: completed ? null : nextStep ? {
        step: nextStep.step,
        title: nextStep.title,
        description: nextStep.description,
        hint: nextStep.hint,
        triggerAction: nextStep.triggerAction,
        triggerCount: nextStep.triggerCount,
      } : null,
    });
  } catch (err) {
    console.error('Tutorial status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advance tutorial
router.post('/advance', requireAuth, async (req, res) => {
  try {
    const { action, count } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Missing action' });
    }

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (player.tutorial_completed) {
      return res.json({ completed: true, currentStep: player.tutorial_step });
    }

    const currentStep = player.tutorial_step || 0;
    const nextStep = getTutorialStep(currentStep + 1);

    if (!nextStep) {
      return res.json({ completed: true, currentStep });
    }

    // Check if action matches
    if (nextStep.triggerAction !== action) {
      return res.json({
        advanced: false,
        currentStep,
        reason: `Current step requires: ${nextStep.triggerAction}`,
      });
    }

    // For multi-count steps, verify count
    if (nextStep.triggerCount > 1 && (count || 1) < nextStep.triggerCount) {
      return res.json({
        advanced: false,
        currentStep,
        reason: `Need ${nextStep.triggerCount} ${nextStep.triggerAction} actions (have ${count || 1})`,
      });
    }

    // Advance
    const newStep = currentStep + 1;
    const followingStep = getTutorialStep(newStep + 1);
    const isComplete = newStep >= TOTAL_TUTORIAL_STEPS || followingStep?.triggerAction === 'auto';

    const updateData: any = { tutorial_step: isComplete ? TOTAL_TUTORIAL_STEPS : newStep };
    if (isComplete) {
      updateData.tutorial_completed = true;
    }

    await db('players').where({ id: player.id }).update(updateData);

    // On completion, reset player for the real game
    let reward = 0;
    let newSectorId: number | undefined;
    let newCredits: number | undefined;
    if (isComplete) {
      reward = TUTORIAL_REWARD_CREDITS;
      const resetResult = await resetPlayerForRealGame(player.id);
      newSectorId = resetResult.newSectorId;
      newCredits = resetResult.newCredits + reward;
      await db('players').where({ id: player.id }).update({ credits: newCredits });
    }

    res.json({
      advanced: true,
      currentStep: isComplete ? TOTAL_TUTORIAL_STEPS : newStep,
      completed: isComplete,
      reward,
      newSectorId,
      newCredits,
      nextStep: isComplete ? null : followingStep ? {
        step: followingStep.step,
        title: followingStep.title,
        description: followingStep.description,
        hint: followingStep.hint,
        triggerAction: followingStep.triggerAction,
        triggerCount: followingStep.triggerCount,
      } : null,
    });
  } catch (err) {
    console.error('Tutorial advance error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Skip tutorial
router.post('/skip', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    await db('players').where({ id: player.id }).update({
      tutorial_completed: true,
      tutorial_step: TOTAL_TUTORIAL_STEPS,
    });

    const resetResult = await resetPlayerForRealGame(player.id);

    res.json({
      completed: true,
      reward: 0,
      newSectorId: resetResult.newSectorId,
      newCredits: resetResult.newCredits,
    });
  } catch (err) {
    console.error('Tutorial skip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
