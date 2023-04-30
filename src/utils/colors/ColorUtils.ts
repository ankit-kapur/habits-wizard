import { Area } from "@/model/pojo/definitions/Area";
import ColorThief from "colorthief";

/**
 * ! ----- Use this to generate SHADES
 * https://stackoverflow.com/questions/40619476/javascript-generate-different-shades-of-the-same-color
 */
export function getShadesFromColor(color: string): string[] {
  console.log("Getting shades of color: " + color);

  // TODO P0 ------- Implement

  return [];
}

/**
 * Gives a lighter shade of the color based on the opacity % given.
 *
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

function rgbToHex(rgb: number[]) {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function getFillOpacityHex(fillOpacityPercent: number) {
  const hex = Math.round((fillOpacityPercent / 100) * 255).toString(16);
  return hex.length > 1 ? hex : 0 + hex;
}
