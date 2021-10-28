import { AuthorizerService } from './services/AuthorizerService';

const processFile = async () => {
  const args = process.argv.slice(2);
  if (!args || !args.length) {
    throw new Error('Invalid Input File!');
  }

  const [file] = args;

  const authorizerService = new AuthorizerService();
  const result = await authorizerService.startProcess(file);

  for (const line of result) {
    console.log(JSON.stringify(line));
  }
};

try {
  processFile();
} catch (error: any) {
  console.log(error.message);
}
