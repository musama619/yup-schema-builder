export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export interface SchemaField {
  name: string;
  type: FieldType;
  isRequired: boolean;
  min?: number;
  max?: number;
  errorMessage?: string;
  fields?: SchemaField[]; // For nested objects and arrays
}

export interface SchemaBuilderState {
  fields: SchemaField[];
  isRequired: boolean;
} 