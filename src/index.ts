import fs from 'fs';
import { AuthorizerService } from './services/AuthorizerService';

const processFile = () => {
  const args = process.argv.slice(2);
  if (!args || !args.length) {
    throw new Error('Invalid Input File!');
  }

  const file = args[0];
  if (!fs.existsSync(file)) {
    throw new Error('File Not Found!');
  }

  const authorizerService = new AuthorizerService();
  authorizerService.startProcess(file);
};

try {
  processFile();
} catch (error: any) {
  console.log(error.message);
}
