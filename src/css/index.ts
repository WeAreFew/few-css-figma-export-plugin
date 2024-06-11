
import { StyleCollection, StyleCollectionDict, StyleVariable, StyleVariableDict } from "../types";
import { createCSSPropertyName, parseVariableValue } from "../utils";

  function toCSSString(
    collections: StyleCollectionDict,
    vars: StyleVariableDict
  ) {
    // Assuming the correct order of collection is sorted by name
    const sortedCollections: StyleCollection[] = Object.values(
      collections as StyleCollectionDict
    ).sort((a: StyleCollection, b: StyleCollection) => {
      return a.name.localeCompare(b.name);
    });
  
    let css = ":root {\n";
  
    for (const collectionId in sortedCollections) {
      const collection = sortedCollections[collectionId];
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

export async function generateCSS() {
    const variables = await figma.variables.getLocalVariablesAsync();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    console.log("Collections:", collections);
  
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