const Web3 = require('web3');
const readlineSync = require('readline-sync');
const colors = require('colors');

// اتصال به شبکه اتریوم (تستی یا اصلی)
const web3 = new Web3('https://rinkeby.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // شبکه Rinkeby به عنوان مثال

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendToken = async (fromAddress, toAddress, amount, privateKey) => {
  const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
  const transaction = {
    'to': toAddress,
    'value': 0, // برای ارسال توکن، مقدار اتر صفر است
    'gas': 2000000,
    'nonce': nonce,
    'data': web3.eth.abi.encodeFunctionCall({
      name: 'transfer',
      type: 'function',
      inputs: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' }
      ]
    }, [toAddress, web3.utils.toHex(amount)])
  };

  const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  return receipt;
};

(async () => {
  const privateKey = readlineSync.question('Enter the private key of the sender wallet: ');
  const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
  const toAddress = readlineSync.question('Enter the address of the receiver wallet: ');
  const tokenContractAddress = readlineSync.question('Enter the token contract address: ');
  const sendAmount = parseFloat(readlineSync.question('Enter the amount of tokens to send: '));
  const sendCount = parseInt(readlineSync.question('Enter the number of times to send tokens: '), 10);
  const delayBetweenTx = parseInt(readlineSync.question('Enter the delay between transactions in milliseconds: '), 10);

  for (let i = 0; i < sendCount; i++) {
    try {
      const receipt = await sendToken(fromAddress, toAddress, sendAmount, privateKey);
      console.log(colors.green(`Successfully sent ${sendAmount} tokens to ${toAddress} (${i + 1}/${sendCount})`));
      console.log('Transaction Hash:', receipt.transactionHash);
    } catch (error) {
      console.error(colors.red(`Failed to send tokens to ${toAddress}:`), error);
    }
    await delay(delayBetweenTx);
  }
})();
