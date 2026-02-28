export function formatCurrency(value, decimals = 2) {
    if (value == null) return '$0.00'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value)
}

export function formatNumber(value, decimals = 2) {
    if (value == null) return '0'
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value)
}

export function formatRate(value) {
    if (value == null) return '0.0000'
    return Number(value).toFixed(4)
}

export function formatPercent(value) {
    if (value == null) return '0.00%'
    const num = Number(value)
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}

export function formatApy(value) {
    if (value == null) return '0.0%'
    return `${(Number(value) * 100).toFixed(1)}%`
}

export function formatTimestamp(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diff = (now - d) / 1000

    if (diff < 60) return `${Math.floor(diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function truncateHash(hash) {
    if (!hash) return '—'
    return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}
