import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther } from "../utils/CommonUtils";
export const TransactionContext = React.createContext();
const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [formData, setformData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [currentAccount, setAccurentAccount] = useState();
  const [isLoading, setLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount") || 0
  );
  const [transactions, setTransactions] = useState([]);
  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
  const checkWhetherWalletConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setAccurentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No account connected.");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccurentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };
  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      // Send a transaction
      console.log(parseEther(amount));
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 2100 WEI
            value: parseEther(amount).toString(),
          },
        ],
      });
      console.log("Comfirmed!");
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parseEther(amount),
        message,
        keyword
      );
      setLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setLoading(false);
      console.log(`${transactionHash.hash} succeeded`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");
      const transactionContract = getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();
      console.log(availableTransactions);
      const structuredTransactions = availableTransactions.map(
        (transaction) => {
          console.log(transaction);
          return {
            addressFrom: transaction.sender,
            addressTo: transaction.receiver,
            timestamp: new Date(
              parseInt(transaction.timestamp) * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount) / 10 ** 18,
          };
        }
      );
      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };
  const checkWheterTransactionsExist = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCounts();
      localStorage.setItem("transactionCount", transactionCount);
      setTransactionCount(transactionCount);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkWhetherWalletConnected();
    checkWheterTransactionsExist();
  }, [currentAccount]);
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
        transactions,
        transactionCount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
