import { SvgXml } from "react-native-svg";

type Props = {
  height: number;
  width: number;
  variant: "empty" | "full";
};

export default function MugIcon({ width, height, variant }: Props) {
  let svgData = ``;

  if (variant === "empty") {
    svgData = `<svg width="21" height="26" viewBox="0 0 21 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L2.5 25.5H14.5L16 1M16 10C20 11 22 17 15 19" stroke="#264653" stroke-linecap="round"/>
</svg>
`;
  } else if (variant === "full") {
    svgData = `<svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 22L1.5 4C3 5 4 4.5 5 4C6.5 5 7 5 8.5 4C10 5 10.5 5 12 4C13.5 5 13.5 5 15 4L14.5 22H2.5Z" fill="#FFA38F"/>
<path d="M1 1.42871L2 21.9287H14L15 1.42871M15.5 6.42871C19.5 7.42871 21.5 13.4287 14.5 15.4287" stroke="#264653" stroke-linecap="round"/>
</svg>

`;
  }

  return <SvgXml xml={svgData} width={width} height={height} />;
}
