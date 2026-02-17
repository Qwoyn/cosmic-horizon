interface TutorialOverlayProps {
  tutorialStep: number;
  tutorialCompleted: boolean;
  onSkip: () => void;
}

const TOTAL_STEPS = 8;

const STEPS = [
  { title: 'Getting Started', hint: 'Type "look" or "l" to survey your sector.' },
  { title: 'Look Around', hint: 'Type "look" or "l" to see what\'s in your sector.' },
  { title: 'Check Your Status', hint: 'Type "status" or "st" to see your stats.' },
  { title: 'Move to a New Sector', hint: 'Type "move 90002" to head toward the Training Depot.' },
  { title: 'Explore Further', hint: 'Move through sectors 90003 and 90004 to complete this step.' },
  { title: 'Dock at an Outpost', hint: 'Head back to sector 90002 and type "dock" at the Training Depot.' },
  { title: 'Buy Commodities', hint: 'While docked, type "buy cyrillium 5" to stock up.' },
  { title: 'Sell for Profit', hint: 'Travel to sector 90004 and type "sell cyrillium 5" at the Frontier Post.' },
  { title: 'Tutorial Complete!', hint: '' },
];

export default function TutorialOverlay({ tutorialStep, tutorialCompleted, onSkip }: TutorialOverlayProps) {
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
        {currentStep.hint && (
          <span className="tutorial-overlay__hint">{currentStep.hint}</span>
        )}
      </div>
      <div className="tutorial-overlay__right">
        <button className="tutorial-overlay__btn tutorial-overlay__btn--skip" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
