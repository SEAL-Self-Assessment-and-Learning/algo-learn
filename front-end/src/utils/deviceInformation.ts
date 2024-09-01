import { useEffect, useState } from "react"

/** Device breakpoints for responsive design for tailwind css */
const deviceBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

/**
 * This function checks if the device is smaller than the preferred breakpoint.
 *
 * @returns hasSpecificDeviceSize - if the device is smaller than or equal to the preferred breakpoint
 */
export function hasSpecificDeviceSize(breakpoint: keyof typeof deviceBreakpoints): boolean {
  const [isSmallDevice, setIsSmallDevice] = useState(window.innerWidth <= deviceBreakpoints[breakpoint])

  useEffect(() => {
    const handleResize = () => {
      setIsSmallDevice(window.innerWidth <= deviceBreakpoints[breakpoint])
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isSmallDevice
}
