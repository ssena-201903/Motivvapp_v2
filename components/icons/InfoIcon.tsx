import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  variant?: "fill" | "outlined";
};

export default function StarIcon({ size, color, variant }: Props) {
  let svgIcon;
  if (variant === "fill") {
    svgIcon = `
        <svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M41.1719 10.625C24.303 10.625 10.625 24.303 10.625 41.1719C10.625 58.0407 24.303 71.7188 41.1719 71.7188C58.0407 71.7188 71.7188 58.0407 71.7188 41.1719C71.7188 24.303 58.0407 10.625 41.1719 10.625Z" stroke="${color}" stroke-width="3" stroke-miterlimit="10"/>
<path d="M36.5234 36.5234H41.8359V55.7812" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M34.5312 56.4453H49.1406" stroke="${color}" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
<path d="M40 22C39.4067 22 38.8266 22.1759 38.3333 22.5056C37.8399 22.8352 37.4554 23.3038 37.2284 23.8519C37.0013 24.4001 36.9419 25.0033 37.0576 25.5853C37.1734 26.1672 37.4591 26.7018 37.8787 27.1213C38.2982 27.5409 38.8328 27.8266 39.4147 27.9424C39.9967 28.0581 40.5999 27.9987 41.1481 27.7716C41.6962 27.5446 42.1648 27.1601 42.4944 26.6667C42.8241 26.1734 43 25.5933 43 25C43 24.2044 42.6839 23.4413 42.1213 22.8787C41.5587 22.3161 40.7957 22 40 22Z" fill="${color}"/>
</svg>

    `;
  } else {
    svgIcon = `
        <svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M41.1719 10.625C24.303 10.625 10.625 24.303 10.625 41.1719C10.625 58.0407 24.303 71.7188 41.1719 71.7188C58.0407 71.7188 71.7188 58.0407 71.7188 41.1719C71.7188 24.303 58.0407 10.625 41.1719 10.625Z" stroke="${color}" stroke-width="3" stroke-miterlimit="10"/>
<path d="M36.5234 36.5234H41.8359V55.7812" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M34.5312 56.4453H49.1406" stroke="${color}" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
<path d="M40 22C39.4067 22 38.8266 22.1759 38.3333 22.5056C37.8399 22.8352 37.4554 23.3038 37.2284 23.8519C37.0013 24.4001 36.9419 25.0033 37.0576 25.5853C37.1734 26.1672 37.4591 26.7018 37.8787 27.1213C38.2982 27.5409 38.8328 27.8266 39.4147 27.9424C39.9967 28.0581 40.5999 27.9987 41.1481 27.7716C41.6962 27.5446 42.1648 27.1601 42.4944 26.6667C42.8241 26.1734 43 25.5933 43 25C43 24.2044 42.6839 23.4413 42.1213 22.8787C41.5587 22.3161 40.7957 22 40 22Z" fill="${color}"/>
</svg>

    `;
  }

  return <SvgXml xml={svgIcon} width={size} height={size} />;
}
