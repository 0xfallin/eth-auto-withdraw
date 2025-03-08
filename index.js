const { ethers } = require("ethers");

// RPC Provider (use Infura, Alchemy, or another service)
const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/f77e7cb6323141bd9887ed16c1dba935");

// Private keys of wallets to sweep
const privateKeys = [
    "0000000000000000000000000000000000000000000000000000000000000001",
    "0000000000000000000000000000000000000000000000000000000000000002",
    "0000000000000000000000000000000000000000000000000000000000000003",
    "0000000000000000000000000000000000000000000000000000000000000004",
    "0000000000000000000000000000000000000000000000000000000000000005",
];

// Destination wallet for all funds
const destinationAddress = "0x1F77f872Ee3040FF371A3aC3296199085Bfa93eE";

// Minimum ETH balance to sweep (set low for small amounts)
const minBalanceEth = "0.000001"; // 0.0001 ETH

async function sweepSmallBalances() {
    for (const privateKey of privateKeys) {
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            const balance = await provider.getBalance(wallet.address);

            if (balance.gt(ethers.parseEther(minBalanceEth))) {
                console.log(`Sweeping ${ethers.formatEther(balance)} ETH from ${wallet.address}...`);

                const gasPrice = await provider.getFeeData();
                const gasLimit = 21000; // Standard ETH transfer
                const gasCost = gasPrice.maxFeePerGas * BigInt(gasLimit);

                // Ensure there is enough ETH to cover gas fees
                if (balance > gasCost) {
                    const amountToSend = balance - gasCost;

                    const tx = {
                        to: destinationAddress,
                        value: amountToSend,
                        gasLimit: gasLimit,
                        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
                        maxFeePerGas: gasPrice.maxFeePerGas,
                    };

                    const txResponse = await wallet.sendTransaction(tx);
                    console.log(`Transaction sent! Hash: ${txResponse.hash}`);
                    await txResponse.wait();
                    console.log("Transaction confirmed!");
                } else {
                    console.log(`Skipping ${wallet.address}, balance too low to cover gas.`);
                }
            } else {
                console.log(`Skipping ${wallet.address}, balance below minimum (${minBalanceEth} ETH).`);
            }
        } catch (error) {
            console.error(`Error sweeping wallet: ${error.message}`);
        }
    }
}

// Run the sweeper
sweepSmallBalances();
