import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg'

import { colors } from '@styles/theme'

const icons = {
  board: (
    <>
      <Rect x="5.5" y="5.5" width="13" height="13" />
      <Line x1="8.67" y1="8.79" x2="8.67" y2="15.21" />
      <Line x1="11.86" y1="8.79" x2="11.86" y2="12.4" />
      <Line x1="15.06" y1="8.79" x2="15.06" y2="14" />
    </>
  ),
  cancel: (
    <>
      <Line x1="7.4" y1="7.4" x2="16.6" y2="16.6" />
      <Line x1="7.4" y1="16.6" x2="16.6" y2="7.4" />
    </>
  ),
  home: (
    <>
      <Path d="M5.5,9.83l6.5-5.06,6.5,5.06v7.94c0,.8-.65,1.44-1.44,1.44H6.94c-.8,0-1.44-.65-1.44-1.44v-7.94Z" />
      <Path d="M9.83,19.22v-7.22h4.33v7.22" />
    </>
  ),
  collapse: (
    <>
      <Path d="M14.17,5.5h2.89c.8,0,1.44.65,1.44,1.44v10.11c0,.8-.65,1.44-1.44,1.44h-2.89" />
      <Path d="M9.11,8.39l-3.61,3.61,3.61,3.61" />
      <Path d="M5.5,11.99h8.67" />
    </>
  ),
  expand: (
    <>
      <Path d="M14.17,5.5h2.89c.8,0,1.44.65,1.44,1.44v10.11c0,.8-.65,1.44-1.44,1.44h-2.89" />
      <Path d="M10.56,15.61l3.61-3.61-3.61-3.61" />
      <Path d="M14.17,12.01H5.5" />
    </>
  ),
  menu: (
    <>
      <Line x1="6.36" y1="7.24" x2="17.36" y2="7.24" />
      <Line x1="6.36" y1="12" x2="17.36" y2="12" />
      <Line x1="6.36" y1="16.76" x2="17.36" y2="16.76" />
    </>
  ),
  plus: (
    <>
      <Line x1="12" y1="5.5" x2="12" y2="18.5" />
      <Line x1="5.5" y1="12" x2="18.5" y2="12" />
    </>
  ),
  delete: (
    <>
      <Path d="M6.15,8.1h11.7" />
      <Path d="M16.55,8.1v9.1c0,.65-.65,1.3-1.3,1.3h-6.5c-.65,0-1.3-.65-1.3-1.3v-9.1" />
      <Path d="M9.4,8.1v-1.3c0-.65.65-1.3,1.3-1.3h2.6c.65,0,1.3.65,1.3,1.3v1.3" />
      <Path d="M10.7,11.35v3.9" />
      <Path d="M13.3,11.35v3.9" />
    </>
  ),
  dropdownOpen: <Polyline points="7 9.5 12 14.5 17 9.5" />,
  check: <Polyline points="20 6 9 17 4 12" />,
  critical: (
    <>
      <Polyline points="18.5 18.64 12 12.5 5.5 18.64" />
      <Polyline points="18.5 11.5 12 5.36 5.5 11.5" />
    </>
  ),
  high: <Polyline points="18.5 15.07 12 8.93 5.5 15.07" />,
  medium: <Circle cx="12" cy="12" r="6" />,
  low: <Polyline points="5.5 8.93 12 15.07 18.5 8.93" />,
  custom: (
    <>
      <Path d="M10.74,11.16l4.83-4.88c.43-.45,1.06-.63,1.66-.47.6.16,1.06.63,1.22,1.23.16.6-.02,1.24-.46,1.68l-4.83,4.89" />
      <Path d="M8.79,13.61c-1.08,0-1.95.89-1.95,1.98,0,.87-1.62,1-1.3,1.32.7.72,1.62,1.32,2.6,1.32,1.43,0,2.6-1.18,2.6-2.65,0-.52-.2-1.03-.57-1.4-.37-.37-.86-.58-1.38-.58Z" />
    </>
  ),
}

export type IconName = keyof typeof icons

const fixedColors: Partial<Record<IconName, string>> = {
  critical: colors.priority.critical,
  high: colors.priority.high,
  low: colors.priority.low,
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 24, color = colors.text, strokeWidth = 1 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={fixedColors[name] ?? color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name]}
    </Svg>
  )
}
