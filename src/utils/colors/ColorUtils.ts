import { Area } from "@/model/pojo/definitions/Area";
import ColorThief from "colorthief";

/**
 * Generates shadoes of the given color.
 * @param seedColor   Seed color
 * @returns shades
 */
export function getShadesFromColor(seedColor: string): string[] {
  console.log("Generating shades of seed-color: " + seedColor);
  const shades: string[] = [];

  const numOfDarkShades = 10;
  const numOfLightShades = 20;
  const darkStepPercentage = 10;
  const lightStepPercentage = 10;

  // TODO P2 ----- Automatically decide how many shades to generate. Stop loop when too light or dark.

  // Dark colors
  const darkShades: string[] = [];
  let color = seedColor;
  for (let i = 0; i < numOfDarkShades; i++) {
    color = shadeOfColor(color, -1 * darkStepPercentage);
    darkShades.push(color);
  }
  darkShades.reverse().forEach((shade) => shades.push(shade));

  // Light colors
  color = seedColor;
  for (let i = 0; i < numOfLightShades; i++) {
    color = shadeOfColor(color, lightStepPercentage);
    shades.push(color);
  }

  return shades;
}

/**
 * Gives a lighter/translucent shade of the color based on the opacity % given.
 * @param   color                 HEX or HEXA color.
 * @param   fillOpacityPercent    % value of opacity.
 * @returns color                 HEXA color that's a lighter shade of the given color.
 */
export function getFillColor(color: string, fillOpacityPercent: number) {
  const isHexA = color.length > 7;
  const colorPrefix = isHexA ? color.substring(0, color.length - 2) : color;
  return colorPrefix + getFillOpacityHex(fillOpacityPercent);
}

/**
 * Extracts colors from the imageURL in the given area.
 *
 * @param area    Contains the image.
 */
export function setColorsFromImage(area: Area) {
  const colorThief = new ColorThief();

  // Make a temporary HTML element for the image.
  const imageElement = new Image();
  // Hack to prevent CORS errors. We use a proxy server to redirect.
  const googleProxyURL =
    "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=";

  imageElement.src = googleProxyURL + encodeURIComponent(area.imageUrl);

  // Prevent CORS errors.
  imageElement.crossOrigin = "Anonymous";

  imageElement.addEventListener("load", function () {
    // * ------- Make color-thief do its thiefing.
    const dominantColor: number[] = colorThief.getColor(imageElement);
    const palette: number[][] = colorThief.getPalette(imageElement);

    // * ------- Convert from RGB to HEX
    const dominantColorHex: string = rgbToHex(dominantColor);
    const paletteHex: string[] = palette.map((rgb) => rgbToHex(rgb));

    // * ------- Write the colors into the Area.
    area.dominantColorInImage = dominantColorHex;
    area.colorPalette = paletteHex;
  });

  // Destroy HTML element
  imageElement.remove();
}

// * ------------ Private functions

function rgbToHex(rgb: number[]): string {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getFillOpacityHex(fillOpacityPercent: number) {
  const hex = Math.round((fillOpacityPercent / 100) * 255).toString(16);
  return hex.length > 1 ? hex : 0 + hex;
}

/**
 * Source: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 * @param color
 * @param percent       +ve value ---> lighten,  -ve value ---> darken
 * @returns
 */
function shadeOfColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = (R * (100.0 + percent)) / 100.0;
  G = (G * (100.0 + percent)) / 100.0;
  B = (B * (100.0 + percent)) / 100.0;

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  const RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}
