import type { ComponentType } from 'react';
import { TextField } from './TextField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { UrlField } from './UrlField';
import { TelField } from './TelField';
import { NumberField } from './NumberField';
import { StepperField } from './StepperField';
import { TextareaField } from './TextareaField';
import { SelectField } from './SelectField';
import { ToggleField } from './ToggleField';
import { CheckboxField } from './CheckboxField';
import { CheckboxListField } from './CheckboxListField';
import { RadioField } from './RadioField';
import { ToggleButtonsField } from './ToggleButtonsField';
import { DateField } from './DateField';
import { TimeField } from './TimeField';
import { DateRangeField } from './DateRangeField';
import { ColorPickerField } from './ColorPickerField';
import { FileUploadField } from './FileUploadField';
import { ImageUploadField } from './ImageUploadField';
import { TagsField } from './TagsField';
import { KeyValueField } from './KeyValueField';
import { RepeaterField } from './RepeaterField';
import { HiddenField } from './HiddenField';
import { PlaceholderField } from './PlaceholderField';
import { SlugField } from './SlugField';
import { MoneyField } from './MoneyField';
import { PercentField } from './PercentField';
import { BelongsToField } from './BelongsToField';
import { RichEditorField } from './RichEditorField';

export {
    TextField,
    EmailField,
    PasswordField,
    UrlField,
    TelField,
    NumberField,
    StepperField,
    TextareaField,
    SelectField,
    ToggleField,
    CheckboxField,
    CheckboxListField,
    RadioField,
    ToggleButtonsField,
    DateField,
    TimeField,
    DateRangeField,
    ColorPickerField,
    FileUploadField,
    ImageUploadField,
    TagsField,
    KeyValueField,
    RepeaterField,
    HiddenField,
    PlaceholderField,
    SlugField,
    MoneyField,
    PercentField,
    BelongsToField,
    RichEditorField,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldComponentMap: Record<string, ComponentType<any>> = {
    text: TextField,
    email: EmailField,
    password: PasswordField,
    url: UrlField,
    tel: TelField,
    number: NumberField,
    stepper: StepperField,
    textarea: TextareaField,
    select: SelectField,
    toggle: ToggleField,
    checkbox: CheckboxField,
    checkboxList: CheckboxListField,
    radio: RadioField,
    toggleButtons: ToggleButtonsField,
    date: DateField,
    time: TimeField,
    dateRange: DateRangeField,
    colorPicker: ColorPickerField,
    fileUpload: FileUploadField,
    imageUpload: ImageUploadField,
    tags: TagsField,
    keyValue: KeyValueField,
    repeater: RepeaterField,
    hidden: HiddenField,
    placeholder: PlaceholderField,
    slug: SlugField,
    money: MoneyField,
    percent: PercentField,
    belongsTo: BelongsToField,
    richEditor: RichEditorField,
};
