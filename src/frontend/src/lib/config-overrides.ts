/**
 * Configuration overrides for the application
 * This file will set default values for configuration that can be used
 * to enable features like Expert/Pro mode by default
 */

import { useConfigStore } from "@/stores"
import { useEffect } from "react"

/**
 * React hook to apply configuration overrides when the app starts
 */
export function useConfigOverrides() {
  const { proMode } = useConfigStore()
  
  // No automatic enabling - let the user toggle it
  useEffect(() => {
    // Just log the current state
    console.log("Expert mode is:", proMode ? "enabled" : "disabled")
  }, [proMode])
}

/**
 * Initialize config overrides non-reactively (for non-component contexts)
 */
export function initConfigOverrides() {
  // This can be used for non-React contexts if needed
} 