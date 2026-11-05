import test from "node:test";
import assert from "node:assert/strict";
import { encodeCode128, createLabelNumbers, normalizeLabelSize } from "../barcode.mjs";

test("encodes digit pairs compactly in Code 128 C", () => {
  const symbol = encodeCode128("12345");

  assert.deepEqual(symbol.values, [104, 17, 99, 23, 45, 53, 106]);
  assert.equal(symbol.modules.startsWith("11010010000"), true);
  assert.equal(symbol.modules.endsWith("1100011101011"), true);
});

test("starts even digit strings directly in Code 128 C", () => {
  assert.deepEqual(encodeCode128("1234").values, [105, 12, 34, 82, 106]);
});

test("rejects empty or non-digit box identifiers", () => {
  assert.throws(() => encodeCode128(""), /al menos un dígito/);
  assert.throws(() => encodeCode128("12A"), /solo puede tener dígitos/);
});

test("creates a zero-padded run of consecutive box labels", () => {
  assert.deepEqual(createLabelNumbers("0008", 3), ["0008", "0009", "0010"]);
});

test("limits print runs to 500 labels", () => {
  assert.throws(() => createLabelNumbers("1", 501), /500 etiquetas/);
});

test("accepts supported Brother DK widths and custom label lengths", () => {
  assert.deepEqual(normalizeLabelSize("62", "29"), { width: 62, length: 29 });
  assert.deepEqual(normalizeLabelSize(29, 45), { width: 29, length: 45 });
});

test("rejects unsupported roll widths and out-of-range lengths", () => {
  assert.throws(() => normalizeLabelSize(30, 29), /ancho de rollo válido/);
  assert.throws(() => normalizeLabelSize(62, 19), /entre 20 y 100 mm/);
});

