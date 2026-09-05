import "dotenv/config";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` LandSetu Authoritative Backend API Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Health:     http://localhost:${PORT}/health`);
  console.log(` AI Agent:   ${process.env.AI_SERVICE_URL || "https://sih-proto.onrender.com"}`);
  console.log(`=======================================================`);
});
