# ArcTreasury — Demo Voiceover Script

**Total Duration: ~4–5 minutes**
**Recording: Screen capture with AI voiceover**

---

## SCENE 1: Landing Page (0:00 – 0:30)

> "Meet ArcTreasury — an autonomous AI-powered treasury management agent built on the Arc blockchain."
>
> "Instead of a human treasurer manually managing stablecoins, hedging FX risk, and scheduling payouts — ArcTreasury does it all autonomously, every 30 seconds, directly on-chain."
>
> "Let's connect our wallet to Arc Testnet and see it in action."

**[ACTION: Click "Connect Arc Wallet" → MetaMask pops up → connected → auto-navigate to dashboard]**

---

## SCENE 2: Dashboard (0:30 – 1:15)

> "Here's the main dashboard. The agent is managing a multi-asset treasury across USDC, EURC, and USYC — Hashnote's tokenized T-Bill."
>
> "The pie chart shows real-time asset allocation. Risk score is calculated using VaR modeling. And this yield chart tracks cumulative earnings from the USYC deposit strategy — currently running at around 4.5% APY."
>
> "These recent decisions were all made autonomously by the AI agent. Let me click one to see its reasoning."

**[ACTION: Click a decision → modal opens showing snapshot, reasoning, confidence score, and tx hash]**

> "Every decision comes with a full audit trail — the market data the agent saw, what it considered, its confidence level, and the resulting on-chain transaction hash verified on ArcScan."

---

## SCENE 3: Agent Page (1:15 – 1:50)

> "On the Agent page, we can see the full decision feed and even trigger a manual cycle."

**[ACTION: Click "Run Cycle" button → watch analyzing → executing → complete]**

> "The agent just analyzed current market conditions, checked for due obligations, evaluated yield opportunities, and decided the best action — all in a few seconds."
>
> "Notice the strategy parameters here — risk tolerance, rebalance thresholds, max trade sizes. These are all configurable through the Settings page."

---

## SCENE 4: StableFX / FX Monitor (1:50 – 2:30)

> "This is the FX Monitor, powered by Circle's StableFX integration. We're tracking the live USDC-to-EURC rate with data from the Stork oracle."
>
> "Let's get a live quote. We'll swap 10,000 USDC to EURC."

**[ACTION: Enter 10000 → Click "Get Quote" → see rate, fee, you receive → Click "Execute Trade"]**

> "The trade executed through Circle StableFX with a real on-chain transaction. You can see the fee breakdown, net amount received, and the receipt ID."
>
> "Below is the AI rate forecast. The agent uses linear regression on historical oracle data to predict where the rate is heading — and recommends whether to swap now, wait, or hold."

---

## SCENE 5: Yield (2:30 – 2:55)

> "On the Yield page, we track deposits into Hashnote's USYC — a tokenized US Treasury Bill. The agent automatically parks idle USDC here to earn yield, and withdraws when it needs liquidity for payouts."
>
> "You can see the cumulative yield curve growing over time, and every deposit or withdrawal is linked to a specific agent decision."

---

## SCENE 6: Obligations / Payouts (2:55 – 3:15)

> "The Obligations page handles scheduled corporate payments. Each obligation has a recipient, amount, currency, and due date."
>
> "The agent monitors these continuously. When an obligation is coming due, it automatically funds it — withdrawing from yield if needed, swapping currencies, and executing the payout on-chain."

**[ACTION: Click "Add Obligation" → show the modal]**

---

## SCENE 7: Cross-Chain Bridge (3:15 – 3:40)

> "ArcTreasury integrates Circle's CCTP V2 protocol for cross-chain USDC transfers. We support bridging between Arc Testnet, Ethereum Sepolia, Base, and Arbitrum."
>
> "Each chain's health is monitored in real-time. Let's bridge 1,000 USDC to Ethereum Sepolia."

**[ACTION: Click "Bridge USDC" → show the transfer with burn → attestation → mint steps]**

> "The CCTP flow burns USDC on Arc, waits for Circle's attestation, then mints fresh USDC on the destination chain. No wrapped tokens, no liquidity pools."

---

## SCENE 8: Smart Contracts (3:40 – 4:00)

> "All four smart contracts are deployed and verified on Arc Testnet. The main ArcTreasury vault handles escrow, vesting, batch payouts, and yield management — protected by OpenZeppelin's ReentrancyGuard, Pausable, and role-based access control."

**[ACTION: Scroll through contract functions, click one to expand security modifiers]**

---

## SCENE 9: Architecture (4:00 – 4:20)

> "The architecture page shows how everything connects. At the center is the AI agent running a Watch-Think-Act loop. It reads from oracle feeds, consults the ML model, and writes transactions through the smart contracts."
>
> "Everything is live — you can see the data flowing between components in real-time."

---

## SCENE 10: Closing (4:20 – 4:35)

> "ArcTreasury demonstrates what autonomous finance looks like — an AI agent managing real stablecoins, real yield, real FX rates, and real payouts, all settled on Arc's sub-second finality blockchain."
>
> "Built for the Encode x Arc Enterprise and DeFi Hackathon. Thanks for watching."

---

## Screen Recording Tips

1. **Use dark mode** — the app is designed for it
2. **Start on Landing page** — fresh state, no wallet connected
3. **Run one agent cycle live** — shows real on-chain tx appearing on ArcScan
4. **Execute one FX trade live** — shows Circle StableFX integration
5. **Bridge one transfer** — shows CCTP V2 flow
6. **Move slowly between pages** — let animations play out
7. **Hover over decision cards** — shows the detail modals
8. **End on Architecture page** — strong visual finish

## AI Voice Settings
- Tone: Professional, confident, not robotic
- Speed: Moderate (1.0x)
- Pauses: 1-second pause between scenes
- Recommended: ElevenLabs or Google Cloud TTS
