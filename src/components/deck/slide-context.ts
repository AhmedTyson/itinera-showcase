import { createContext, useContext } from "react"

export type SlideActiveValue = { isActive: boolean } | null

export const SlideActiveContext = createContext<SlideActiveValue>(null)

/**
 * Per-slide seam (D3/D15). Returns:
 *  - boolean  → deck mode; consumer keys its showpiece off this value
 *  - null     → deck OFF ⇒ component must run its legacy IO/once path unchanged
 */
export function useSlideActive(): SlideActiveValue {
  return useContext(SlideActiveContext)
}
