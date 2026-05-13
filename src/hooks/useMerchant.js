// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — useMerchant hook
// Phase 1: Returns mock merchant profile & metrics.
// Phase 2: Replace with API/contract data via useQuery + useReadContract
// ─────────────────────────────────────────────────────────────────────────────
import { MOCK_MERCHANT, MOCK_METRICS } from '@config/mockData'

export function useMerchant() {
  return {
    merchant:  MOCK_MERCHANT,
    metrics:   MOCK_METRICS,
    isLoading: false,
    isError:   false,
  }
}
