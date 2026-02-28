import { useState } from 'react'
import { ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate, formatTimestamp } from '../lib/formatters'
import { useNavigate } from 'react-router-dom'

export default function ObligationRow({ obligation }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const navigate = useNavigate()

    return (
        <>
            <tr
                className={`border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer ${isExpanded ? 'bg-[var(--color-bg-secondary)]' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td className="py-3 px-4 text-sm text-[var(--color-text-primary)] font-medium">
                    <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
                        {obligation.recipient}
                    </div>
                </td>
                <td className="py-3 px-4 font-mono text-sm text-[var(--color-text-primary)]">{formatCurrency(obligation.amount)}</td>
                <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{obligation.currency}</td>
                <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{formatDate(obligation.due_date)}</td>
                <td className="py-3 px-4 relative">
                    {/* Add key here so framer motion can animate the status badge changing */}
                    <motion.div key={obligation.status} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <StatusBadge status={obligation.status} />
                    </motion.div>
                </td>
                <td className="py-3 px-4 text-xs text-[var(--color-text-muted)] font-mono">
                    {obligation.funded_by?.includes('Decision') ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate('/agent'); }}
                            className="text-[var(--color-accent)] hover:underline flex items-center gap-1"
                        >
                            <LinkIcon className="w-3 h-3" /> {obligation.funded_by}
                        </button>
                    ) : (
                        obligation.funded_by || '—'
                    )}
                </td>
            </tr>
            <AnimatePresence>
                {isExpanded && (
                    <tr className="bg-[var(--color-bg-secondary)]/50">
                        <td colSpan={6} className="p-0 border-b border-[var(--color-border)]">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 border-l-2 border-[var(--color-accent)] ml-6 my-2">
                                    <h4 className="text-xs font-semibold text-[var(--color-text-muted)] tracking-widest uppercase mb-4">Funding Timeline</h4>
                                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-border)] before:to-transparent">

                                        {/* Dynamic Timeline Events (if available from backend) */}
                                        {obligation.timeline?.map((event, idx) => (
                                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-[var(--color-bg-secondary)] group-[.is-active]:bg-[var(--color-accent)] text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] card-flat p-3 rounded border border-[var(--color-border-light)] shadow">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <time className="text-xs font-mono text-[var(--color-text-muted)]">
                                                            {formatTimestamp(event.time || event.timestamp)}
                                                        </time>
                                                        <StatusBadge status={event.status || 'info'} />
                                                    </div>
                                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                                        {event.event || event.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Fallback if no timeline array */}
                                        {!obligation.timeline && (
                                            <>
                                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-[var(--color-accent)] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                                                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] card-flat p-3 rounded border border-[var(--color-border-light)] shadow">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <time className="text-xs font-mono text-[var(--color-text-muted)]">
                                                                {formatTimestamp(obligation.created_at || new Date().toISOString())}
                                                            </time>
                                                            <span className="text-[0.65rem] font-bold text-[var(--color-warning)]">PENDING</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--color-text-secondary)]">Obligation created manually</p>
                                                    </div>
                                                </div>
                                                {obligation.status === 'funded' && (
                                                    <div className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group is-active">
                                                        <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-[var(--color-success)] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] card-flat p-3 rounded border border-[var(--color-border-light)] shadow">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <time className="text-xs font-mono text-[var(--color-text-muted)]">Just now</time>
                                                                <span className="text-[0.65rem] font-bold text-[var(--color-success)]">FUNDED</span>
                                                            </div>
                                                            <p className="text-xs text-[var(--color-text-secondary)]">{obligation.funded_by || 'Auto-funded by Agent'}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {/* Scheduled Future Event */}
                                        {obligation.status !== 'paid' && (
                                            <div className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group opacity-50">
                                                <div className="flex items-center justify-center w-3 h-3 rounded-full border border-[var(--color-border)] bg-transparent shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] card-flat border-dashed p-3 rounded border-[var(--color-border)] shadow flex">
                                                    <p className="text-xs font-mono text-[var(--color-text-muted)] mt-0.5">{formatDate(obligation.due_date)}</p>
                                                    <p className="text-xs text-[var(--color-text-secondary)] ml-3">Scheduled for auto-payment</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </>
    )
}
