import { Account, LineResult, Transaction } from '../models';

class TransactionService {

  private lastTransactions: Transaction[];
  private transactionValidations: ((transaction: Transaction, account?: Account) => string[])[];

  constructor() {
    this.lastTransactions = [];
    this.transactionValidations = [
      this.insufficientLimitValidation.bind(this),
      this.highFrequencyValidation.bind(this),
      this.doubledTransactionValidation.bind(this),
    ];
  }

  process(account: Account | undefined, transaction: Transaction): LineResult {
    // Account Validations
    if (!account) {
      return { account: {}, violations: ['account-not-initialized'] };
    } else if (!account['active-card']) {
      return { account, violations: ['card-not-active'] };
    }

    const violations = this.transactionValidations.reduce((result: string[], validation) => {
      return [ ...result, ...validation(transaction, account) ];
    }, []);

    if (violations.length) {
      return { account, violations };
    }

    this.adjustTransactions(transaction);

    return {
      account: {
        ...account,
        'available-limit': account['available-limit'] - transaction.amount,
      },
      violations: [],
    };
  }

  private insufficientLimitValidation(transaction: Transaction, account?: Account) {
    if (account && transaction.amount > account['available-limit']) {
      return ['insufficient-limit'];
    }

    return [];
  }

  private highFrequencyValidation(transaction: Transaction) {
    const last3Transactions = this.lastTransactions.slice(-3);
    if (last3Transactions.length < 3)
      return [];

    const [firstTransaction] = last3Transactions;
    const passedTimeInSeconds = (new Date(transaction.time).getTime()
      - new Date(firstTransaction.time).getTime()) / 1000;

    if (passedTimeInSeconds <= 120)
      return ['high-frequency-small-interval'];

    return [];
  }

  private doubledTransactionValidation(transaction: Transaction) {
    const doubledTransaction = this.lastTransactions.some(current => {
      const passedTimeInSeconds = (new Date(transaction.time).getTime()
        - new Date(current.time).getTime()) / 1000;

      return current.merchant === transaction.merchant
        && current.amount === transaction.amount && passedTimeInSeconds <= 120;
    });

    if (doubledTransaction) {
      return ['doubled-transaction'];
    }

    return [];
  }

  private adjustTransactions(transaction: Transaction) {
    const firstTime = new Date(new Date(transaction.time).getTime() - 120 * 1000); // 2 minutes ago

    this.lastTransactions = [
      ...this.lastTransactions.filter(current => {
        return new Date(current.time) >= firstTime;
      }),
      transaction,
    ];
  }
}

export { TransactionService };
