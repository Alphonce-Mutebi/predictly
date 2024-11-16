import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PredictlyModule = buildModule("PredictlyModule", (m) => {
  // Set up parameters if you want to make the contract address configurable

  const paymentTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const pythOracleAddress = "0x74f09cb3c7e2A01865f424FD14F6dc9A14E3e94E";

  const;
  const initialOwner = m.getParameter(
    "initialOwner",
    "0x1724707c52de2fa65ad9c586b5d38507f52D3c06"
  );

  // Deploy the MiniPay contract with the specified parameters
  const miniPayNFT = m.contract("MiniPay", [initialOwner]);

  return { miniPayNFT };
});

export default MiniPayModule;
