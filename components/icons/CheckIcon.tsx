import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function CheckIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="51" height="61" viewBox="0 0 51 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_628_2343)">
<path d="M49.9297 12.5574C51.3527 14.0466 51.3527 16.4652 49.9297 17.9544L20.7868 48.4544C19.3638 49.9437 17.0529 49.9437 15.6299 48.4544L1.05845 33.2044C-0.364537 31.7152 -0.364537 29.2966 1.05845 27.8074C2.48145 26.3181 4.79238 26.3181 6.21537 27.8074L18.214 40.3529L44.7841 12.5574C46.2071 11.0681 48.5181 11.0681 49.941 12.5574H49.9297Z" fill="${color}"/>
</g>
<defs>
<clipPath id="clip0_628_2343">
<rect width="51" height="61" fill="white"/>
</clipPath>
</defs>
</svg>

    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
