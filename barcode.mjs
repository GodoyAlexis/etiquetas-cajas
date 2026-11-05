const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

function validateDigits(value) {
  if (typeof value !== "string" || value.length === 0) throw new Error("Ingresá al menos un dígito.");
  if (!/^\d+$/.test(value)) throw new Error("El identificador de caja solo puede tener dígitos.");
}

export function encodeCode128(value) {
  validateDigits(value);

  // Code C packs digit pairs into one symbol. For an odd-length value, encode
  // the leading digit in Code B, then switch to Code C for the remaining pairs.
  const values = value.length % 2 === 0
    ? [105, ...value.match(/\d{2}/g).map(Number)]
    : [104, value.charCodeAt(0) - 32, 99, ...value.slice(1).match(/\d{2}/g).map(Number)];
  const checksum = values.reduce((sum, code, index) => sum + code * (index || 1), 0) % 103;
  values.push(checksum, 106);

  const modules = values.map((code) => {
    let bar = true;
    let result = "";
    for (const width of CODE128_PATTERNS[code]) {
      result += (bar ? "1" : "0").repeat(Number(width));
      bar = !bar;
    }
    return result;
  }).join("");
  return { values, modules };
}

export function createLabelNumbers(start, count) {
  validateDigits(start);
  if (start.length > 18) throw new Error("El número inicial puede tener hasta 18 dígitos.");
  const quantity = Number(count);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new Error("Elegí entre 1 y 500 etiquetas.");
  }
  const first = BigInt(start);
  const width = start.length;
  return Array.from({ length: quantity }, (_, index) => String(first + BigInt(index)).padStart(width, "0"));
}

