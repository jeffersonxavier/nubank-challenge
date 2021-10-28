import { Account } from '../../src/models';
import { AuthorizerService } from '../../src/services/AuthorizerService';

describe('Integration Tests to Authorizer', () => {

  let authorizerService: AuthorizerService;

  beforeEach(() => {
    authorizerService = new AuthorizerService();
  })

  it('should validate account and transactions with sucess', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input1');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(2);
    expect(result[0].violations).toHaveLength(0);
    expect(result[1].violations).toHaveLength(0);
    expect((result[0].account as Account)['available-limit']).toBe(100);
    expect((result[1].account as Account)['available-limit']).toBe(80);
  });

  it('should return violation to duplicate account', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input2');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(2);
    expect(result[1].violations).toHaveLength(1);
    expect(result[1].violations[0]).toBe('account-already-initialized');
  });

  it('should return violation to transaction without account', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input3');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(3);
    expect(result[0].violations).toHaveLength(1);
    expect(result[0].violations[0]).toBe('account-not-initialized');
  });

  it('should return violation to card inactive', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input4');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(3);
    expect(result[1].violations).toHaveLength(1);
    expect(result[2].violations).toHaveLength(1);
    expect(result[1].violations[0]).toBe('card-not-active');
    expect(result[2].violations[0]).toBe('card-not-active');
  });

  it('should return violation to account without limit', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input5');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(4);
    expect(result[1].violations).toHaveLength(1);
    expect(result[2].violations).toHaveLength(1);
    expect(result[1].violations[0]).toBe('insufficient-limit');
    expect(result[2].violations[0]).toBe('insufficient-limit');
  });

  it('should return violation to high frequency of transactions', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input6');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(6);
    expect(result[4].violations).toHaveLength(1);
    expect(result[4].violations[0]).toBe('high-frequency-small-interval');
  });

  it('should return violation to doubled transactions', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input7');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
    expect(result[3].violations).toHaveLength(1);
    expect(result[3].violations[0]).toBe('doubled-transaction');
  });

  it('should return multiple violations when exists multiple problems', async () => {
    const result = await authorizerService.startProcess('./__tests__/integration/input_tests/input8');

    expect(result).toBeTruthy();
    expect(result).toHaveLength(8);
    expect(result[4].violations).toHaveLength(2);
    expect(result[5].violations).toHaveLength(2);
    expect(result[6].violations).toHaveLength(2);
    expect(result[4].violations[0]).toBe('high-frequency-small-interval');
    expect(result[4].violations[1]).toBe('doubled-transaction');
    expect(result[5].violations[0]).toBe('insufficient-limit');
    expect(result[5].violations[1]).toBe('high-frequency-small-interval');
    expect(result[6].violations[0]).toBe('insufficient-limit');
    expect(result[6].violations[1]).toBe('high-frequency-small-interval');
  });

  it('should return error when input file is invalid', async () => {
    try {
      await authorizerService.startProcess('invalid');
      fail('Not return error to input file invalid!');
    } catch (error: any) {
      expect(error.message).toBe('File Not Found!');
    }
  });
});
