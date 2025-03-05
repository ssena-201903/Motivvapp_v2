import React from "react";
import { SvgXml } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function LockIcon({
  size,
  color,
}: Props) {
    const svgIcon = `
        <svg width="61" height="61" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M43.8438 22.875H41.9375V13.3438C41.9375 10.3103 40.7325 7.40116 38.5875 5.25622C36.4426 3.11127 33.5334 1.90625 30.5 1.90625C27.4666 1.90625 24.5574 3.11127 22.4125 5.25622C20.2675 7.40116 19.0625 10.3103 19.0625 13.3438V22.875H17.1562C15.1347 22.8772 13.1965 23.6813 11.767 25.1107C10.3375 26.5402 9.53346 28.4784 9.53125 30.5V51.4688C9.53346 53.4903 10.3375 55.4285 11.767 56.858C13.1965 58.2875 15.1347 59.0915 17.1562 59.0938H43.8438C45.8653 59.0915 47.8035 58.2875 49.233 56.858C50.6625 55.4285 51.4665 53.4903 51.4688 51.4688V30.5C51.4665 28.4784 50.6625 26.5402 49.233 25.1107C47.8035 23.6813 45.8653 22.8772 43.8438 22.875ZM38.125 22.875H22.875V13.3438C22.875 11.3215 23.6783 9.38203 25.1083 7.95206C26.5383 6.5221 28.4777 5.71875 30.5 5.71875C32.5223 5.71875 34.4617 6.5221 35.8917 7.95206C37.3217 9.38203 38.125 11.3215 38.125 13.3438V22.875Z" fill="${color}"/>
</svg>
    `;

  return <SvgXml xml={svgIcon} width={size} height={size} color={color} />;
}
