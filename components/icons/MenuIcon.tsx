import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function MenuIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.4844 18.1094H50.5156M10.4844 30.5H50.5156M10.4844 42.8906H50.5156" stroke="${color}" stroke-width="5" stroke-miterlimit="10" stroke-linecap="round"/>
</svg>
    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
