// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

type StyleCollection = {
  id: string;
  name: string;
  modes: Array<object>;
  variables: Array<StyleVariable>;
  data: VariableCollection;
};

type StyleVarValue = {
  mode: string;
  value: string;
};

type StyleVariable = {
  id: string;
  data: Variable;
  cssPropertyName: string;
  modeName: string;
  values: Array<StyleVarValue>;
};

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 400 });

console.clear();
//const rgba = figma.util.rgba;

function findVariableById(id: string, variables: Array<Variable>) {
  return variables.find((variable) => variable.id === id);
}

function findCollectionById(
  id: string,
  collections: Array<VariableCollection>
) {
  return collections.find((collection) => collection.id === id);
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

function parseVariableValue(
  variable: Variable,
  modeName: string | undefined,
  value: VariableValue,
  allVariables: Array<Variable>
) {
  const parsedValue: string = "";

  if (value === undefined) {
    console.log("Value is undefined");
    return null;
  }
  console.log("Var Value:", value);
  console.log("Var Resolved Type:", variable.resolvedType);

  if (
    value instanceof Object &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  ) {
    console.log("Variable Alias:", value);
    const resolvedValue = resolveVarAlias(value, allVariables);
    // Fetch the varaibles name
    console.log("Resolved Value:", resolvedValue);
  }

  return parsedValue;
}

async function generateCSS() {
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionDictionary = new Map<string, StyleCollection>();
  const variableDictionary = new Map<string, StyleVariable>();

  // process the collections
  for (const collection of collections) {
    console.log("Collection:", collection);
    const styleCollection = {} as StyleCollection;
    styleCollection.id = collection.id;
    styleCollection.name = collection.name;
    styleCollection.data = collection;
    collectionDictionary.set(styleCollection.id, styleCollection);
  }

  // process the variables
  for (const variable of variables) {
    const styleVar = {} as StyleVariable;
    styleVar.id = variable.id;
    styleVar.data = variable;
    styleVar.cssPropertyName = createCSSPropertyName(variable.name);
    //styleVar.value = "";
    variableDictionary.set(styleVar.id, styleVar);

    console.log("Var Name:", styleVar.cssPropertyName);

    const varCollection = collectionDictionary.get(
      variable.variableCollectionId
    );

    const modes = varCollection?.data.modes;
    console.log("Num Modes:", modes?.length);

    for (const idx in variable.valuesByMode) {
      const modeValue = variable.valuesByMode[idx];
      const modeName = modes?.find((mode) => mode.modeId === idx)?.name;
      //console.log("Mode Name:", modeName);
      //console.log("Mode Value:", modeValue);
      parseVariableValue(variable, modeName, modeValue, variables);
    }

    console.log(variable);
    console.log("------");
  }

  // console.log("Collection Dictionary", collectionDictionary);
  // console.log("Variable Dictionary", variableDictionary);
}

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
// ************************************

function createCSSPropertyName(name: string) {
  let cssName = name.replace(/([a-z])([A-Z])/g, "$1-$2");
  cssName = cssName.replace(/[^a-zA-Z0-9-]/g, "-");
  cssName = `--${cssName}`;
  return cssName.toLowerCase();
}

/*
function processCollection({
  name,
  modes,
  variableIds,
}: {
  name: string;
  modes: object[];
  variableIds: string[];
}) {
  console.log(`Processing Collection: ${name}`);

  for (const varID of variableIds) {
    processVariable(varID, modes);
  }
}

async function processVariable(varID: string, modes) {
  const variable = await figma.variables.getVariableByIdAsync(varID);
  if (!variable) {
    return null;
  }

  const cssName = createCSSPropertyName(variable.name);
  console.log(`Processing Variable: ${variable.name}`);
  console.log(`CSS Name: ${cssName}`);
  console.log(`Type: ${variable.resolvedType}`);

  // Values for Each Mode
  for (const mode of modes) {
    const value = variable.valuesByMode[mode.modeId];
    console.log("Mode:", mode, mode.modeId);
    console.log("Mode Value:", value);
    parseValue(variable, value);
  }
}

function parseValue(variable: Variable, value: any) {
  const parsedValue = null;
  if (value === undefined) {
    console.log("Value is undefined");
    return null;
  }
  console.log("Value:", value);
  console.log("Type:", variable.resolvedType);

  if (value.type === "VARIABLE_ALIAS") {
          const currentVar = await figma.variables.getVariableByIdAsync(
            value.id
          );

  return parsedValue;
}
*/
