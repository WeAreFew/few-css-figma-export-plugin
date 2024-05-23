// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// CODE STARTS HERE
// ************************************
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: { type: string; count: number }) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "generate-css") {
    figma.notify("Generating CSS...");
    await generateCSS();
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

const FONT_BASE_SIZE: number = 16;

type StyleCollection = {
  id: string;
  name: string;
  modes: Array<object>;
  variables: Array<StyleVariable>;
  data: VariableCollection;
};

type StyleCollectionDict = Record<string, StyleCollection>;

type StyleVarValue = {
  mode: string;
  value: string;
};

type StyleVariable = {
  id: string;
  data: Variable;
  cssPropertyName: string;
  values: Array<StyleVarValue>;
};

type StyleVariableDict = Record<string, StyleVariable>;

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

function toCSSString(
  collections: StyleCollectionDict,
  vars: StyleVariableDict
) {
  let css = ":root {\n";

  for (const collectionId in collections) {
    const collection = collections[collectionId];
    const collectionName = collection.name;
    css += `  /* ${collectionName} */\n`;
    for (const varID of collection.data.variableIds) {
      const variable = vars[varID];
      let valueString = "";
      if (variable.values?.length > 0) {
        const modeValue = variable.values[0];
        valueString = modeValue.value;
      }

      css += `  ${variable.cssPropertyName}: ${valueString};\n`;
    }
    css += "  /*********************/\n\n";
  }
  css += "}";
  return css;
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 400 });

console.clear();
//const rgba = figma.util.rgba;

function findVariableById(id: string, variables: Array<Variable>) {
  return variables.find((variable) => variable.id === id);
}

function resolveVarAlias(
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

function parseNumberValue(value: VariableValue): string {
  const valueNum = value as number;

  // Convert "px" to "rem"
  const remValue = valueNum / FONT_BASE_SIZE;
  return remValue.toFixed(3) + "rem";
}

function parseVariableValue(
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

async function generateCSS() {
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionDictionary: StyleCollectionDict = {};
  const variableDictionary: StyleVariableDict = {};

  // process the collections
  for (const collection of collections) {
    const styleCollection = {} as StyleCollection;
    styleCollection.id = collection.id;
    styleCollection.name = collection.name;
    styleCollection.data = collection;
    collectionDictionary[styleCollection.id] = styleCollection;
  }

  // process the variables
  for (const variable of variables) {
    const styleVar = {} as StyleVariable;
    styleVar.id = variable.id;
    styleVar.data = variable;
    styleVar.cssPropertyName = createCSSPropertyName(variable.name);
    styleVar.values = [];
    //styleVar.value = "";
    variableDictionary[styleVar.id] = styleVar;

    const varCollection = collectionDictionary[variable.variableCollectionId];

    const modes = varCollection?.data.modes;
    if ((modes?.length ?? 0) > 1) {
      console.error("Multiple Modes not supported yet!");
    }

    for (const idx in variable.valuesByMode) {
      const modeValue = variable.valuesByMode[idx];
      const modeName = modes?.find((mode) => mode.modeId === idx)?.name;
      const parsedValue = parseVariableValue(
        variable,
        modeName,
        modeValue,
        variables
      );
      styleVar.values.push({ mode: modeName || "", value: parsedValue || "" });
    }
  }

  // Done processing the variable and collections, generate CSS
  // TODO: Add multiple output options
  // TODO: Add support for multiple modes
  // TODO: Add support for px and rem sizes and different base size for rems
  const cssString = toCSSString(collectionDictionary, variableDictionary);

  figma.ui.postMessage({ type: "css-generated", data: cssString });
  figma.notify("CSS Generated!");
}

// ************************************

function createCSSPropertyName(name: string) {
  let cssName = name.replace(/([a-z])([A-Z])/g, "$1-$2");
  cssName = cssName.replace(/[^a-zA-Z0-9-]/g, "-");
  cssName = `--${cssName}`;
  return cssName.toLowerCase();
}
