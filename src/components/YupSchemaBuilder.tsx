import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Hammer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

interface ObjectField {
  name: string;
  type: Exclude<FieldType, 'array' | 'object'>;
  required: boolean;
}

interface Field {
  name: string;
  type: FieldType;
  required: boolean;
  nullable: boolean;
  minLength: string;
  maxLength: string;
  min: string;
  max: string;
  customMessage: string;
  arrayType: Exclude<FieldType, 'array'>;
  arrayOfObject: boolean;
  objectFields: ObjectField[];
  arrayMin: string;
  arrayMax: string;
}

interface FieldUpdate {
  name?: string;
  type?: FieldType;
  required?: CheckedState;
  nullable?: CheckedState;
  arrayType?: Exclude<FieldType, 'array'>;
  arrayOfObject?: boolean;
  arrayMin?: string;
  arrayMax?: string;
  minLength?: string;
  maxLength?: string;
  min?: string;
  max?: string;
  customMessage?: string;
}

interface ObjectFieldUpdate {
  name?: string;
  type?: Exclude<FieldType, 'array' | 'object'>;
  required?: CheckedState;
}

const YupSchemaGenerator = () => {
  const initialField: Field = {
    name: '',
    type: 'string',
    required: false,
    nullable: false,
    minLength: '',
    maxLength: '',
    min: '',
    max: '',
    customMessage: '',
    arrayType: 'string',
    arrayOfObject: false,
    objectFields: [],
    arrayMin: '',
    arrayMax: ''
  };

  const [fields, setFields] = useState<Field[]>([{ ...initialField }]);
  const [generatedSchema, setGeneratedSchema] = useState<string>('');

  const fieldTypes: FieldType[] = [
    'string',
    'number',
    'boolean',
    'date',
    'array',
    'object'
  ];

  const addField = (): void => {
    setFields([{ ...initialField }, ...fields]);
  };

  const addObjectField = (fieldIndex: number): void => {
    const newFields = [...fields];
    newFields[fieldIndex].objectFields.push({
      name: '',
      type: 'string',
      required: false
    });
    setFields(newFields);
  };

  const updateField = (index: number, updates: FieldUpdate): void => {
  const newFields = [...fields];
  
  const typedUpdates: Partial<Field> = {};
  
  if (updates.name !== undefined) typedUpdates.name = updates.name;
  if (updates.type !== undefined) typedUpdates.type = updates.type;
  if (updates.required !== undefined) typedUpdates.required = updates.required === true;
  if (updates.nullable !== undefined) typedUpdates.nullable = updates.nullable === true;
  if (updates.arrayType !== undefined) typedUpdates.arrayType = updates.arrayType;
  if (updates.arrayOfObject !== undefined) typedUpdates.arrayOfObject = updates.arrayOfObject;
  if (updates.arrayMin !== undefined) typedUpdates.arrayMin = updates.arrayMin;
  if (updates.arrayMax !== undefined) typedUpdates.arrayMax = updates.arrayMax;
  if (updates.minLength !== undefined) typedUpdates.minLength = updates.minLength;
  if (updates.maxLength !== undefined) typedUpdates.maxLength = updates.maxLength;
  if (updates.min !== undefined) typedUpdates.min = updates.min;
  if (updates.max !== undefined) typedUpdates.max = updates.max;
  if (updates.customMessage !== undefined) typedUpdates.customMessage = updates.customMessage;
  
  newFields[index] = { ...newFields[index], ...typedUpdates };
  setFields(newFields);
};

const updateObjectField = (fieldIndex: number, objectFieldIndex: number, updates: ObjectFieldUpdate): void => {
  const newFields = [...fields];
  
  const typedUpdates: Partial<ObjectField> = {};
  
  if (updates.name !== undefined) typedUpdates.name = updates.name;
  if (updates.type !== undefined) typedUpdates.type = updates.type;
  if (updates.required !== undefined) typedUpdates.required = updates.required === true;
  
  newFields[fieldIndex].objectFields[objectFieldIndex] = {
    ...newFields[fieldIndex].objectFields[objectFieldIndex],
    ...typedUpdates
  };
  
  setFields(newFields);
};

  const removeField = (index: number): void => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const removeObjectField = (fieldIndex: number, objectFieldIndex: number): void => {
    const newFields = [...fields];
    newFields[fieldIndex].objectFields.splice(objectFieldIndex, 1);
    setFields(newFields);
  };

  // generate schema for object fields
  const generateObjectFieldsSchema = (objectFields: ObjectField[]): string => {
    let schema = '';
    objectFields.forEach((objField) => {
      let objFieldSchema = `    ${objField.name}: `;

      switch (objField.type) {
        case 'string':
          objFieldSchema += 'Yup.string()';
          break;
        case 'number':
          objFieldSchema += 'Yup.number()';
          break;
        case 'boolean':
          objFieldSchema += 'Yup.boolean()';
          break;
        case 'date':
          objFieldSchema += 'Yup.date()';
          break;
      }

      if (objField.required) {
        objFieldSchema += '.required()';
      } else {
        objFieldSchema += '.notRequired()';
      }

      schema += objFieldSchema + ',\n';
    });
    return schema;
  };

  const generateSchema = (): void => {
    let schemaCode = 'import * as Yup from \'yup\';\n\n';
    schemaCode += 'const validationSchema = Yup.object({\n';

    fields.forEach(field => {
      if (!field.name) return;

      let fieldSchema = `  ${field.name}: `;

      switch (field.type) {
        case 'string':
          fieldSchema += 'Yup.string()';
          break;
        case 'number':
          fieldSchema += 'Yup.number()';
          break;
        case 'boolean':
          fieldSchema += 'Yup.boolean()';
          break;
        case 'date':
          fieldSchema += 'Yup.date()';
          break;
        case 'array':
          if (field.arrayOfObject) {
            fieldSchema += 'Yup.array().of(Yup.object({\n';
            fieldSchema += generateObjectFieldsSchema(field.objectFields);
            fieldSchema += '  }))';
          } else {
            // Simple array
            fieldSchema += `Yup.array().of(Yup.${field.arrayType}())`;
          }

          if (field.arrayMin) {
            fieldSchema += `.min(${field.arrayMin}, "Minimum ${field.name} count is ${field.arrayMin}")`;
          }
          if (field.arrayMax) {
            fieldSchema += `.max(${field.arrayMax}, "Maximum ${field.name} count is ${field.arrayMax}")`;
          }
          break;
        case 'object':
          fieldSchema += 'Yup.object({\n';
          fieldSchema += generateObjectFieldsSchema(field.objectFields);
          fieldSchema += '  })';
          break;
      }

      if (field.nullable) {
        fieldSchema += '.nullable()';
      }

      if (field.required) {
        fieldSchema += `.required("${field.customMessage || `${field.name} is required`}")`;
      } else {
        fieldSchema += '.notRequired()';
      }

      // String specific validations
      if (field.type === 'string') {
        if (field.minLength) {
          fieldSchema += `.min(${field.minLength}, "Minimum length is ${field.minLength}")`;
        }
        if (field.maxLength) {
          fieldSchema += `.max(${field.maxLength}, "Maximum length is ${field.maxLength}")`;
        }
      }

      // Number specific validations
      if (field.type === 'number') {
        if (field.min) {
          fieldSchema += `.min(${field.min}, "Minimum value is ${field.min}")`;
        }
        if (field.max) {
          fieldSchema += `.max(${field.max}, "Maximum value is ${field.max}")`;
        }
      }

      schemaCode += fieldSchema + ',\n';
    });

    schemaCode += '});\n\nexport default validationSchema;';

    setGeneratedSchema(schemaCode);
  };

  const renderFieldTypeSpecificInputs = (field: Field, index: number) => {
    switch (field.type) {
      case 'string':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Min Length</Label>
              <Input
                type="number"
                value={field.minLength}
                onChange={(e) => updateField(index, { minLength: e.target.value })}
                placeholder="Minimum length"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Max Length</Label>
              <Input
                type="number"
                value={field.maxLength}
                onChange={(e) => updateField(index, { maxLength: e.target.value })}
                placeholder="Maximum length"
                className="mt-2"
              />
            </div>
          </div>
        );
      case 'number':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Min Value</Label>
              <Input
                type="number"
                value={field.min}
                onChange={(e) => updateField(index, { min: e.target.value })}
                placeholder="Minimum value"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Max Value</Label>
              <Input
                type="number"
                value={field.max}
                onChange={(e) => updateField(index, { max: e.target.value })}
                placeholder="Maximum value"
                className="mt-2"
              />
            </div>
          </div>
        );
      case 'array':
        return renderArrayTypeInputs(field, index);
      case 'object':
        return renderObjectTypeInputs(field, index);
      default:
        return null;
    }
  };

  const renderArrayTypeInputs = (field: Field, index: number) => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="mb-2">Array Element Type</Label>
            <Select
              value={field.arrayType}
              onValueChange={(value) => updateField(index, {
                arrayType: value as Exclude<FieldType, 'array'>,
                arrayOfObject: value === 'object'
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.filter(t => t !== 'array').map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Min Array Length</Label>
            <Input
              type="number"
              value={field.arrayMin}
              onChange={(e) => updateField(index, { arrayMin: e.target.value })}
              placeholder="Minimum count"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Max Array Length</Label>
            <Input
              type="number"
              value={field.arrayMax}
              onChange={(e) => updateField(index, { arrayMax: e.target.value })}
              className="mt-2"
              placeholder="Maximum count"
            />
          </div>
        </div>

        {field.arrayType === 'object' && renderObjectFields(field, index)}
      </div>
    );
  };

  // Render object type specific inputs
  const renderObjectTypeInputs = (field: Field, index: number) => {
    return renderObjectFields(field, index);
  };

  // Render object fields section
  const renderObjectFields = (field: Field, index: number) => {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Object Fields</Label>
          <Button
            onClick={() => addObjectField(index)}
            size="sm"
            variant='link'
            className='underline'
          >
            <Plus /> Add Object Field
          </Button>
        </div>

        {field.objectFields.map((objField, objIndex) => (
          <div key={objIndex} className="border p-2 rounded mb-2 grid grid-cols-3 gap-2 items-center">
            <Input
              placeholder="Field Name"
              value={objField.name}
              onChange={(e) => updateObjectField(index, objIndex, { name: e.target.value })}
            />

            <Select
              value={objField.type}
              onValueChange={(value) => updateObjectField(index, objIndex, {
                type: value as Exclude<FieldType, 'array' | 'object'>
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.filter(t => t !== 'array' && t !== 'object').map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <Checkbox
                checked={objField.required}
                onCheckedChange={(checked) => updateObjectField(index, objIndex, { required: checked })}
              />
              <Label className="ml-2">Required</Label>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeObjectField(index, objIndex)}
                className="ml-2"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto p-4">
      <Card className="w-ful card-grainy max-w-full mx-auto shadow-2xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={addField} size="sm">
              <Plus /> Add Field
            </Button>
            <Button onClick={generateSchema} size="sm" variant="default" className="bg-pink-600 hover:bg-pink-500">
              <Hammer /> Build Schema
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col lg:flex-row gap-4 max-h-[80vh] overflow-hidden">
          <div className="lg:w-1/2 w-full overflow-y-auto pr-2">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Field Name */}
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        placeholder="Enter field name"
                        className="mt-2"
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <Label className="mb-2">Field Type</Label>
                      <div className="w-full">
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(index, { type: value as FieldType })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Validation Flags */}
                    <div className="flex items-center space-x-3 pt-6">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(index, { required: checked })}
                      />
                      <Label>Required</Label>

                      <Checkbox
                        checked={field.nullable}
                        onCheckedChange={(checked) => updateField(index, { nullable: checked })}
                      />
                      <Label>Nullable</Label>
                    </div>
                  </div>

                  {/* Type-specific configurations */}
                  {renderFieldTypeSpecificInputs(field, index)}

                  <div>
                    <Label>Custom Error Message</Label>
                    <Textarea
                      value={field.customMessage}
                      onChange={(e) => updateField(index, { customMessage: e.target.value })}
                      placeholder="Optional custom error message"
                      className="mt-2"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => removeField(index)}
                    className="mt-2"
                    disabled={fields.length === 1}
                  >
                    <Trash2 /> Remove Field
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Schema */}
          <div className="lg:w-1/2 w-full overflow-y-auto pl-2">
            {generatedSchema && (
              <div className="relative">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSchema);
                    toast("Copied!", { description: "Schema copied to clipboard." });
                  }}
                  className="absolute top-2 right-2 z-10"
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-1" />
                </Button>

                <SyntaxHighlighter
                  language="typescript"
                  style={oneDark}
                  customStyle={{
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#282c34',
                    fontSize: '0.875rem',
                  }}
                  wrapLines
                >
                  {generatedSchema}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YupSchemaGenerator;