import { createLabelNumbers, encodeCode128, normalizeLabelSize } from "./barcode.mjs";

const form = document.querySelector("#labelForm");
const startInput = document.querySelector("#startNumber");
const countInput = document.querySelector("#labelCount");
const rangeInput = document.querySelector("#countRange");
const preview = document.querySelector("#labelPreview");
const printArea = document.querySelector("#printArea");
const errorMessage = document.querySelector("#formError");
const previewCount = document.querySelector("#previewCount");
const printLabelText = document.querySelector("#printLabelText");
const rangeText = document.querySelector("#rangeText");
const moreLabels = document.querySelector("#moreLabels");
const rollWidthInput = document.querySelector("#rollWidth");
const labelLengthInput = document.querySelector("#labelLength");
const pageSizeStyle = document.createElement("style");
pageSizeStyle.id = "printPageSize";
document.head.append(pageSizeStyle);

function makeBarcode(number) {
  const { modules } = encodeCode128(number);
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", `0 0 ${modules.length + 24} 54`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Código de barras Code 128 para la caja ${number}`);
  svg.setAttribute("preserveAspectRatio", "none");
  let index = 0;
  while (index < modules.length) {
    if (modules[index] === "0") { index += 1; continue; }
    const left = index;
    while (modules[index] === "1") index += 1;
    const bar = document.createElementNS(namespace, "rect");
    bar.setAttribute("x", String(left + 12));
    bar.setAttribute("y", "2");
    bar.setAttribute("width", String(index - left));
    bar.setAttribute("height", "43");
    bar.setAttribute("fill", "#16231d");
    svg.append(bar);
  }
  return svg;
}

function makeLabel(number, className) {
  const label = document.createElement("article");
  label.className = className;
  const barcode = makeBarcode(number);
  const digits = document.createElement("strong");
  digits.className = "label-number";
  digits.textContent = number;
  label.append(barcode, digits);
  return label;
}

function render() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  try {
    const { width, length } = normalizeLabelSize(rollWidthInput.value, labelLengthInput.value);
    const numbers = createLabelNumbers(startInput.value.trim(), countInput.value);
    const fragment = document.createDocumentFragment();
    numbers.slice(0, 6).forEach((number) => fragment.append(makeLabel(number, "preview-label")));
    preview.replaceChildren(fragment);

    const printFragment = document.createDocumentFragment();
    numbers.forEach((number) => printFragment.append(makeLabel(number, "print-label")));
    printArea.replaceChildren(printFragment);
    document.documentElement.style.setProperty("--label-width", `${width}mm`);
    document.documentElement.style.setProperty("--label-length", `${length}mm`);
    pageSizeStyle.textContent = `@media print { @page { size: ${width}mm ${length}mm; margin: 0; } }`;

    const count = numbers.length;
    const noun = count === 1 ? "etiqueta" : "etiquetas";
    previewCount.textContent = `${count} ${noun}`;
    printLabelText.textContent = `Imprimir ${count} ${noun}`;
    rangeText.textContent = `${numbers[0]} — ${numbers.at(-1)}`;
    rangeInput.value = String(Math.max(1, Math.min(100, count)));
    moreLabels.hidden = count <= 6;
    moreLabels.textContent = count > 6 ? `+ ${count - 6} etiquetas en la impresión` : "";
    return true;
  } catch (error) {
    preview.replaceChildren();
    printArea.replaceChildren();
    previewCount.textContent = "Revisá los datos";
    printLabelText.textContent = "No hay etiquetas para imprimir";
    rangeText.textContent = "Sin etiquetas para imprimir";
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
    moreLabels.hidden = true;
    return false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

countInput.addEventListener("input", () => {
  if (countInput.value !== "") rangeInput.value = String(Math.max(1, Math.min(100, Number(countInput.value))));
  render();
});

startInput.addEventListener("input", render);
rollWidthInput.addEventListener("change", render);
labelLengthInput.addEventListener("input", render);

rangeInput.addEventListener("input", () => {
  countInput.value = rangeInput.value;
  render();
});

document.querySelector("#printButton").addEventListener("click", () => {
  if (render() && printArea.childElementCount > 0) window.print();
});

render();

