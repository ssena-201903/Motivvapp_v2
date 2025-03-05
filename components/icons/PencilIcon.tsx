import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function PencilIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M43.3827 14.9225L10.3652 48.0138L7.625 53.3751L12.9851 50.6349L46.0776 17.6174L43.3827 14.9225ZM50.1213 8.18386L47.4263 10.8788L50.1213 13.575L52.8162 10.8788C53.1735 10.5214 53.3741 10.0367 53.3741 9.53134C53.3741 9.02599 53.1735 8.54132 52.8162 8.18386C52.4588 7.82664 51.9741 7.62598 51.4688 7.62598C50.9634 7.62598 50.4787 7.82664 50.1213 8.18386Z" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
