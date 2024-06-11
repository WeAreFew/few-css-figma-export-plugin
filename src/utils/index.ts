const FONT_BASE_SIZE: number = 16;

function rgbaToHex(r: number, g: number, b: number, a: number) {
  return (
    "#" +
    [r, g, b, a]
      .map((x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

export function parseNumberValue(value: VariableValue): string {
  const valueNum = value as number;

  // Convert "px" to "rem"
  const remValue = valueNum / FONT_BASE_SIZE;
  return remValue.toFixed(3) + "rem";
}

export function parseVariableValue(
  variable: Variable,
  modeName: string | undefined,
  value: VariableValue,
  allVariables: Array<Variable>
) {
  let parsedValue: string = "";

  if (value === undefined) {
    console.error("Value is undefined");
    return null;
  }

  if (
    value instanceof Object &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  ) {
    // Fetch the alias value
    const resolvedValue = resolveVarAlias(value, allVariables);
    parsedValue = resolvedValue;
  } else if (value instanceof Object && variable.resolvedType === "COLOR") {
    // Color
    const color = value as RGBA;
    const hexColor = rgbaToHex(color.r, color.g, color.b, color.a);
    parsedValue = hexColor;
  } else if (typeof value === "number") {
    // Number
    parsedValue = parseNumberValue(value);
  } else {
    // this should be text so put it in quotes
    // unsure if this can be converted to a CSS value
    parsedValue = `'${value.toString()}'`;
  }

  return parsedValue;
}

function findVariableById(id: string, variables: Array<Variable>) {
  return variables.find((variable) => variable.id === id);
}

export function resolveVarAlias(
  alias: VariableAlias,
  variables: Array<Variable>
): string {
  const variable = findVariableById(alias.id, variables);
  if (!variable) {
    console.error("Variable not found:", alias.id);
    return "";
  }

  const cssPropertyName = createCSSPropertyName(variable.name);
  return `var(${cssPropertyName})`;
}

export function createCSSPropertyName(name: string) {
  let cssName = name.replace(/([a-z])([A-Z])/g, "$1-$2");
  cssName = cssName.replace(/[^a-zA-Z0-9-]/g, "-");
  cssName = `--${cssName}`;
  return cssName.toLowerCase();
}
