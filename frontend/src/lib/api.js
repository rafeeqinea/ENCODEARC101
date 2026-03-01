const BASE = ''

async function get(path) {
    const res = await fetch(`${BASE}${path}`)
    if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
    return res.json()
}

async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API POST ${path} → ${res.status}`)
    return res.json()
}

export const api = {
    getBalances: () => get('/api/balances'),
    getAgent: () => get('/api/agent'),
    getDecisions: () => get('/api/decisions'),
    getObligations: () => get('/api/obligations'),
    createObligation: (data) => post('/api/obligations', data),
    getYield: () => get('/api/yield'),
    getFx: () => get('/api/fx'),
    triggerRun: () => post('/api/agent/run'),

    // StableFX
    getStableFxRate: () => get('/api/stablefx/rate'),
    getStableFxQuote: (from, to, amount) =>
        get(`/api/stablefx/quote?from_currency=${from}&to_currency=${to}&amount=${amount}`),
    createStableFxTrade: (quoteId, { amount, direction, rate } = {}) =>
        post('/api/stablefx/trade', { quoteId, amount, direction, rate }),

    // Wallet
    getWallet: () => get('/api/wallet'),
    getStatus: () => get('/api/agent'),
    getHealth: () => get('/api/health'),

    // Transactions & Receipts
    getTransactions: () => get('/api/transactions'),
    getReceipt: (id) => get(`/api/receipts/${id}`),
    getReceiptText: (id) => get(`/api/receipts/${id}/text`),

    // Bridge (CCTP)
    getBridgeRoutes: () => get('/api/bridge/routes'),
    getBridgeTransfers: () => get('/api/bridge/transfers'),
    getBridgeTransfer: (id) => get(`/api/bridge/transfer/${id}`),
    initiateBridgeTransfer: (data) => post('/api/bridge/transfer', data),

    // Settings
    getSettings: () => get('/api/settings'),
    updateSettings: (data) => fetch(`/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(r => r.json()),

    // Collateral
    getCollateral: () => get('/api/collateral'),

    // ML Forecast & Risk
    getForecast: () => get('/api/forecast'),
    getRisk: () => get('/api/risk'),

    // Chat
    chat: (message) => post('/api/chat', { message }),
}
