import { ethers } from "ethers";
export const parseEther = (valueToConvert) => {
  return ethers.parseEther(valueToConvert);
};
export const shortenAddress = (address) =>
  `${address.slice(0, 4)}...${address.slice(address.length - 4)}`;
