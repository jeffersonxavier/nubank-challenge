import fs from 'fs';
import readline from 'readline';
import { Account, LineData, LineResult } from '../models';
import { TransactionService } from './TransactionService';

class AuthorizerService {

  private currentAccount: Account | undefined;
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  startProcess(file: string) {
    this.startReader(file);
  }

  private processLine(line: string) {
    let result: LineResult | undefined;

    const data = JSON.parse(line) as LineData;

    if (data.account && !this.currentAccount) {
      this.currentAccount = data.account;
      result = { account: this.currentAccount, violations: [] };
    } else if (data.account) {
      result = { account: this.currentAccount || {}, violations: ['account-already-initialized'] };
    } else if (data.transaction) {
      result = this.transactionService.process(this.currentAccount, data.transaction);

      if (JSON.stringify(result.account) !== JSON.stringify({}))
        this.currentAccount = result.account as Account;
    }

    console.log(JSON.stringify(result));
  }

  private startReader(file: string) {
    const readInterface = readline.createInterface(fs.createReadStream(file));

    readInterface.on('line', this.processLine.bind(this));
  }
}

export { AuthorizerService };
