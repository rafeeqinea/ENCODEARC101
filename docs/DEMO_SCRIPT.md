# ArcTreasury — Demo Voiceover Script

**Total Duration: ~4–5 minutes**
**Recording: Screen capture with AI voiceover (ElevenLabs)**

---

## SCENE 1: Landing Page (0:00 – 0:30)

**[Screen: Cinematic intro splash with ArcTreasury logo and rotating rings]**

> "Yo what's up — I'm Rafeeq, and this is ArcTreasury. So the whole idea is pretty simple — what if your company's treasury could just manage itself? No one sitting there watching FX rates, moving money around manually. An AI agent handles everything, on-chain, fully autonomous."

**[ACTION: Click "Enter the Vault" → transitions to wallet connect → click Connect → dashboard loads]**

---

## SCENE 2: Dashboard (0:30 – 1:20)

**[Screen: Dashboard with balances, pie chart, risk score, yield chart]**

> "Alright so this is the main dashboard. Everything you see here is live — these are real on-chain balances from Arc Testnet. We've got USDC, EURC, and USYC which is Hashnote's tokenized T-Bill."
>
> "The pie chart shows how the treasury is split across these assets. Risk score on the right is calculated using Value at Risk modeling. And this yield chart down here tracks how much we're earning from parking idle capital in USYC — running at about 4.5% APY right now."
>
> "These decisions at the bottom — all made by the AI agent automatically. Let me click one real quick."

**[ACTION: Click a decision → modal opens with snapshot, reasoning, confidence, tx hash]**

> "So every decision comes with the full picture — what the agent saw, why it made that call, how confident it was, and the actual transaction hash you can verify on ArcScan. Full transparency, nothing hidden."

---

## SCENE 3: Agent Page (1:20 – 1:55)

**[Screen: Agent page with decision feed]**

> "This is the Agent page — you can see every decision the AI has made. And we can also trigger a cycle manually, so let me do that."

**[ACTION: Click "Run Cycle" → watch analyzing → executing → complete]**

> "So what just happened is — the agent pulled live FX rates from Stork Oracle, checked if any obligations are due, ran the ML forecaster, assessed risk, and then made a decision. All in a few seconds. And that decision got executed on-chain with a real transaction."
>
> "You can see the strategy parameters here too — risk tolerance, rebalance thresholds, trade sizes. All of this is configurable from Settings."

---

## SCENE 4: FX Monitor (1:55 – 2:40)

**[Screen: FX Monitor with live rate chart]**

> "This is the FX Monitor — powered by Circle StableFX. We're tracking the live USDC to EURC rate using Stork Oracle price feeds. You can see the rate history, the 24-hour change, all live."
>
> "Let me get a quote — say 10,000 USDC to EURC."

**[ACTION: Type 10000 → Click "Get Quote" → rate appears → Click "Execute Trade"]**

> "And there it is — trade executed. You can see the exact rate, the StableFX fee, net amount, gas cost, and the on-chain tx hash. This actually called the swapFX function on our smart contract — real tokens moved, real gas was paid."
>
> "Down here is the AI forecast — the agent uses linear regression on the oracle data to predict where the rate is heading. It tells you whether to swap now or wait."

---

## SCENE 5: Yield (2:40 – 3:05)

**[Screen: Yield page with deposit history and chart]**

> "Yield page — so when the agent sees idle USDC sitting in the treasury, it automatically deposits it into Hashnote's USYC vault. That's basically tokenized US Treasury Bills, earning yield on-chain."
>
> "You can see the cumulative yield curve growing, and every deposit and withdrawal is linked back to a specific AI decision. So if the agent needs liquidity for a payout, it pulls from here automatically."

---

## SCENE 6: Obligations (3:05 – 3:25)

**[Screen: Obligations page with upcoming payments]**

> "Obligations page — this is where corporate payments live. Each one has a recipient, amount, currency, and due date. The agent keeps an eye on all of these."
>
> "When something's coming due, it figures out how to fund it — might need to withdraw from yield, swap currencies, whatever. And then it executes the payout on-chain. Fully automated."

**[ACTION: Show the obligation list, maybe click "Add Obligation"]**

---

## SCENE 7: Cross-Chain Bridge (3:25 – 3:50)

**[Screen: Cross-chain bridge page]**

> "We also integrated Circle's CCTP V2 for cross-chain transfers. So you can bridge USDC between Arc, Ethereum Sepolia, Base, and Arbitrum."

**[ACTION: Show the bridge interface, maybe initiate a transfer]**

> "The flow is — USDC gets burned on Arc, Circle attests it, and then fresh USDC gets minted on the destination chain. No wrapped tokens, no sketchy liquidity pools. Native USDC on both sides."

---

## SCENE 8: Smart Contracts (3:50 – 4:10)

**[Screen: Contracts page with deployed contracts and functions]**

> "All the smart contracts are deployed and verified on Arc Testnet. The main one is ArcTreasury — handles escrow, vesting, batch payouts, yield management. It's got ReentrancyGuard, Pausable, role-based access — all the security stuff from OpenZeppelin."

**[ACTION: Scroll through functions, maybe expand one to show security modifiers]**

> "Every function you see here — these are real contract calls the agent makes. Agent-only access, non-reentrant, pausable."

---

## SCENE 9: Architecture (4:10 – 4:30)

**[Screen: Architecture page with integration diagram]**

> "And this is how everything connects. The agent runs a Watch-Think-Act loop — watches oracle feeds and market data, thinks using the local LLM and ML forecaster, and acts by executing on-chain transactions."
>
> "All these green dots are live health checks by the way — not hardcoded. If something goes down, it shows red. Right now everything's healthy."

---

## SCENE 10: Closing (4:30 – 4:45)

**[Screen: Back to dashboard or landing page]**

> "So yeah — that's ArcTreasury. An AI agent that actually manages your treasury on-chain. Real stablecoins, real yield, real FX rates, real transactions. Everything autonomous, everything transparent. Built solo for the Encode x Arc hackathon. Appreciate you watching — cheers."

---

## Screen Recording Tips

1. **Start on the cinematic landing page** — let the intro animation play
2. **Use dark mode** — the app is designed for it
3. **Run one agent cycle live** — shows real on-chain tx
4. **Execute one FX trade live** — shows Circle StableFX working
5. **Move between pages slowly** — let the animations breathe
6. **Click a decision card** — show the full audit modal
7. **End on Architecture or dashboard** — strong visual finish

## ElevenLabs Voice Settings
- Voice: Custom designed — young male, Hyderabadi accent with British influence
- Speed: Natural pace, slightly fast
- Stability: ~40-50%
- Clarity: ~70%
- Pauses: 1-second gap between scenes
