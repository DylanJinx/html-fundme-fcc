import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;

const fundButton = document.getElementById("fundButton");
fundButton.onclick = fund;

const balanceButton = document.getElementById("balanceButton");
balanceButton.onclick = getBalance;

const withdrawButton = document.getElementById("withdrawButton");
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        // 如果window.ethereum的类型不是undefined
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            connectButton.innerHTML = "Connected!";

            // 打印provider \ signer \ contract
            // const provider = new ethers.providers.Web3Provider(window.ethereum);
            // const signer = await provider.getSigner();
            // console.log("provider:", provider);
            // console.log("signer:", signer);
            // console.log("signer address:", signer.address);
            // console.log("signer getAddress()", signer.getAddress());
            // const contract = new ethers.Contract(contractAddress, abi, signer);
            // console.log("contract:", contract);
        } catch (error) {
            console.log(error);
            connectButton.innerHTML = "Not Connect!";
        }
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        console.log(accounts);
    } else {
        connectButton.innerHTML = "please install metamask";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

// fund function
// 参数ethAmount：需要用一定数额的以太币来进行资助
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount} ETH...`);

    if (typeof window.ethereum !== "undefined") {
        // 发送一笔交易需要：
        // 1.provider(或者说连接到区块链)
        // 2.signer / wallet / 一个可以支付gas的人
        // 3.能够与之交互的合约：ABI、address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            // 监听这个交易完成
            await listenForTransacionMine(transactionResponse, provider);
            console.log("Transaction complete!");
        } catch (error) {
            console.log(error);
        }
    } else {
        document.getElementById("fundButton").innerHTML =
            "don't use function: fund()";
    }
}

function listenForTransacionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash} ...`);
    // 返回Promise的原因：需要创建一个用于区块链的监听器
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`,
            );
            resolve();
        });
    });
}

// withdraw
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing ...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.withdraw();
            // 监听这个交易完成
            await listenForTransacionMine(transactionResponse, provider);
            console.log("withdrew complete!");
        } catch (error) {
            console.log(error.message);
        }
    } else {
        document.getElementById("withdrawButton").innerHTML =
            "don't use function: withdraw()";
    }
}
