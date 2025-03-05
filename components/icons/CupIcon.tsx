import { SvgXml } from "react-native-svg";

type Props = {
  height: number;
  width: number;
  variant: "empty" | "full";
};

export default function CupIcon({ width, height, variant }: Props) {
  let svgData = ``;

  if (variant === "empty") {
    svgData = `<svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L3 11.5H15L16 1M16 3.5C20 4.5 18.5 7 15.5 8.5" stroke="#264653" stroke-width="0.75" stroke-linecap="round"/>
</svg>
`;
  } else if (variant === "full") {
    svgData = `<svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 11L1 2C2.1728 2.74839 2.32228 2.68602 3.5 2C4.93456 2.88216 5.16429 2.7232 6.5 2C7.67609 2.72025 8.32074 2.80297 9.5 2C10.595 2.72421 11.2445 2.91501 12.5 2C13.401 2.70511 13.9402 2.64676 15 2L14.5 11H2.5Z" fill="#FFA38F"/>
<path d="M0.5 0.428711L2.5 10.9287H14.5L15.5 0.428711M15.5 2.92871C19.5 3.92871 18 6.42871 15 7.92871" stroke="#264653" stroke-width="0.75" stroke-linecap="round"/>
</svg>
`;
  }

  return <SvgXml xml={svgData} width={width} height={height} />;
}
