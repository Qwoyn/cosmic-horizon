import { useState } from 'react';

interface TutorialOverlayProps {
  tutorialStep: number;
  tutorialCompleted: boolean;
  onSkip: () => void;
}

const TOTAL_STEPS = 8;

const STEPS = [
  { title: 'Getting Started', hint: '' },
  { title: 'Look Around', hint: 'Type "look" or "l" to see what\'s in your sector.' },
  { title: 'Check Your Status', hint: 'Type "status" or "st" to see your stats.' },
  { title: 'Move to a New Sector', hint: 'Type "move <sector_id>" using an adjacent sector number.' },
  { title: 'Explore Further', hint: 'Move to two more sectors to complete this step.' },
  { title: 'Dock at an Outpost', hint: 'Find a sector with an outpost, then type "dock".' },
  { title: 'Buy Commodities', hint: 'While docked, type "buy <commodity> <quantity>".' },
  { title: 'Sell for Profit', hint: 'Find another outpost and type "sell <commodity> <quantity>".' },
  { title: 'Tutorial Complete!', hint: '' },
];

export default function TutorialOverlay({ tutorialStep, tutorialCompleted, onSkip }: TutorialOverlayProps) {
  const [showHint, setShowHint] = useState(false);

  if (tutorialCompleted) return null;

  const currentStep = STEPS[tutorialStep + 1] || STEPS[STEPS.length - 1];
  const progress = Math.min(tutorialStep / TOTAL_STEPS, 1);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-overlay__left">
        <span className="tutorial-overlay__label">TUTORIAL</span>
        <div className="tutorial-overlay__progress">
          <div
            className="tutorial-overlay__progress-bar"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="tutorial-overlay__step">{tutorialStep}/{TOTAL_STEPS}</span>
      </div>
      <div className="tutorial-overlay__center">
        <span className="tutorial-overlay__title">{currentStep.title}</span>
        {showHint && currentStep.hint && (
          <span className="tutorial-overlay__hint">{currentStep.hint}</span>
        )}
      </div>
      <div className="tutorial-overlay__right">
        {currentStep.hint && (
          <button
            className="tutorial-overlay__btn"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        )}
        <button className="tutorial-overlay__btn tutorial-overlay__btn--skip" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
