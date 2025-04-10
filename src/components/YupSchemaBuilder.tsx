import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type ConditionType =
  | 'equals'
  | 'notEquals'
  | 'defined'
  | 'undefined'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual';

interface ConditionalValidation {
  enabled: boolean;
  dependsOn: string;
  condition: ConditionType;
  value: string;
  then: {
    required: boolean;
    type?: FieldType;
  };
  otherwise: {
    required: boolean;
    type?: FieldType;
  };
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
  conditionalValidation: ConditionalValidation;
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
  conditionalValidation?: Partial<ConditionalValidation>;
}

interface ObjectFieldUpdate {
  name?: string;
  type?: Exclude<FieldType, 'array' | 'object'>;
  required?: CheckedState;
}

const YupSchemaGenerator = () => {
  const defaultSchema = `import * as Yup from 'yup';\n\nconst validationSchema = Yup.object({\n});\n\nexport default validationSchema;`;

  const initialConditionalValidation: ConditionalValidation = {
    enabled: false,
    dependsOn: '',
    condition: 'equals',
    value: '',
    then: {
      required: true,
      type: undefined,
    },
    otherwise: {
      required: false,
      type: undefined,
    },
  };

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
    arrayMax: '',
    conditionalValidation: { ...initialConditionalValidation },
  };

  const [fields, setFields] = useState<Field[]>([{ ...initialField }]);
  const [generatedSchema, setGeneratedSchema] = useState<string>('');

  const fieldTypes: FieldType[] = ['string', 'number', 'boolean', 'date', 'array', 'object'];

  const conditionTypes = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lesserThan', label: 'Less Than' },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
    { value: 'defined', label: 'Is Defined' },
    { value: 'undefined', label: 'Is Undefined' },
  ];

  const addField = (): void => {
    setFields([{ ...initialField }, ...fields]);
  };

  const addObjectField = (fieldIndex: number): void => {
    const newFields = [...fields];
    newFields[fieldIndex].objectFields.push({
      name: '',
      type: 'string',
      required: false,
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

    if (updates.conditionalValidation) {
      typedUpdates.conditionalValidation = {
        ...newFields[index].conditionalValidation,
        ...updates.conditionalValidation,
      };
    }

    newFields[index] = { ...newFields[index], ...typedUpdates };
    setFields(newFields);
  };

  const updateConditionalValidation = (
    fieldIndex: number,
    part: 'then' | 'otherwise',
    updates: Partial<ConditionalValidation['then']>
  ): void => {
    const newFields = [...fields];
    newFields[fieldIndex].conditionalValidation[part] = {
      ...newFields[fieldIndex].conditionalValidation[part],
      ...updates,
    };
    setFields(newFields);
  };

  const updateObjectField = (
    fieldIndex: number,
    objectFieldIndex: number,
    updates: ObjectFieldUpdate
  ): void => {
    const newFields = [...fields];

    const typedUpdates: Partial<ObjectField> = {};

    if (updates.name !== undefined) typedUpdates.name = updates.name;
    if (updates.type !== undefined) typedUpdates.type = updates.type;
    if (updates.required !== undefined) typedUpdates.required = updates.required === true;

    newFields[fieldIndex].objectFields[objectFieldIndex] = {
      ...newFields[fieldIndex].objectFields[objectFieldIndex],
      ...typedUpdates,
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

  // Get dependent field type
  const getDependentFieldType = (fieldName: string): FieldType | null => {
    const field = fields.find((f) => f.name === fieldName);
    return field ? field.type : null;
  };

  // Check if a field is numeric
  const isNumericField = (fieldType: FieldType | null): boolean => {
    return fieldType === 'number';
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
    let schemaCode = "import * as Yup from 'yup';\n\n";
    schemaCode += 'const validationSchema = Yup.object({\n';

    fields.forEach((field) => {
      if (!field.name) return;

      let fieldSchema = `  ${field.name}: `;

      // Start base validation
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

      // conditional validation
      if (
        field.conditionalValidation &&
        field.conditionalValidation.enabled &&
        field.conditionalValidation.dependsOn
      ) {
        const dependentFieldType = getDependentFieldType(field.conditionalValidation.dependsOn);
        const isNumeric = isNumericField(dependentFieldType);

        fieldSchema += `.when('${field.conditionalValidation.dependsOn}', {\n`;

        switch (field.conditionalValidation.condition) {
          case 'equals':
            if (isNumeric) {
              fieldSchema += `    is: ${field.conditionalValidation.value},\n`;
            } else {
              fieldSchema += `    is: ${JSON.stringify(field.conditionalValidation.value)},\n`;
            }
            break;
          case 'notEquals':
            if (isNumeric) {
              fieldSchema += `    is: (val) => val !== ${field.conditionalValidation.value},\n`;
            } else {
              fieldSchema += `    is: (val) => val !== ${JSON.stringify(
                field.conditionalValidation.value
              )},\n`;
            }
            break;
          case 'defined':
            fieldSchema += `    is: (val) => val !== undefined && val !== null && val !== '',\n`;
            break;
          case 'undefined':
            fieldSchema += `    is: (val) => val === undefined || val === null || val === '',\n`;
            break;
          case 'greaterThan':
            fieldSchema += `    is: (val) => val > ${field.conditionalValidation.value},\n`;
            break;
          case 'lessThan':
            fieldSchema += `    is: (val) => val < ${field.conditionalValidation.value},\n`;
            break;
          case 'greaterThanOrEqual':
            fieldSchema += `    is: (val) => val >= ${field.conditionalValidation.value},\n`;
            break;
          case 'lessThanOrEqual':
            fieldSchema += `    is: (val) => val <= ${field.conditionalValidation.value},\n`;
            break;
        }

        // Then conditon
        fieldSchema += `    then: (schema) => schema`;
        if (field.conditionalValidation.then.required) {
          fieldSchema += `.required("${field.customMessage || `${field.name} is required`}")`;
        } else {
          fieldSchema += `.notRequired()`;
        }
        fieldSchema += `,\n`;

        // Otherwise condition
        fieldSchema += `    otherwise: (schema) => schema`;
        if (field.conditionalValidation.otherwise.required) {
          fieldSchema += `.required("${field.customMessage || `${field.name} is required`}")`;
        } else {
          fieldSchema += `.notRequired()`;
        }
        fieldSchema += `\n  })`;
      } else {
        if (field.required) {
          fieldSchema += `.required("${field.customMessage || `${field.name} is required`}")`;
        } else {
          fieldSchema += '.notRequired()';
        }
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

  console.log(generatedSchema);

  const renderFieldTypeSpecificInputs = (field: Field, index: number) => {
    switch (field.type) {
      case 'string':
        return (
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <Label>Min Length</Label>
              <Input
                type='number'
                value={field.minLength}
                onChange={(e) => updateField(index, { minLength: e.target.value })}
                placeholder='Minimum length'
                className='mt-2'
              />
            </div>
            <div>
              <Label>Max Length</Label>
              <Input
                type='number'
                value={field.maxLength}
                onChange={(e) => updateField(index, { maxLength: e.target.value })}
                placeholder='Maximum length'
                className='mt-2'
              />
            </div>
          </div>
        );
      case 'number':
        return (
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <Label>Min Value</Label>
              <Input
                type='number'
                value={field.min}
                onChange={(e) => updateField(index, { min: e.target.value })}
                placeholder='Minimum value'
                className='mt-2'
              />
            </div>
            <div>
              <Label>Max Value</Label>
              <Input
                type='number'
                value={field.max}
                onChange={(e) => updateField(index, { max: e.target.value })}
                placeholder='Maximum value'
                className='mt-2'
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
      <div className='space-y-3'>
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <Label className='mb-2'>Array Element Type</Label>
            <Select
              value={field.arrayType}
              onValueChange={(value) =>
                updateField(index, {
                  arrayType: value as Exclude<FieldType, 'array'>,
                  arrayOfObject: value === 'object',
                })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes
                  .filter((t) => t !== 'array')
                  .map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Min Array Length</Label>
            <Input
              type='number'
              value={field.arrayMin}
              onChange={(e) => updateField(index, { arrayMin: e.target.value })}
              placeholder='Minimum count'
              className='mt-2'
            />
          </div>

          <div>
            <Label>Max Array Length</Label>
            <Input
              type='number'
              value={field.arrayMax}
              onChange={(e) => updateField(index, { arrayMax: e.target.value })}
              className='mt-2'
              placeholder='Maximum count'
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
        <div className='flex justify-between items-center mb-2'>
          <Label>Object Fields</Label>
          <Button
            onClick={() => addObjectField(index)}
            size='sm'
            variant='link'
            className='underline'
          >
            <Plus /> Add Object Field
          </Button>
        </div>

        {field.objectFields.map((objField, objIndex) => (
          <div
            key={objIndex}
            className='border p-2 rounded mb-2 grid grid-cols-3 gap-2 items-center'
          >
            <Input
              placeholder='Field Name'
              value={objField.name}
              onChange={(e) => updateObjectField(index, objIndex, { name: e.target.value })}
            />

            <Select
              value={objField.type}
              onValueChange={(value) =>
                updateObjectField(index, objIndex, {
                  type: value as Exclude<FieldType, 'array' | 'object'>,
                })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Type' />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes
                  .filter((t) => t !== 'array' && t !== 'object')
                  .map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className='flex items-center'>
              <Checkbox
                checked={objField.required}
                onCheckedChange={(checked) =>
                  updateObjectField(index, objIndex, { required: checked })
                }
              />
              <Label className='ml-2'>Required</Label>

              <Button
                variant='destructive'
                size='icon'
                onClick={() => removeObjectField(index, objIndex)}
                className='ml-2'
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderConditionalValidation = (field: Field, index: number) => {
    const conditionalValidation = field.conditionalValidation || initialConditionalValidation;

    return (
      <div className='border p-3 rounded-lg mt-3'>
        <div className='flex items-center mb-3'>
          <Checkbox
            checked={conditionalValidation.enabled}
            onCheckedChange={(checked) =>
              updateField(index, {
                conditionalValidation: { enabled: checked === true },
              })
            }
          />
          <Label className='ml-2 font-semibold'>Use Conditional Validation</Label>
        </div>

        {conditionalValidation.enabled && (
          <div className='space-y-3'>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label>Depends On Field</Label>
                <Select
                  value={conditionalValidation.dependsOn}
                  onValueChange={(value) =>
                    updateField(index, {
                      conditionalValidation: { dependsOn: value },
                    })
                  }
                >
                  <SelectTrigger className='w-full mt-2'>
                    <SelectValue placeholder='Select field' />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map(
                      (f, i) =>
                        // Don't allow self-dependency
                        i !== index &&
                        f.name && (
                          <SelectItem key={i} value={f.name}>
                            {f.name}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condition</Label>
                <Select
                  value={conditionalValidation.condition}
                  onValueChange={(value: ConditionType) =>
                    updateField(index, {
                      conditionalValidation: { condition: value },
                    })
                  }
                >
                  <SelectTrigger className='w-full mt-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(conditionalValidation.condition === 'equals' ||
                conditionalValidation.condition === 'notEquals' ||
                conditionalValidation.condition === 'greaterThan' ||
                conditionalValidation.condition === 'lessThan' ||
                conditionalValidation.condition === 'greaterThanOrEqual' ||
                conditionalValidation.condition === 'lessThanOrEqual') && (
                <div>
                  <Label>Value</Label>
                  <Input
                    value={conditionalValidation.value}
                    onChange={(e) =>
                      updateField(index, {
                        conditionalValidation: { value: e.target.value },
                      })
                    }
                    type={
                      isNumericField(getDependentFieldType(conditionalValidation.dependsOn))
                        ? 'number'
                        : 'text'
                    }
                    placeholder='Comparison value'
                    className='mt-2'
                  />
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4 mt-3'>
              <div className='border p-2 rounded-lg'>
                <Label className='font-semibold'>Then</Label>
                <div className='flex items-center mt-2'>
                  <Checkbox
                    checked={conditionalValidation.then.required}
                    onCheckedChange={(checked) =>
                      updateConditionalValidation(index, 'then', {
                        required: checked === true,
                      })
                    }
                  />
                  <Label className='ml-2'>Required</Label>
                </div>
              </div>

              <div className='border p-2 rounded-lg'>
                <Label className='font-semibold'>Otherwise</Label>
                <div className='flex items-center mt-2'>
                  <Checkbox
                    checked={conditionalValidation.otherwise.required}
                    onCheckedChange={(checked) =>
                      updateConditionalValidation(index, 'otherwise', {
                        required: checked === true,
                      })
                    }
                  />
                  <Label className='ml-2'>Required</Label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='mx-auto p-4'>
      <Card className='w-ful card-grainy max-w-full mx-auto shadow-2xl'>
        <CardHeader className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
          <div className='flex gap-2 flex-wrap'>
            <Button onClick={addField} size='sm'>
              <Plus /> Add Field
            </Button>
            <Button
              onClick={generateSchema}
              size='sm'
              variant='default'
              className='bg-pink-600 hover:bg-pink-500'
            >
              <Hammer /> Build Schema
            </Button>
          </div>
        </CardHeader>

        <CardContent className='flex flex-col lg:flex-row gap-4 max-h-[80vh] overflow-hidden'>
          <div className='lg:w-1/2 w-full overflow-y-auto pr-2'>
            <div className='space-y-4'>
              {fields.map((field, index) => (
                <div key={index} className='border p-4 rounded-lg space-y-3'>
                  <div className='grid grid-cols-3 gap-4'>
                    {/* Field Name */}
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        placeholder='Enter field name'
                        className='mt-2'
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <Label className='mb-2'>Field Type</Label>
                      <div className='w-full'>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            updateField(index, { type: value as FieldType })
                          }
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Validation Flags */}
                    <div className='flex items-center space-x-3 pt-6'>
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

                  {/* Conditional validations */}
                  {renderConditionalValidation(field, index)}

                  <div>
                    <Label>Custom Error Message</Label>
                    <Textarea
                      value={field.customMessage}
                      onChange={(e) => updateField(index, { customMessage: e.target.value })}
                      placeholder='Optional custom error message'
                      className='mt-2'
                    />
                  </div>

                  <Button
                    variant='destructive'
                    onClick={() => removeField(index)}
                    className='mt-2'
                    disabled={fields.length === 1}
                  >
                    <Trash2 /> Remove Field
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Schema */}
          <div className='lg:w-1/2 w-full overflow-y-auto pl-2'>
            <div className='relative'>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedSchema);
                  toast('Copied!', {
                    description: 'Schema copied to clipboard.',
                  });
                }}
                className='absolute top-2 right-2 z-10'
                size='sm'
                variant='outline'
              >
                <Copy className='w-4 h-4 mr-1' />
              </Button>

              <SyntaxHighlighter
                language='typescript'
                style={oneDark}
                customStyle={{
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  backgroundColor: '#282c34',
                  fontSize: '0.875rem',
                }}
                wrapLines
              >
                {generatedSchema || defaultSchema}
              </SyntaxHighlighter>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YupSchemaGenerator;
