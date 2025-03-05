import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function CloseIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M43.8438 43.8438L17.1562 17.1562M43.8438 17.1562L17.1562 43.8438" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
