import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  variant?: "fill" | "outlined";
};

export default function HeartIcon({ size, color, variant }: Props) {
  let svgIcon;
  if (variant === "fill") {
    svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.67109 35.7894L27.1998 55.8885C28.0934 56.7225 29.2729 57.1871 30.5 57.1871C31.7271 57.1871 32.9066 56.7225 33.8002 55.8885L55.3289 35.7894C58.9508 32.4178 61 27.6879 61 22.7435V22.0525C61 13.7246 54.9834 6.62382 46.7746 5.2537C41.3418 4.34823 35.8137 6.12343 31.9297 10.0074L30.5 11.4371L29.0703 10.0074C25.1863 6.12343 19.6582 4.34823 14.2254 5.2537C6.0166 6.62382 0 13.7246 0 22.0525V22.7435C0 27.6879 2.04922 32.4178 5.67109 35.7894Z" fill="black"/>
</svg>

    `;
  } else {
    svgIcon = `
        <svg width="61" height="53" viewBox="0 0 61 53" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.69315 29.6915L6.69472 29.693L28.2233 49.7919C28.8383 50.3659 29.6518 50.6871 30.5 50.6871C31.3482 50.6871 32.1615 50.366 32.7766 49.792C32.7766 49.792 32.7767 49.7919 32.7767 49.7919L54.3053 29.693L54.3068 29.6915C57.6226 26.6049 59.5 22.2733 59.5 17.7435V17.0525C59.5 9.45778 54.0134 2.98267 46.5277 1.73323C41.5728 0.907541 36.5317 2.52671 32.9903 6.06807L31.5607 7.49776L30.5 8.55842L29.4393 7.49776L28.0097 6.06807C24.4683 2.52671 19.4272 0.90754 14.4723 1.73323L6.69315 29.6915ZM6.69315 29.6915C3.37744 26.6049 1.5 22.2733 1.5 17.7435V17.0525C1.5 9.4579 6.98645 2.98287 14.472 1.73329L6.69315 29.6915Z" stroke="black" stroke-width="3"/>
</svg>


    `;
  }

  return <SvgXml xml={svgIcon} width={size} height={size} />;
}
