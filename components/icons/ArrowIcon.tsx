import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  variant?: "right" | "left" | "up" | "down";
};

export default function ArrowIcon({ size, color, variant }: Props) {
  let svgIcon;
  if (variant === "right") {
    svgIcon = `
        <svg width="21" height="39" viewBox="0 0 21 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.92188 2.34375L19.0781 19.5L1.92188 36.6562" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `;
  } else if (variant === "left") {
    svgIcon = `
        <svg width="45" height="42" viewBox="0 0 45 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.9231 40L2 21L20.9231 2M4.62821 21H43" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `;
  } else if (variant === "down") {

  } else if (variant === "up") {

  }

  return <SvgXml xml={svgIcon} width={size} height={size} />;
}
