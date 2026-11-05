import test from "node:test";
import assert from "node:assert/strict";
import { encodeCode128, createLabelNumbers } from "../barcode.mjs";

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

