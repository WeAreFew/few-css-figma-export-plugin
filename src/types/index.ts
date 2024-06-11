export type StyleCollection = {
    id: string;
    name: string;
    modes: Array<object>;
    variables: Array<StyleVariable>;
    data: VariableCollection;
  };
  
  export type StyleCollectionDict = Record<string, StyleCollection>;
  
  export type StyleVarValue = {
    mode: string;
    value: string;
  };
  
  export type StyleVariable = {
    id: string;
    data: Variable;
    cssPropertyName: string;
    restylePropertyName: string;
    values: Array<StyleVarValue>;
  };
  
  export type StyleVariableDict = Record<string, StyleVariable>;