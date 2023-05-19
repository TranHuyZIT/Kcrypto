import { ethers } from "ethers";
export const parseEther = (valueToConvert) => {
  return ethers.parseEther(valueToConvert);
};
