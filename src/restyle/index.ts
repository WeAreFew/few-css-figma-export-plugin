import { StyleCollection, StyleCollectionDict, StyleVariable, StyleVariableDict } from "../types";
import { createCSSPropertyName, parseVariableValue } from "../utils";

function createRestylePropertyName(name: string) {
    let cssName = name.replace(/([a-z])([A-Z])/g, "$1-$2");
    cssName = cssName.replace(/[^a-zA-Z0-9-]/g, "-");
    return cssName.toLowerCase();
  }

export async function generateRestyle() {

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
  
    // Only colors for now..
    const filteredVars = variables.filter((v) => v.resolvedType === "COLOR")
  
    // process the variables
    for (const variable of filteredVars) {
      const styleVar = {} as StyleVariable;
      styleVar.id = variable.id;
      styleVar.data = variable;
      styleVar.cssPropertyName = createCSSPropertyName(variable.name);
      styleVar.restylePropertyName = createRestylePropertyName(variable.name)
      styleVar.values = [];
     
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
  
  
    const restyleString = toRestyleJSON(collectionDictionary, variableDictionary);
  
    figma.ui.postMessage({ type: "restyle-generated", data: restyleString });
    figma.notify("Restyle Generated!");
  
    // figma.ui.postMessage({ type: "restyle-generated", data: "check the figma console..." });
  
  }

  function toRestyleJSON(
    collections: StyleCollectionDict,
    vars: StyleVariableDict
  ) {
    // Assuming the correct order of collection is sorted by name
    const sortedCollections: StyleCollection[] = Object.values(
      collections as StyleCollectionDict
    ).sort((a: StyleCollection, b: StyleCollection) => {
      return a.name.localeCompare(b.name);
    });
  
    let palette = "export const palette {\n";
  
    for (const collectionId in sortedCollections) {
      const collection = sortedCollections[collectionId];
      const collectionName = collection.name;
      palette += `  /* ${collectionName} */\n`;
      for (const varID of collection.data.variableIds) {
        const variable = vars?.[varID];
  
        if (!variable) continue
        let valueString = "";
        if (variable.values?.length > 0) {
          const modeValue = variable.values[0];
          valueString = modeValue.value;
        }
  
        palette += `  ${variable.restylePropertyName}: "${valueString}",\n`;
      }
      palette += "  /*********************/\n\n";
    }
    palette += "}";
    return palette;
  }