function hashSeed(s) {
    let h = 0
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
    return '0x' + Math.abs(h).toString(16).padStart(64, 'a').slice(0, 64)
}

function rng(seed) {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const ACTION_TYPES = ['YIELD_DEPOSIT', 'YIELD_WITHDRAW', 'FX_SWAP', 'PAYOUT']
const TOKENS = ['USDC', 'USDC', 'USDC→EURC', 'EURC']
const REASONS = {
    YIELD_DEPOSIT: [
        'Idle USDC exceeds 50k threshold, parking ${amt} in USYC for 4.5% APY',
        'No upcoming obligations for 48h, depositing ${amt} to maximize yield',
        'Surplus USDC detected after FX swap, moving ${amt} to USYC vault',
        'Treasury rebalance: allocating ${amt} to yield-bearing position',
    ],
    YIELD_WITHDRAW: [
        'Payment obligation due in 4h, withdrawing ${amt} from USYC',
        'Liquidity buffer below 25k, recalling ${amt} from yield position',
        'Upcoming EURC obligation requires USDC liquidity, withdrawing ${amt}',
    ],
    FX_SWAP: [
        'EURC obligation due in 4h, favorable rate 0.9220 detected — swapping ${amt}',
        'EUR/USD rate dipped below 0.92 threshold, acquiring EURC at discount',
        'Pre-funding EURC payroll obligation with ${amt} USDC at 0.9215',
        'Stork oracle signals rate reversal, executing defensive EURC acquisition',
    ],
    PAYOUT: [
        'Executing funded obligation: Vendor A Invoice #1234 — ${amt} EURC',
        'Auto-paying Cloud Services invoice — ${amt} USDC',
        'Payroll distribution triggered — ${amt} USDC to payroll contract',
        'Partner revenue-share payout — ${amt} EURC via Circle bridge',
    ],
}

function fmtAmt(v) {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function generateDecisions(count = 47) {
    const r = rng(42)
    const now = Date.now()
    const decisions = []
    for (let i = 0; i < count; i++) {
        const idx = i % 4
        const amount = Math.round(5000 + r() * 95000)
        const templates = REASONS[ACTION_TYPES[idx]]
        const reason = templates[i % templates.length].replace('${amt}', fmtAmt(amount))
        const ts = new Date(now - (24 * 3600000 * (count - i) / count))
        decisions.push({
            id: `dec_${String(i + 1).padStart(3, '0')}`,
            action: ACTION_TYPES[idx],
            reason,
            amount,
            token: TOKENS[idx],
            timestamp: ts.toISOString(),
            tx_hash: hashSeed(`dec_${i}`),
            confidence: +(0.72 + r() * 0.25).toFixed(2),
        })
    }
    return decisions
}

export function generateObligations() {
    const now = Date.now()
    const DAY = 86400000
    return [
        { id: 'obl_001', recipient: 'Vendor A - Invoice #1234', amount: 25000, currency: 'EURC', due_date: new Date(now + 2 * DAY).toISOString(), status: 'funded', funded_by: 'USYC withdrawal #dec_045' },
        { id: 'obl_002', recipient: 'Payroll - March 2026', amount: 85000, currency: 'USDC', due_date: new Date(now + 3 * DAY).toISOString(), status: 'pending', funded_by: null },
        { id: 'obl_003', recipient: 'Supplier B - Q1 Payment', amount: 12500, currency: 'EURC', due_date: new Date(now - 5 * DAY).toISOString(), status: 'paid', funded_by: 'FX swap #dec_032' },
        { id: 'obl_004', recipient: 'Cloud Services - AWS', amount: 4200, currency: 'USDC', due_date: new Date(now - 2 * DAY).toISOString(), status: 'paid', funded_by: 'Direct USDC #dec_039' },
        { id: 'obl_005', recipient: 'Legal Retainer - March', amount: 15000, currency: 'USDC', due_date: new Date(now + 5 * DAY).toISOString(), status: 'pending', funded_by: null },
        { id: 'obl_006', recipient: 'Partner Distribution', amount: 50000, currency: 'EURC', due_date: new Date(now - 1 * DAY).toISOString(), status: 'overdue', funded_by: null },
    ]
}

export function generateFxHistory(hours = 24) {
    const r = rng(99)
    const now = Date.now()
    const history = []
    let rate = 0.9238
    for (let h = hours; h > 0; h--) {
        rate += (r() - 0.55) * 0.003
        rate = Math.max(0.91, Math.min(0.935, rate))
        history.push({ timestamp: new Date(now - h * 3600000).toISOString(), rate: +rate.toFixed(4) })
    }
    return history
}

export function generateFxSwaps() {
    const r = rng(77)
    const now = Date.now()
    const swaps = []
    for (let i = 0; i < 5; i++) {
        swaps.push({
            timestamp: new Date(now - r() * 22 * 3600000).toISOString(),
            direction: 'USDC→EURC',
            amount: Math.round(5000 + r() * 25000),
            rate: +(0.918 + r() * 0.008).toFixed(4),
        })
    }
    return swaps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export function generateYieldHistory(days = 14) {
    const r = rng(55)
    const now = Date.now()
    const DAY = 86400000
    const history = []
    let total = 0
    const dailyBase = 1847.5 / days
    for (let d = 0; d < days; d++) {
        const daily = dailyBase * (0.7 + r() * 0.6)
        total += daily
        history.push({
            timestamp: new Date(now - (days - d) * DAY).toISOString(),
            cumulative_yield: d === 0 ? 0 : +total.toFixed(2),
        })
    }
    return history
}

export const MOCK = {
    balances: { usdc: 247500, eurc: 85200, usyc: 150000, total_usd: 482700 },
    agent: {
        status: 'active',
        last_decision_time: new Date(Date.now() - 12000).toISOString(),
        total_decisions: 47,
        cycle_interval: 30,
        strategy: { idle_threshold: 50000, yield_target_apy: 0.045, fx_sensitivity: 0.005, liquidity_buffer: 25000 },
    },
    decisions: generateDecisions(),
    obligations: generateObligations(),
    fx: (() => {
        const history = generateFxHistory()
        const current = history[history.length - 1]?.rate ?? 0.9215
        const first = history[0]?.rate ?? 0.9238
        const change = +(current - first).toFixed(4)
        return {
            current_rate: current,
            change_24h: change,
            change_pct: +((change / first) * 100).toFixed(2),
            forecast_direction: change < 0 ? 'down' : 'up',
            history,
            swaps: generateFxSwaps(),
        }
    })(),
    yield: {
        total_deposited: 150000,
        total_earned: 1847.5,
        current_apy: 0.045,
        days_active: 14,
        history: generateYieldHistory(),
    },
}
