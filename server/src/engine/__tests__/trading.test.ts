import { calculatePrice, executeTrade, OutpostState } from '../trading';

function makeOutpost(overrides: Partial<OutpostState> = {}): OutpostState {
  return {
    cyrilliumStock: 5000, cyrilliumCapacity: 10000, cyrilliumMode: 'sell',
    foodStock: 5000, foodCapacity: 10000, foodMode: 'buy',
    techStock: 5000, techCapacity: 10000, techMode: 'none',
    treasury: 50000,
    ...overrides,
  };
}

describe('Trading Engine', () => {
  describe('calculatePrice', () => {
    test('price increases when stock is low', () => {
      const highStockPrice = calculatePrice('cyrillium', 8000, 10000);
      const lowStockPrice = calculatePrice('cyrillium', 2000, 10000);
      expect(lowStockPrice).toBeGreaterThan(highStockPrice);
    });

    test('price decreases when stock is high', () => {
      const normalPrice = calculatePrice('food', 5000, 10000);
      const highPrice = calculatePrice('food', 9000, 10000);
      expect(highPrice).toBeLessThan(normalPrice);
    });

    test('price is always at least 1', () => {
      expect(calculatePrice('cyrillium', 10000, 10000)).toBeGreaterThanOrEqual(1);
    });

    test('tech is most expensive, cyrillium cheapest', () => {
      const cyr = calculatePrice('cyrillium', 5000, 10000);
      const food = calculatePrice('food', 5000, 10000);
      const tech = calculatePrice('tech', 5000, 10000);
      expect(tech).toBeGreaterThan(food);
      expect(food).toBeGreaterThan(cyr);
    });
  });

  describe('executeTrade', () => {
    test('buying from outpost that sells works', () => {
      const outpost = makeOutpost({ cyrilliumMode: 'sell', cyrilliumStock: 5000 });
      const result = executeTrade(outpost, 'cyrillium', 10, 'buy');
      expect(result.success).toBe(true);
      expect(result.quantity).toBe(10);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.newStock).toBe(4990);
    });

    test('rejects buying commodity outpost doesnt sell', () => {
      const outpost = makeOutpost({ cyrilliumMode: 'buy' });
      const result = executeTrade(outpost, 'cyrillium', 10, 'buy');
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not sell');
    });

    test('rejects selling commodity outpost doesnt buy', () => {
      const outpost = makeOutpost({ techMode: 'none' });
      const result = executeTrade(outpost, 'tech', 10, 'sell');
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not buy');
    });

    test('buying limited by outpost stock', () => {
      const outpost = makeOutpost({ cyrilliumMode: 'sell', cyrilliumStock: 5 });
      const result = executeTrade(outpost, 'cyrillium', 100, 'buy');
      expect(result.success).toBe(true);
      expect(result.quantity).toBe(5);
      expect(result.newStock).toBe(0);
    });

    test('selling limited by treasury', () => {
      const outpost = makeOutpost({ foodMode: 'buy', foodStock: 1000, treasury: 50 });
      const result = executeTrade(outpost, 'food', 100, 'sell');
      expect(result.success).toBe(true);
      expect(result.totalCost).toBeLessThanOrEqual(50);
      expect(result.newTreasury).toBeGreaterThanOrEqual(0);
    });

    test('selling limited by capacity', () => {
      const outpost = makeOutpost({ foodMode: 'buy', foodStock: 9995, foodCapacity: 10000, treasury: 999999 });
      const result = executeTrade(outpost, 'food', 100, 'sell');
      expect(result.success).toBe(true);
      expect(result.quantity).toBe(5);
    });

    test('buying increases outpost treasury', () => {
      const outpost = makeOutpost({ cyrilliumMode: 'sell', treasury: 50000 });
      const result = executeTrade(outpost, 'cyrillium', 10, 'buy');
      expect(result.newTreasury).toBeGreaterThan(50000);
    });

    test('selling decreases outpost treasury', () => {
      const outpost = makeOutpost({ foodMode: 'buy', treasury: 50000 });
      const result = executeTrade(outpost, 'food', 10, 'sell');
      expect(result.newTreasury).toBeLessThan(50000);
    });

    test('returns 0 quantity when outpost has no stock to sell', () => {
      const outpost = makeOutpost({ cyrilliumMode: 'sell', cyrilliumStock: 0 });
      const result = executeTrade(outpost, 'cyrillium', 10, 'buy');
      expect(result.success).toBe(false);
      expect(result.quantity).toBe(0);
    });
  });
});
