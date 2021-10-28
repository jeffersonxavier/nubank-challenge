import fs, { read } from 'fs';
import readline from 'readline';
import { Account, LineData, LineResult } from '../models';
import { TransactionService } from './TransactionService';

class AuthorizerService {

  private currentAccount: Account | undefined;
  private transactionService: TransactionService;
  private processResult: LineResult[];

  constructor() {
    this.processResult = [];
    this.transactionService = new TransactionService();
  }

  startProcess(file: string): Promise<LineResult[]> {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(file)) {
          throw new Error('File Not Found!');
        }

        const readInterface = readline.createInterface(fs.createReadStream(file));

        readInterface.on('line', this.processLine.bind(this));

        readInterface.on('close', () => resolve(this.processResult));
      } catch (error) {
        reject(error);
      }
    });
  }

  private processLine(line: string) {
    let result: LineResult = { account: {}, violations: [] };

    const data = JSON.parse(line) as LineData;

    if (data.account && !this.currentAccount) {
      this.currentAccount = data.account;
      result = { account: this.currentAccount, violations: [] };
    } else if (data.account && this.currentAccount) {
      result = { account: this.currentAccount, violations: ['account-already-initialized'] };
    } else if (data.transaction) {
      result = this.transactionService.process(this.currentAccount, data.transaction);

      if (JSON.stringify(result.account) !== JSON.stringify({}))
        this.currentAccount = result.account as Account;
    }

    this.processResult.push(result);
  }
}

export { AuthorizerService };
