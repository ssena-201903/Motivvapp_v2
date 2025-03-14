import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function SearchIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.0681 8.125C24.1237 8.125 20.2679 9.29464 16.9883 11.486C13.7087 13.6774 11.1525 16.7921 9.64308 20.4362C8.13364 24.0803 7.7387 28.0902 8.50821 31.9588C9.27772 35.8273 11.1771 39.3809 13.9662 42.1699C16.7553 44.959 20.3088 46.8584 24.1774 47.6279C28.046 48.3974 32.0558 48.0025 35.7 46.4931C39.3441 44.9836 42.4588 42.4275 44.6501 39.1478C46.8415 35.8682 48.0111 32.0124 48.0111 28.0681C48.0108 22.7789 45.9096 17.7065 42.1696 13.9666C38.4296 10.2266 33.3572 8.12534 28.0681 8.125Z" stroke="${color}" stroke-width="3" stroke-miterlimit="10"/>
<path d="M42.9473 42.9473L56.8753 56.8753" stroke="${color}" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
</svg>

    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
