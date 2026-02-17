export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  hint: string;
  triggerAction: string;
  triggerCount: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: 'Look Around',
    description: 'Get your bearings. Use the look command to survey your current sector.',
    hint: 'Type "look" or "l" to see what\'s in your sector.',
    triggerAction: 'look',
    triggerCount: 1,
  },
  {
    step: 2,
    title: 'Check Your Status',
    description: 'Review your pilot profile, ship stats, and cargo.',
    hint: 'Type "status" or "st" to see your stats.',
    triggerAction: 'status',
    triggerCount: 1,
  },
  {
    step: 3,
    title: 'Move to a New Sector',
    description: 'Navigate to an adjacent sector to begin exploring.',
    hint: 'Type "move 90002" to head toward the Training Depot.',
    triggerAction: 'move',
    triggerCount: 1,
  },
  {
    step: 4,
    title: 'Explore Further',
    description: 'Keep moving through the galaxy. Visit two more sectors.',
    hint: 'Move through sectors 90003 and 90004 to complete this step.',
    triggerAction: 'move',
    triggerCount: 2,
  },
  {
    step: 5,
    title: 'Dock at an Outpost',
    description: 'Find a sector with an outpost and dock to view trade prices.',
    hint: 'Head back to sector 90002 and type "dock" to dock at the Training Depot.',
    triggerAction: 'dock',
    triggerCount: 1,
  },
  {
    step: 6,
    title: 'Buy Commodities',
    description: 'Purchase goods from an outpost to fill your cargo hold.',
    hint: 'While docked at the Training Depot, type "buy cyrillium 5" to stock up.',
    triggerAction: 'buy',
    triggerCount: 1,
  },
  {
    step: 7,
    title: 'Sell for Profit',
    description: 'Sell commodities at the Frontier Post to earn credits.',
    hint: 'Travel to sector 90004 and type "sell cyrillium 5" at the Frontier Post.',
    triggerAction: 'sell',
    triggerCount: 1,
  },
  {
    step: 8,
    title: 'Tutorial Complete!',
    description: 'You\'ve learned the basics. The galaxy awaits, pilot.',
    hint: '',
    triggerAction: 'auto',
    triggerCount: 0,
  },
];

export const TUTORIAL_REWARD_CREDITS = 5000;
export const TOTAL_TUTORIAL_STEPS = TUTORIAL_STEPS.length;

export function getTutorialStep(step: number): TutorialStep | undefined {
  return TUTORIAL_STEPS.find(s => s.step === step);
}
