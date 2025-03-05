import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function TrashIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.3438 13.3438L15.7266 51.4688C15.8397 53.6717 17.4422 55.2812 19.5391 55.2812H41.4609C43.5662 55.2812 45.1388 53.6717 45.2734 51.4688L47.6562 13.3438" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.53125 13.3438H51.4688Z" fill="${color}"/>
<path d="M9.53125 13.3438H51.4688" stroke="${color}" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
<path d="M22.875 13.3438V8.57814C22.8739 8.20233 22.9471 7.83001 23.0904 7.4826C23.2337 7.13519 23.4443 6.81954 23.71 6.5538C23.9758 6.28806 24.2914 6.07748 24.6388 5.93418C24.9863 5.79087 25.3586 5.71766 25.7344 5.71876H35.2656C35.6414 5.71766 36.0137 5.79087 36.3612 5.93418C36.7086 6.07748 37.0242 6.28806 37.29 6.5538C37.5557 6.81954 37.7663 7.13519 37.9096 7.4826C38.0529 7.83001 38.1261 8.20233 38.125 8.57814V13.3438M30.5 20.9688V47.6563M21.9219 20.9688L22.875 47.6563M39.0781 20.9688L38.125 47.6563" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
