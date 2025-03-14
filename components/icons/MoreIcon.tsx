import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function MoreIcon({ size, color }: Props) {
  const svgIcon = `
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 33.25C30.8995 33.25 33.25 30.8995 33.25 28C33.25 25.1005 30.8995 22.75 28 22.75C25.1005 22.75 22.75 25.1005 22.75 28C22.75 30.8995 25.1005 33.25 28 33.25Z" fill="${color}"/>
<path d="M28 50.75C30.8995 50.75 33.25 48.3995 33.25 45.5C33.25 42.6005 30.8995 40.25 28 40.25C25.1005 40.25 22.75 42.6005 22.75 45.5C22.75 48.3995 25.1005 50.75 28 50.75Z" fill="${color}"/>
<path d="M28 15.75C30.8995 15.75 33.25 13.3995 33.25 10.5C33.25 7.60051 30.8995 5.25 28 5.25C25.1005 5.25 22.75 7.60051 22.75 10.5C22.75 13.3995 25.1005 15.75 28 15.75Z" fill="${color}"/>
</svg>

`;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
