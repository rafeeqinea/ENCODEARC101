import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '../lib/formatters'

export default function ObligationRow({ obligation, onClick }) {
    return (
        <tr
            className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
            onClick={() => onClick?.(obligation)}
        >
            <td className="py-3 px-4 text-sm text-[var(--color-text-primary)] font-medium">{obligation.recipient}</td>
            <td className="py-3 px-4 font-mono text-sm text-[var(--color-text-primary)]">{formatCurrency(obligation.amount)}</td>
            <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{obligation.currency}</td>
            <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{formatDate(obligation.due_date)}</td>
            <td className="py-3 px-4"><StatusBadge status={obligation.status} /></td>
            <td className="py-3 px-4 text-xs text-[var(--color-text-muted)] font-mono">{obligation.funded_by || '—'}</td>
        </tr>
    )
}
