import useMediaQuery from './useMediaQuery'

export default function useIsMobile(breakpoint = 768) {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`)
}
