import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PredictlyModule = buildModule("PredictlyModule", (m) => {
  // Set up parameters if you want to make the contract address configurable

  const cUsdTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const pythOracleAddress = "0x74f09cb3c7e2A01865f424FD14F6dc9A14E3e94E";

  const paymentToken = m.getParameter("_token", cUsdTokenAddress);
  const pythOracle = m.getParameter("_priceOracle", pythOracleAddress);

  // Deploy the Prediclty contract with the specified parameters
  const predictly = m.contract("Predictly", [paymentToken, pythOracle]);

  return { predictly };
});

export default PredictlyModule;
