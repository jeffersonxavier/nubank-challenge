import { Account, Transaction } from '../../src/models';
import { TransactionService } from '../../src/services/TransactionService';

describe('Process Transactions Unit Tests', () => {

  let transactionService: TransactionService;

  beforeEach(() => {
    transactionService = new TransactionService();
  })

  it('should be return a transaction validated', () => {
    let account: Account = { 'active-card': true, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test", amount: 20, time: new Date() };

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(0);
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(80);
  });

  it('should be return a violation when account is undefined', () => {
    let transaction: Transaction = { merchant: "Merchant Test", amount: 20, time: new Date() };

    const result = transactionService.process(undefined, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toBe('account-not-initialized');
    expect(JSON.stringify(result.account)).toBe(JSON.stringify({}));
  });

  it('should be return a violation when card is not active', () => {
    let account: Account = { 'active-card': false, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test", amount: 20, time: new Date() };

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toBe('card-not-active');
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(100);
  });

  it('should be return a violation when balance is insufficient', () => {
    let account: Account = { 'active-card': true, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test", amount: 200, time: new Date() };

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toBe('insufficient-limit');
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(100);
  });

  it('should be return a violation when exists 3 transaction in last 2 minutes', () => {
    let account: Account = { 'active-card': true, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test 4", amount: 10, time: new Date() };

    // @ts-ignore
    transactionService.lastTransactions = [
      { merchant: "Merchant Test 1", amount: 10, time: new Date() },
      { merchant: "Merchant Test 2", amount: 10, time: new Date() },
      { merchant: "Merchant Test 3", amount: 10, time: new Date() },
    ]

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toBe('high-frequency-small-interval');
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(100);
  });

  it('should be return a violation when exists the same transaction', () => {
    let account: Account = { 'active-card': true, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test", amount: 10, time: new Date() };

    // @ts-ignore
    transactionService.lastTransactions = [
      { merchant: "Merchant Test", amount: 10, time: new Date() },
    ]

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toBe('doubled-transaction');
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(100);
  });

  it('should be return a transaction validated when exists one transaction at last 2 minutes', () => {
    let account: Account = { 'active-card': true, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test 2", amount: 10, time: new Date() };

    // @ts-ignore
    transactionService.lastTransactions = [
      { merchant: "Merchant Test 1", amount: 10, time: new Date() },
    ]

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(0);
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(90);
  });

  it('should be return a transaction validated when exists old transactions', () => {
    let account: Account = { 'active-card': true, 'available-limit': 100 };
    let transaction: Transaction = { merchant: "Merchant Test 2", amount: 10, time: new Date() };

    const time = new Date(new Date().getTime() - 121 * 1000)

    // @ts-ignore
    transactionService.lastTransactions = [
      { merchant: "Merchant Test 1", amount: 10, time },
      { merchant: "Merchant Test 2", amount: 10, time },
      { merchant: "Merchant Test 3", amount: 10, time },
    ]

    const result = transactionService.process(account, transaction);

    expect(result).toBeTruthy();
    expect(result.violations).toHaveLength(0);
    expect(result.account).toBeTruthy();
    expect((result.account as Account)['available-limit']).toBe(90);
  });
});
