import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTutorialStep, TUTORIAL_STEPS, TUTORIAL_REWARD_CREDITS, TOTAL_TUTORIAL_STEPS } from '../config/tutorial';
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
    const isComplete = newStep >= TOTAL_TUTORIAL_STEPS;

    const updateData: any = { tutorial_step: newStep };
    if (isComplete) {
      updateData.tutorial_completed = true;
    }

    await db('players').where({ id: player.id }).update(updateData);

    // Award credits on completion
    let reward = 0;
    if (isComplete) {
      reward = TUTORIAL_REWARD_CREDITS;
      await db('players').where({ id: player.id }).increment('credits', reward);
    }

    const followingStep = getTutorialStep(newStep + 1);

    res.json({
      advanced: true,
      currentStep: newStep,
      completed: isComplete,
      reward,
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

    res.json({ completed: true, reward: 0 });
  } catch (err) {
    console.error('Tutorial skip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
