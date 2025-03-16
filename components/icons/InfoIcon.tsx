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
        <svg width="77" height="77" viewBox="0 0 77 77" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M38.5 8.42188C21.9149 8.42188 8.42188 21.9149 8.42188 38.5C8.42188 55.0851 21.9149 68.5781 38.5 68.5781C55.0851 68.5781 68.5781 55.0851 68.5781 38.5C68.5781 21.9149 55.0851 8.42188 38.5 8.42188ZM38.5 20.7539C39.2734 20.7539 40.0293 20.9832 40.6724 21.4129C41.3154 21.8425 41.8166 22.4532 42.1125 23.1677C42.4085 23.8822 42.4859 24.6684 42.335 25.4269C42.1842 26.1854 41.8117 26.8821 41.2649 27.429C40.7181 27.9758 40.0213 28.3482 39.2628 28.4991C38.5043 28.65 37.7181 28.5725 37.0036 28.2766C36.2892 27.9806 35.6785 27.4795 35.2488 26.8364C34.8192 26.1934 34.5898 25.4374 34.5898 24.6641C34.5898 23.627 35.0018 22.6325 35.7351 21.8992C36.4684 21.1659 37.463 20.7539 38.5 20.7539ZM45.7188 54.7422H32.4844C31.8462 54.7422 31.2342 54.4887 30.7829 54.0374C30.3316 53.5862 30.0781 52.9741 30.0781 52.3359C30.0781 51.6978 30.3316 51.0857 30.7829 50.6345C31.2342 50.1832 31.8462 49.9297 32.4844 49.9297H36.6953V36.6953H34.2891C33.6509 36.6953 33.0388 36.4418 32.5876 35.9905C32.1363 35.5393 31.8828 34.9272 31.8828 34.2891C31.8828 33.6509 32.1363 33.0388 32.5876 32.5876C33.0388 32.1363 33.6509 31.8828 34.2891 31.8828H39.1016C39.7397 31.8828 40.3518 32.1363 40.803 32.5876C41.2543 33.0388 41.5078 33.6509 41.5078 34.2891V49.9297H45.7188C46.3569 49.9297 46.969 50.1832 47.4202 50.6345C47.8715 51.0857 48.125 51.6978 48.125 52.3359C48.125 52.9741 47.8715 53.5862 47.4202 54.0374C46.969 54.4887 46.3569 54.7422 45.7188 54.7422Z" fill="${color}"/>
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
