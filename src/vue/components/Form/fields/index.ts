import type { Component } from 'vue';
import TextField from './TextField.vue';
import EmailField from './EmailField.vue';
import PasswordField from './PasswordField.vue';
import UrlField from './UrlField.vue';
import TelField from './TelField.vue';
import NumberField from './NumberField.vue';
import StepperField from './StepperField.vue';
import TextareaField from './TextareaField.vue';
import SelectField from './SelectField.vue';
import ToggleField from './ToggleField.vue';
import CheckboxField from './CheckboxField.vue';
import CheckboxListField from './CheckboxListField.vue';
import RadioField from './RadioField.vue';
import ToggleButtonsField from './ToggleButtonsField.vue';
import DateField from './DateField.vue';
import TimeField from './TimeField.vue';
import DateRangeField from './DateRangeField.vue';
import ColorPickerField from './ColorPickerField.vue';
import FileUploadField from './FileUploadField.vue';
import ImageUploadField from './ImageUploadField.vue';
import TagsField from './TagsField.vue';
import KeyValueField from './KeyValueField.vue';
import RepeaterField from './RepeaterField.vue';
import HiddenField from './HiddenField.vue';
import PlaceholderField from './PlaceholderField.vue';
import SlugField from './SlugField.vue';
import MoneyField from './MoneyField.vue';
import PercentField from './PercentField.vue';
import BelongsToField from './BelongsToField.vue';
import RichEditorField from './RichEditorField.vue';
import OtpField from './OtpField.vue';
import MaskedField from './MaskedField.vue';
import RatingField from './RatingField.vue';
import CodeField from './CodeField.vue';
import MarkdownEditorField from './MarkdownEditorField.vue';

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
    OtpField,
    MaskedField,
    RatingField,
    CodeField,
    MarkdownEditorField,
};

export const fieldComponentMap: Record<string, Component> = {
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
    otp: OtpField,
    masked: MaskedField,
    rating: RatingField,
    code: CodeField,
    markdownEditor: MarkdownEditorField,
};
