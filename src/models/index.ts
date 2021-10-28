type Account = {
  "active-card": boolean,
  "available-limit": number,
};

type Transaction = {
  "merchant": string,
  "amount": number,
  "time": Date,
};

type LineData = {
  account?: Account,
  transaction?: Transaction,
};

type LineResult = {
  account: Account | {},
  violations: string[],
}

export { Account, LineData, LineResult, Transaction };
