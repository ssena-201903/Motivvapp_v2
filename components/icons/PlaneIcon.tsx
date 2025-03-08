import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function PlaneIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="149" height="132" viewBox="0 0 149 132" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_683_2351)">
<path d="M124.762 49.5C133.609 49.5 149 56.9766 149 66C149 75.2812 133.609 82.5 124.762 82.5H94.5995L68.6021 127.849C67.1276 130.427 64.3856 132 61.4108 132H46.8729C44.1309 132 42.1391 129.37 42.8892 126.741L55.5646 82.5H28.9722L17.7972 97.35C17.0212 98.3813 15.7795 99 14.4861 99H3.62153C1.60382 99 0 97.3758 0 95.3906C0 95.0555 0.0517361 94.7203 0.12934 94.3852L8.27778 66L0.12934 37.6148C0.0258681 37.2797 0 36.9445 0 36.6094C0 34.5984 1.62969 33 3.62153 33H14.4861C15.7795 33 17.0212 33.6187 17.7972 34.65L28.9722 49.5H55.5904L42.9151 5.25937C42.1391 2.62969 44.1309 0 46.8729 0H61.4108C64.3856 0 67.1276 1.59844 68.6021 4.15078L94.5995 49.5H124.762Z" fill="${color}"/>
</g>
<defs>
<clipPath id="clip0_683_2351">
<rect width="149" height="132" fill="white"/>
</clipPath>
</defs>
</svg>


    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
