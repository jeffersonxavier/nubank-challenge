import fs from 'fs';
import readline from 'readline';
import { Account, LineData, LineResult } from '../models';

class AuthorizerService {

  private currentAccount: Account | undefined;

  startProcess(file: string) {
    this.startReader(file);
  }

  private processLine(line: string) {
    const data = JSON.parse(line) as LineData;
    const violations = [];

    if (data.account && !this.currentAccount) {
      this.currentAccount = data.account;
    } else if (data.account) {
      violations.push('account-already-initialized')
    } else if (data.transaction) {

    }

    const result: LineResult = { account: this.currentAccount || {}, violations };
    console.log(JSON.stringify(result));
  }

  private startReader(file: string) {
    const readInterface = readline.createInterface(fs.createReadStream(file));

    readInterface.on('line', this.processLine);
  }
}

export { AuthorizerService };
