import fs from 'fs';
import readline from 'readline';

const processFile = () => {
  const args = process.argv.slice(2);
  if (!args || !args.length) {
    throw new Error('Invalid Input File!');
  }

  const file = args[0];
  if (!fs.existsSync(file)) {
    throw new Error('File Not Found!');
  }

  const readInterface = readline.createInterface(fs.createReadStream(file));

  readInterface.on('line', line => {
    console.log(line);
  });

  readInterface.on('close', () => {
    console.log('CLOSE READER...')
  });
};

try {
  processFile();
} catch (error: any) {
  console.log(error.message);
}
