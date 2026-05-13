// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — asyncHandler
//
// Wraps any async Express route handler so that rejected promises are
// automatically forwarded to the global errorHandler — no try/catch needed
// in every controller.
//
// Usage:
//   router.get('/route', asyncHandler(async (req, res) => {
//     const data = await someAsyncCall()
//     sendSuccess(res, { data })
//   }))
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {(req, res, next) => Promise<any>} fn - async route handler
 * @returns Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export default asyncHandler
