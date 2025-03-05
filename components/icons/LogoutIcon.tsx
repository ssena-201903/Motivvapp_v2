import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function LogoutIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.2188 40.0312V44.7969C36.2188 46.0608 35.7167 47.273 34.8229 48.1667C33.9292 49.0604 32.717 49.5625 31.4531 49.5625H12.3906C11.1267 49.5625 9.91455 49.0604 9.02082 48.1667C8.12709 47.273 7.625 46.0608 7.625 44.7969V16.2031C7.625 14.9392 8.12709 13.727 9.02082 12.8333C9.91455 11.9396 11.1267 11.4375 12.3906 11.4375H30.5C33.1318 11.4375 36.2188 13.5713 36.2188 16.2031V20.9688M43.8438 40.0312L53.375 30.5L43.8438 20.9688M20.9688 30.5H51.4688" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

`;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
