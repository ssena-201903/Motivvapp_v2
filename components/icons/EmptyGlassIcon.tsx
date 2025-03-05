import { SvgXml } from "react-native-svg";

type Props = {
  height: number;
  width: number;
}

export default function EmptyGlassIcon ({ width, height } : Props) {
  const svgData = `
  <svg width="13" height="21" viewBox="0 0 13 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 0.5L2.40995 19.5995C2.46107 20.1107 2.89124 20.5 3.40499 20.5H9.59501C10.1088 20.5 10.5389 20.1107 10.59 19.5995L12.5 0.5" stroke="#264653" stroke-width="0.75" stroke-linecap="round"/>
</svg>
`;

  return <SvgXml xml={svgData} width={width} height={height}/>;
};
