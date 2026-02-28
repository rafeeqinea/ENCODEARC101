import { useMemo, useCallback } from 'react'
import { api } from '../lib/api'
import { useApi } from './useApi'
import { MOCK } from '../data/mockData'

export function useTreasury() {
    const balances = useApi(api.getBalances, { interval: 15000, fallback: MOCK.balances })
    const agent = useApi(api.getAgent, { interval: 15000, fallback: MOCK.agent })
    const decisions = useApi(api.getDecisions, { interval: 10000, fallback: MOCK.decisions })
    const obligations = useApi(api.getObligations, { interval: 15000, fallback: MOCK.obligations })
    const yieldData = useApi(api.getYield, { interval: 30000, fallback: MOCK.yield })
    const fxData = useApi(api.getFx, { interval: 10000, fallback: MOCK.fx })

    const isDemo = useMemo(
        () => balances.isDemo || agent.isDemo,
        [balances.isDemo, agent.isDemo]
    )

    const triggerRun = useCallback(async () => {
        try {
            await api.triggerRun()
            decisions.refresh()
            balances.refresh()
        } catch { /* ignore in demo */ }
    }, [decisions, balances])

    return { balances, agent, decisions, obligations, yieldData, fxData, isDemo, triggerRun }
}
