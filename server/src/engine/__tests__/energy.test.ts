import { calculateEnergyRegen, canAffordAction, deductEnergy, getActionCost } from '../energy';
import { GAME_CONFIG } from '../../config/game';

describe('Energy System', () => {
  test('calculates standard regen correctly', () => {
    const result = calculateEnergyRegen(100, GAME_CONFIG.MAX_ENERGY, 5, false);
    expect(result).toBe(105);
  });

  test('caps at max energy', () => {
    const result = calculateEnergyRegen(498, 500, 10, false);
    expect(result).toBe(500);
  });

  test('applies bonus multiplier for new players', () => {
    const result = calculateEnergyRegen(100, 500, 5, true);
    expect(result).toBe(110); // 5 * 2 = 10
  });

  test('canAffordAction checks correctly', () => {
    expect(canAffordAction(10, 'move')).toBe(true);
    expect(canAffordAction(0, 'move')).toBe(false);
    expect(canAffordAction(1, 'combat_volley')).toBe(false);
    expect(canAffordAction(2, 'combat_volley')).toBe(true);
  });

  test('planet management is free', () => {
    expect(canAffordAction(0, 'planet_management')).toBe(true);
    expect(deductEnergy(50, 'planet_management')).toBe(50);
  });

  test('deductEnergy returns correct remaining', () => {
    expect(deductEnergy(100, 'move')).toBe(99);
    expect(deductEnergy(100, 'trade')).toBe(99);
    expect(deductEnergy(100, 'combat_volley')).toBe(98);
    expect(deductEnergy(100, 'deploy')).toBe(99);
  });

  test('getActionCost returns correct costs', () => {
    expect(getActionCost('move')).toBe(1);
    expect(getActionCost('combat_volley')).toBe(2);
    expect(getActionCost('planet_management')).toBe(0);
  });
});
