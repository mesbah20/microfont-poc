# Angular Controls Documentation

This documentation provides comprehensive information about all the custom controls and components available in the application. Each component follows a consistent format with features, import statements, parameter tables, and usage examples.

## Table of Contents
1. [TextBaseInput](#textbaseinput)
2. [Button](#button)
3. [AmountInput](#amountinput)
4. [OfficeBox](#officebox)
5. [TextArea](#textarea)
6. [TimeInput](#timeinput)
7. [Switch](#switch)
8. [DateInput](#dateinput)
9. [FileInput](#fileinput)
10. [NumberInput](#numberinput)
11. [AmountInWord](#amountInword)
12. [SelectOptionField](#selectoptionfield)
13. [Data Grid Component](#data-grid-component)
14. [Expansion Panel Controls](#expansion-panel-controls)
15. [Modal Components](#modal-components)
16. [Multi-Select Components](#multi-select-components)
17. [Navbar Action Controls](#navbar-action-controls)

---

## TextBaseInput

🚀 **Features**
• Works with Reactive Forms (FormGroup, FormControl)
• Supports min/max length validation
• Prevents special characters when disabled
• Tooltip support with configurable position & class
• Custom error messages
• Readonly mode
• Vertical or horizontal layout
• Clear button to reset input
• Output events for value changes, double click, blur and F8 key events

📦 **Importing the Component**
```typescript
import { TextBaseInput } from './text-base-input';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | The parent form group (required) |
| controlName | string | — | Form control name (required) |
| label | string | — | Label text displayed above input (required) |
| type | string | 'text' | Input type (text, number, password, etc.) |
| isReadonly | boolean | false | Makes input readonly |
| placeholder | string | 'Enter ' + label | Placeholder text |
| minLength | number | — | Minimum length validation |
| maxLength | number | — | Maximum length validation |
| displayMode | 'horizontal' \| 'vertical' \| 'outline' | 'vertical' | Layout orientation |
| isAllowSpecialChars | boolean | true | Prevents special characters if false |
| tooltip | string | '' | Tooltip text |
| tooltipPosition | 'above' \| 'below' \| 'left' \| 'right' | 'above' | Tooltip position |
| tooltipDelay | number | 500 | Tooltip show delay in ms |
| tooltipClass | string | 'custom-tooltip' | CSS class for tooltip |
| customErrorMessages | { [key: string]: string } | {} | Custom error messages map |
| isVertical | boolean | false | Enable vertical layout |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| onDoubleClick | void | Emits when input is double-clicked |
| valueChanged | string | Emits when value changes |
| onChanged | any | Emits control changes |
| onBlurred | any | Emits when input loses focus |
| onF8 | void | Emits when F8 key is pressed (shortcut event) |

📚 **Usage Examples**
```html
<app-text-base-input [frmGroup]='form' [controlName]="'firstName'" [label]="'First Name'"></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'password'" [label]="'Password'" [type]="'password'"></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'city'" [label]="'City'" [placeholder]="'Enter your city name'"></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'employeeId'" [label]="'Employee ID'" [isReadonly]='true'></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'username'" [label]="'Username'" [minLength]='3' [maxLength]='10'></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'phone'" [label]="'Phone Number'" [isVertical]='true'></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'username'" [label]="'Username'" [isAllowSpecialChars]='false'></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'email'" [label]="'Email'" [tooltip]="'We will never share your email.'" [tooltipPosition]="'right'" [tooltipClass]="'info-tooltip'"></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'email'" [label]="'Email'" [customErrorMessages]="{ email: 'Please enter a valid email address', domain: 'Email must be from company.com' }"></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'customerCode'" [label]="'Customer Code'" (onDoubleClick)='openCustomerLookup()'></app-text-base-input>
<app-text-base-input [frmGroup]='form' [controlName]="'phone'" [label]="'Phone'" (valueChanged)='onPhoneChanged($event)'></app-text-base-input>
```

---

## Button

🚀 **Features**
• Material Design icons support
• Enable/disable functionality
• Visibility control
• Custom CSS classes and inline styles
• Click event handling
• Value change events
• Consistent theming

📦 **Importing the Component**
```typescript
import { ButtonComponent } from './button';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | string | '' | Button ID attribute |
| value | string | '' | Button value |
| cssClass | string | '' | Additional CSS classes |
| styles | string | '' | Inline styles |
| enable | boolean | true | Enable/disable button |
| visible | boolean | true | Show/hide button |
| labelText | string | '' | Button label text |
| icon | string | '' | Material icon name |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| valueChanged | string | Fired when button value changes |
| onClick | MouseEvent | Fired when button clicked |

📚 **Usage Examples**
```html
<lds-btn labelText="Save" icon="save" (onClick)="saveForm()"></lds-btn>
<lds-btn labelText="Delete" icon="delete" cssClass="btn-danger" [enable]="canDelete" (onClick)="deleteItem()"></lds-btn>
<lds-btn labelText="Download" icon="download" value="pdf" (onClick)="downloadFile($event)" (valueChanged)="onValueChange($event)"></lds-btn>
<lds-btn labelText="Submit" [enable]="formValid" cssClass="btn-primary" (onClick)="submitForm()"></lds-btn>
```

## AmountInput

🚀 **Features**
• Amount validation with min/max constraints
• Decimal places control
• Leading zeros prevention
• Negative amount handling
• Numeric-only input with decimal support
• Clear functionality with built-in button
• Multiple display modes (vertical/horizontal/outline)
• Tooltip support with positioning
• Reactive forms integration

📦 **Importing the Component**
```typescript
import { AmountInputComponent } from './amount-input';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| label | string | — | Input label (required) |
| displayMode | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| decimalPlaces | number | 2 | Number of decimal places allowed |
| allowLeadingZeros | boolean | false | Allow leading zeros in input |
| allowNegative | boolean | true | Allow negative amounts |
| maxLen | number | undefined | Maximum length of input |
| maxAmt | number | undefined | Maximum amount allowed |
| tooltip | string | '' | Tooltip text |
| tooltipPosition | string | 'above' | Tooltip position |
| isReadonly | boolean | false | Read-only state |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| onBlurred | void | Fired when input loses focus |
| onChanged | number | Fired when amount value changes |
| onInput | Event | Fired on input events |
| onChange | Event | Fired on change events |

📚 **Usage Examples**
```html
<lds-amount [frmGroup]="frmGroup" [controlName]="'amount'" [label]="'Transaction Amount'" displayMode="outline" [decimalPlaces]="2" [allowLeadingZeros]="false" [maxLen]="12" [tooltip]="'Amount affects tax calculation'" (onBlurred)="onBlur($event)" (onChanged)="onAmountChanged($event)"></lds-amount>
<lds-amount [frmGroup]="frmGroup" [controlName]="'budgetAmount'" [label]="'Budget Amount'" displayMode="horizontal" [decimalPlaces]="2" [allowNegative]="false" [maxAmt]="1000000" [tooltip]="'Maximum budget amount is 1M'" (onChanged)="updateBudget($event)"></lds-amount>
<lds-amount [frmGroup]="frmGroup" [controlName]="'salary'" [label]="'Monthly Salary'" [decimalPlaces]="2" [maxLen]="10" [isReadonly]="false" (onChanged)="calculateTax($event)"></lds-amount>
```

---

## OfficeBox

🚀 **Features**
• Office code lookup with automatic name display
• Real-time office name updates
• Character restrictions and length validation
• Built-in office database mappings
• Multiple display modes support
• Input validation with error handling
• Reactive forms integration
• Tooltip support

📦 **Importing the Component**
```typescript
import { OfficeBoxComponent } from './office-box';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| labelText | string | — | Input label (required) |
| displayMode | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| id | string | '' | Input ID attribute |
| placeholder | string | 'Enter Office Code' | Placeholder text |
| enable | boolean | true | Enable/disable input |
| visible | boolean | true | Show/hide input |
| isReadonly | boolean | false | Read-only state |
| allowSpecialChars | boolean | false | Allow special characters |
| maxLen | number | undefined | Maximum length |
| minLen | number | undefined | Minimum length |
| tooltip | string | '' | Tooltip text |
| tooltipPosition | string | 'above' | Tooltip position |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| valueChanged | number | Fired when office code value changes |
| onChanged | {officeCode: string, officeName: string} | Fired with office details |
| onBlurred | any | Fired when input loses focus |

📚 **Usage Examples**
```html
<lds-office-box [frmGroup]="frmGroup" [controlName]="'officeCode'" [labelText]="'Office Code'" displayMode="outline" [enable]="true" [visible]="true" [maxLen]="4" [placeholder]="'Enter office code'" (onChanged)="onOfficeSelected($event)"></lds-office-box>
<lds-office-box [frmGroup]="frmGroup" [controlName]="'branchOffice'" [labelText]="'Branch Office'" displayMode="horizontal" [allowSpecialChars]="false" [maxLen]="4" [minLen]="3" [tooltip]="'Enter valid office code'" (onChanged)="updateBranchInfo($event)" (onBlurred)="validateOffice($event)"></lds-office-box>
```

## TextArea

🚀 **Features**
• Auto-resize functionality based on content
• Configurable min/max rows with auto-expansion
• Character validation with error display
• Vertical/horizontal layout options
• Optional row count display
• Integration with reactive forms validation
• Width and column controls
• Placeholder support

📦 **Importing the Component**
```typescript
import { TextAreaComponent } from './text-area';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| labelText | string | — | Input label (required) |
| id | string | '' | Textarea ID attribute |
| placeholder | string | '' | Placeholder text |
| isVertical | boolean | true | Vertical layout mode |
| rows | number | 3 | Initial number of rows |
| minRows | number | 1 | Minimum number of rows |
| maxRows | number | 10 | Maximum number of rows |
| maxCols | number | undefined | Maximum number of columns |
| width | string | '100%' | Textarea width |
| showRowCount | boolean | false | Show row count indicator |
| tooltip | string | '' | Tooltip text |
| tooltipPosition | string | 'above' | Tooltip position |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| onChanged | string | Fired when textarea value changes |

📚 **Usage Examples**
```html
<lds-txt-area [frmGroup]="frmGroup" [controlName]="'description'" [labelText]="'Description'" [rows]="3" [maxRows]="8" [placeholder]="'Enter detailed description...'" (onChanged)="onDescriptionChange($event)"></lds-txt-area>
<lds-txt-area [frmGroup]="frmGroup" [controlName]="'notes'" [labelText]="'Additional Notes'" [isVertical]="false" [rows]="4" [minRows]="2" [maxRows]="12" [width]="'100%'" [showRowCount]="true" [tooltip]="'Add any additional comments'" (onChanged)="onNotesChange($event)"></lds-txt-area>
<lds-txt-area [frmGroup]="frmGroup" [controlName]="'comments'" [labelText]="'Comments'" [placeholder]="'Enter your comments here...'" [rows]="5" [maxRows]="15" [maxCols]="80" [showRowCount]="true" (onChanged)="updateComments($event)"></lds-txt-area>
```

---

## TimeInput

🚀 **Features**
• Automatic 24-hour to 12-hour format conversion
• Min/max time constraints with validation
• Native HTML5 time input for better UX
• Time display in 12-hour format with AM/PM
• Proper ARIA labeling and keyboard support
• Static method for reverse conversion
• Reactive forms integration
• Read-only mode support

📦 **Importing the Component**
```typescript
import { TimeInputComponent } from './time-input';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| label | string | — | Input label (required) |
| minTime | string | '00:00' | Minimum allowed time |
| maxTime | string | '23:59' | Maximum allowed time |
| isReadonly | boolean | false | Read-only state |
| placeholder | string | '--:--' | Placeholder text |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| timeChange | string | Fired when time value changes (12-hour format) |

📚 **Usage Examples**
```html
<app-time-input [frmGroup]="reminderForm" [controlName]="'reminderTime'" label="Reminder Time" [minTime]="'09:00'" [maxTime]="'18:00'" (timeChange)="onReminderTimeChange($event)"></app-time-input>
<app-time-input [frmGroup]="scheduleForm" [controlName]="'startTime'" label="Start Time" [minTime]="'08:00'" [maxTime]="'20:00'" placeholder="Select start time" (timeChange)="updateSchedule($event)"></app-time-input>
<app-time-input [frmGroup]="meetingForm" [controlName]="'meetingTime'" label="Meeting Time" [minTime]="'09:00'" [maxTime]="'17:00'" [isReadonly]="meetingLocked" (timeChange)="scheduleMeeting($event)"></app-time-input>
```

---

## Switch

🚀 **Features**
• Reactive form integration with FormGroup and FormControl
• Visual state indicators (checkmark/X icons)
• Smooth toggle animations
• Boolean value conversion and validation
• Enable/disable functionality
• Visibility control
• Custom CSS classes and styling
• Accessibility features with proper ARIA labels

📦 **Importing the Component**
```typescript
import { SwitchComponent } from './switch';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| id | string | '' | Switch ID |
| value | string | '' | Switch value |
| labelText | string | '' | Label text |
| isChecked | boolean | false | Initial checked state |
| enable | boolean | true | Enable/disable switch |
| visible | boolean | true | Show/hide switch |
| isVisible | boolean | true | Alternative visibility control |
| cssClass | string | '' | Additional CSS classes |
| style | string | '' | Inline styles |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| isCheckedChanged | boolean | Fired when checked state changes |
| onSwitchChanged | boolean | Fired when switch toggled |

📚 **Usage Examples**
```html
<lds-switch [frmGroup]="settingsForm" [controlName]="'emailNotifications'" [labelText]="'Email Notifications'" [isChecked]="true" (onSwitchChanged)="updateNotificationSettings($event)"></lds-switch>
<lds-switch [frmGroup]="frmGroup" [controlName]="'switch'" [labelText]="'Express Processing'" [isChecked]="frmGroup.get('switch')?.value || false"></lds-switch>
<lds-switch [frmGroup]="userForm" [controlName]="'isActive'" [labelText]="'Active User'" [enable]="canEdit" (isCheckedChanged)="onUserStatusChange($event)"></lds-switch>
```

## DateInput

🚀 **Features**
• Calendar popup with intuitive date selection
• Optional time input integration
• Custom date format support (YYYY-MM-DD, DD/MM/YYYY, etc.)
• Min/max date constraints with validation
• Year range validation controls
• Keyboard navigation and accessibility
• Multiple display modes (vertical/horizontal)
• Reactive forms integration
• Real-time validation feedback

📦 **Importing the Component**
```typescript
import { DateInputComponent } from './date-input';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| label | string | — | Input label (required) |
| displayMode | string | 'vertical' | Layout mode (vertical/horizontal) |
| dateFormat | string | 'YYYY-MM-DD' | Date format pattern |
| maxYear | number | current + 10 | Maximum allowed year |
| minYear | number | current - 50 | Minimum allowed year |
| includeTime | number | 0 | Time input mode (0=none, 1=hours, 2=hours+minutes) |
| enableYearRangeValidation | boolean | true | Enable min/max year validation |
| isReadonly | boolean | false | Read-only state |
| placeholder | string | 'Select date' | Placeholder text |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| onBlurred | void | Fired when input loses focus |
| onChanged | string | Fired when date value changes |
| onDateSelected | Date | Fired when date is selected from calendar |

📚 **Usage Examples**
```html
<app-date-input [frmGroup]="frmGroup" [controlName]="'date'" [label]="'Transaction Date'" displayMode="vertical" [dateFormat]="'YYYY-MM-DD'" [maxYear]="2034" [includeTime]="2" [enableYearRangeValidation]="false" (onBlurred)="onBlur($event)"></app-date-input>
<app-date-input [frmGroup]="eventForm" [controlName]="'eventDate'" [label]="'Event Date'" [dateFormat]="'DD/MM/YYYY'" [minYear]="2024" [maxYear]="2025" (onDateSelected)="onEventDateSelected($event)"></app-date-input>
<app-date-input [frmGroup]="bookingForm" [controlName]="'checkIn'" [label]="'Check-in Date'" [includeTime]="1" displayMode="horizontal" (onChanged)="updateBookingDates($event)"></app-date-input>
```

---

## FileInput

🚀 **Features**
• Drag and drop file upload interface
• File type filtering by extension
• Single or multiple file selection
• Custom file naming and save paths
• File size validation and restrictions
• Upload progress tracking
• Custom styling with CSS classes
• Vertical/horizontal layout options
• File selection change events

📦 **Importing the Component**
```typescript
import { FileInputComponent } from './file-input';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | string | — | File input ID (required) |
| multipleFile | boolean | false | Allow multiple file selection |
| fileExtension | string | '' | Allowed file extensions (e.g., .pdf, .jpg) |
| isVertical | boolean | true | Vertical layout mode |
| labelText | string | '' | Upload area label text |
| cssClass | string | '' | Custom CSS classes for styling |
| savePath | string | '' | Custom save directory path |
| customFileName | string | '' | Custom file name prefix |
| maxFileSize | number | undefined | Maximum file size in MB |
| acceptedTypes | string[] | [] | Array of accepted MIME types |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| selectedFilesChanged | FileList | Fired when files are selected |
| onFileChanged | string | Fired when file input changes with context |
| onFileError | string | Fired when file validation fails |
| onUploadProgress | number | Fired during upload with progress percentage |

📚 **Usage Examples**
```html
<lds-file #pdfFileInput [id]="'pdf-upload'" [multipleFile]="false" [fileExtension]="'.pdf'" [isVertical]="false" [labelText]="'Upload Supporting Document'" [cssClass]="'border-green-300 bg-green-50'" [savePath]="'documents/transactions'" [customFileName]="'transaction-document'" (selectedFilesChanged)="onPdfSelected($event)" (onFileChanged)="onFileInputChanged('Transaction Document')"></lds-file>
<lds-file [id]="'image-upload'" [multipleFile]="true" [fileExtension]="'.jpg,.png,.gif'" [labelText]="'Upload Images'" [maxFileSize]="5" (selectedFilesChanged)="onImagesSelected($event)" (onFileError)="handleFileError($event)"></lds-file>
<lds-file [id]="'document-upload'" [acceptedTypes]="['application/pdf', 'application/msword']" [labelText]="'Upload Documents'" [isVertical]="true" [cssClass]="'custom-upload-area'" (onUploadProgress)="updateProgress($event)"></lds-file>
```

---

## NumberInput

🚀 **Features**
• Numeric-only input with validation
• Min/max value constraints
• Maximum digit length control
• Decimal precision support
• Step increment/decrement functionality
• Scientific notation handling
• Input filtering to prevent non-numeric characters
• Multiple display modes (vertical/horizontal/outline)
• Reactive forms integration
• Custom placeholder and validation messages

📦 **Importing the Component**
```typescript
import { NumberInputComponent } from './number-input';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| label | string | — | Input label (required) |
| displayMode | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| minValue | number | undefined | Minimum allowed value |
| maxValue | number | undefined | Maximum allowed value |
| maxLen | number | undefined | Maximum number of digits |
| step | number | 1 | Step increment for up/down arrows |
| decimalPlaces | number | 0 | Number of decimal places allowed |
| placeholder | string | '' | Placeholder text |
| isReadonly | boolean | false | Read-only state |
| allowNegative | boolean | true | Allow negative numbers |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| onBlurred | void | Fired when input loses focus |
| onChanged | number | Fired when numeric value changes |
| onInput | Event | Fired on input events |
| onFocused | void | Fired when input gains focus |

📚 **Usage Examples**
```html
<lds-number [frmGroup]="frmGroup" [controlName]="'referenceNumber'" [label]="'Reference Number'" displayMode="horizontal" [minValue]="1" [maxValue]="9999" [maxLen]="4" [placeholder]="'Auto-generated number'" (onChanged)="onNumberChanged($event)"></lds-number>
<lds-number [frmGroup]="productForm" [controlName]="'quantity'" [label]="'Quantity'" [minValue]="0" [maxValue]="1000" [step]="1" (onChanged)="updateInventory($event)"></lds-number>
<lds-number [frmGroup]="settingsForm" [controlName]="'percentage'" [label]="'Percentage'" [minValue]="0" [maxValue]="100" [decimalPlaces]="2" [step]="0.1" displayMode="outline" (onBlurred)="validatePercentage($event)"></lds-number>
```

---

## SelectOptionField

🚀 **Features**
• Single selection with searchable options
• Custom option templates and display formatting
• Async data loading with loading indicators
• Validation integration with reactive forms
• Multiple display modes (vertical/horizontal/outline)
• Read-only mode for display purposes
• Tooltip support with configurable positioning
• Custom placeholder and empty state messages
• Option filtering and search functionality
• Dynamic option updates based on other form values

📦 **Importing the Component**
```typescript
import { SelectOptionFieldComponent } from './select-option-field';
```

🛠️ **Inputs & Outputs**

### Inputs
| Input Name | Type | Default | Description |
|------------|------|---------|-------------|
| frmGroup | FormGroup | — | Reactive form group (required) |
| controlName | string | — | Form control name (required) |
| label | string | — | Select field label (required) |
| options | SelectOption[] | [] | Array of selectable options |
| displayMode | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| isVertical | boolean | false | Force vertical layout |
| isReadonly | boolean | false | Read-only state |
| searchable | boolean | true | Enable option search/filtering |
| placeholder | string | 'Select an option' | Placeholder text |
| tooltip | string | '' | Tooltip text |
| emptyStateMessage | string | 'No options available' | Message when no options |
| loadingMessage | string | 'Loading...' | Message during async loading |

### Outputs
| Output Name | Type | Description |
|-------------|------|-------------|
| onSelect | SelectOption | Fired when option is selected |
| onSearch | string | Fired when search term changes |
| onFocus | void | Fired when dropdown gains focus |
| onBlur | void | Fired when dropdown loses focus |

📚 **Usage Examples**
```html
<app-select-option-field [frmGroup]="frmGroup" [controlName]="'currency'" [label]="'Currency'" displayMode="outline" [options]="currencyOptions" [tooltip]="'Currency selection affects country and tax rate'" [searchable]="false" (onSelect)="handleCategorySelection($event)"></app-select-option-field>
<app-select-option-field [frmGroup]="frmGroup" [controlName]="'country'" [label]="'Country'" [isReadonly]="true" [isVertical]="true" [options]="countryOptions" [tooltip]="'Country affects risk level and validation rules'"></app-select-option-field>
<app-select-option-field [frmGroup]="userForm" [controlName]="'department'" [label]="'Department'" [options]="departmentOptions" [searchable]="true" [placeholder]="'Search departments...'" (onSelect)="onDepartmentSelected($event)" (onSearch)="filterDepartments($event)"></app-select-option-field>
```

---

### Update Action (`app-update`)

**Purpose**: Provides an update button for modifying existing data.

**Selector**: `app-update`

**Parameters**: None (uses global form group signal)

**Features**:
- Disabled when form is invalid
- Triggers global update signal

**Usage**:
```html
<app-update></app-update>
```

### View Action (`app-view`)

**Purpose**: Provides a view button for read-only data display.

**Selector**: `app-view`

**Parameters**: None (uses global form group signal)

**Features**:
- Disabled when form is invalid
- Triggers global view signal
- Logs view activity

**Usage**:
```html
<app-view></app-view>
```

---

## Data Grid Component

Located in `src/app/shared/components/data-grid/`

**Purpose**: Advanced data table component with sorting, filtering, pagination, inline editing, and summary capabilities.

**Selector**: `lds-data-grid`

### Input Parameters

#### Basic Configuration
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | '' | Unique identifier for the grid |
| `dataSource` | T[] | [] | Array of data objects to display |
| `initPageSize` | number | 5 | Initial number of rows per page |
| `tblClass` | string | '' | Additional CSS classes for table |
| `gridTitle` | string | '' | Title displayed above the grid |

#### Display Options
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selectedColumns` | string[] | [] | Array of column names to display |
| `customColumnNames` | Record<string, string> | {} | Custom header names for columns |
| `editableColumns` | string[] | [] | Columns that can be edited inline |
| `numberColumns` | string[] | [] | Columns containing numeric data |
| `useInlineEdit` | boolean | true | Enable/disable inline editing |

#### Action Buttons
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `showEditButton` | boolean | false | Show edit action button |
| `showDeleteButton` | boolean | false | Show delete action button |
| `showViewButton` | boolean | false | Show view action button |
| `showProgressButton` | boolean | false | Show progress action button |
| `showPrintButton` | boolean | false | Show print action button |
| `enableSelection` | boolean | false | Enable row selection checkboxes |

#### Advanced Features
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `searchEnabled` | boolean | false | Enable search functionality |
| `groupOptionEnabled` | boolean | false | Enable grouping options |
| `summaryGridEnabled` | boolean | false | Enable summary calculations |
| `summaryGridPosition` | string | 'above' | Position of summary grid |

#### Dropdown Configuration
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `dropdownColumns` | string[] | [] | Columns with dropdown selection |
| `dropdownOptions` | Record<string, DropdownOption[]> | {} | Options for dropdown columns |
| `multiSelectColumns` | string[] | [] | Columns with multi-select dropdowns |
| `dynamicDropdownSources` | Record<string, string> | {} | Dynamic dropdown data sources |

#### Checkbox Configuration
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `checkboxColumns` | string[] | [] | Columns displayed as checkboxes |
| `checkboxSelectAllColumns` | string[] | [] | Checkbox columns with select all |
| `readOnlyCheckboxColumns` | string[] | [] | Read-only checkbox columns |

#### Summary & Grouping
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `summaryColumns` | string[] | [] | Columns to include in summary |
| `groupByColumns` | string[] | [] | Columns available for grouping |

#### Row Styling
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rowDesignerList` | TableRowDesigner[] | [] | Conditional row styling rules |

### Output Events

| Event | Type | Description |
|-------|------|-------------|
| `onSelectAllChange` | {isSelectAll: boolean, selectedRows: T[], count: number} | Fired when select all changes |
| `onFHEditClick` | string | Fired when edit button clicked |
| `onFHDeleteClick` | string | Fired when delete button clicked |
| `onFHViewClick` | string | Fired when view button clicked |
| `onFHProgressClick` | string | Fired when progress button clicked |
| `onChecked` | {data: string, checked: boolean} | Fired when row checked |
| `onPrint` | string | Fired when print button clicked |
| `dataSourceChanged` | T[] | Fired when data source changes |
| `onRowDoubleClick` | string | Fired when row double-clicked |
| `onCheckboxValueChange` | CheckboxChangeEvent | Fired when checkbox value changes |
| `onColumnSelectAll` | ColumnSelectAllEvent | Fired when column select all changes |

### Interfaces

#### GridColumn
```typescript
interface GridColumn {
  property: string;           // Column property name
  header: string;            // Display header text
  isEditable: boolean;       // Can be edited inline
  isNumeric: boolean;        // Numeric data type
  isVisible: boolean;        // Show/hide column
  width?: string;            // Column width
  sortable?: boolean;        // Enable sorting
  filterable?: boolean;      // Enable filtering
  isDropdown?: boolean;      // Dropdown column
  dropdownOptions?: DropdownOption[];
  dropdownOptionsSource?: string;
  isMultiSelect?: boolean;   // Multi-select dropdown
  isCheckbox?: boolean;      // Checkbox column
  showSelectAll?: boolean;   // Show select all for checkboxes
  readOnly?: boolean;        // Read-only checkboxes
}
```

#### TableRowDesigner
```typescript
interface TableRowDesigner {
  condition: (item: any) => boolean;  // Row condition function
  backgroundColor?: string;           // Row background color
  textColor?: string;                // Row text color
  fontWeight?: string;               // Row font weight
  borderColor?: string;              // Row border color
}
```

### Usage Examples

#### Basic Data Grid
```html
<lds-data-grid
  [dataSource]="employees"
  [selectedColumns]="['name', 'email', 'department']"
  [initPageSize]="10"
  gridTitle="Employee List">
</lds-data-grid>
```

#### Editable Grid with Actions
```html
<lds-data-grid
  [dataSource]="products"
  [selectedColumns]="['name', 'price', 'category']"
  [editableColumns]="['name', 'price']"
  [showEditButton]="true"
  [showDeleteButton]="true"
  [useInlineEdit]="true"
  (onFHEditClick)="editProduct($event)"
  (onFHDeleteClick)="deleteProduct($event)">
</lds-data-grid>
```

#### Grid with Dropdowns and Checkboxes
```html
<lds-data-grid
  [dataSource]="tasks"
  [selectedColumns]="['title', 'status', 'completed']"
  [dropdownColumns]="['status']"
  [dropdownOptions]="statusOptions"
  [checkboxColumns]="['completed']"
  [checkboxSelectAllColumns]="['completed']">
</lds-data-grid>
```

---

## Expansion Panel Controls

Located in `src/app/shared/components/expansion-panel-header/` and `src/app/shared/components/expansion-sub-panel-header/`

### Expansion Panel Header (`app-expansion-panel-header`)

**Purpose**: Creates expandable/collapsible panel headers with toggle functionality.

**Selector**: `app-expansion-panel-header`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `panelTitle` | string | undefined | Title text for the panel |
| `isOpenSignal` | WritableSignal<boolean> | required | Signal controlling open/closed state |

#### Features
- Click to toggle panel state
- Visual arrow indicator
- Smooth transition animations
- Theme-aware styling

#### Usage
```html
<app-expansion-panel-header
  panelTitle="Customer Information"
  [isOpenSignal]="customerPanelOpen">
</app-expansion-panel-header>
```

### Expansion Sub Panel Header (`app-expansion-sub-panel-header`)

**Purpose**: Creates sub-panel headers with optional action buttons.

**Selector**: `app-expansion-sub-panel-header`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `subPanelTitle` | string | undefined | Title text for the sub-panel |
| `isOpenSignal` | WritableSignal<boolean> | required | Signal controlling open/closed state |
| `isButton` | boolean | false | Show action button |
| `buttonText` | string | 'Action' | Text for action button |
| `buttonIcon` | string | 'add' | Icon for action button |
| `buttonClass` | string | default classes | CSS classes for button |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `addAction` | void | Fired when action button clicked |

#### Features
- Toggle panel functionality
- Optional action button
- Customizable button styling
- Icon-based visual indicators

#### Usage
```html
<app-expansion-sub-panel-header
  subPanelTitle="Contact Details"
  [isOpenSignal]="contactsPanelOpen"
  [isButton]="true"
  buttonText="Add Contact"
  buttonIcon="add"
  (addAction)="addNewContact()">
</app-expansion-sub-panel-header>
```

---

## Modal Components

Located in `src/app/shared/components/lds-modal/`

### LDS Modal (`lds-modal`)

**Purpose**: Flexible modal dialog component with dynamic content support.

**Selector**: `lds-modal`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isVisible` | boolean | false | Controls modal visibility |
| `modalTitle` | string | '' | Modal header title |
| `cssClass` | string | '' | Additional CSS classes |
| `showOkButton` | boolean | true | Show default OK button |
| `okButtonText` | string | 'OK' | Text for OK button |
| `closeOnBackdropClick` | boolean | true | Close when clicking backdrop |
| `closeOnEscKey` | boolean | true | Close when pressing escape |
| `modalComponent` | any | undefined | Dynamic component to load |
| `componentData` | any | undefined | Data to pass to component |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `onClose` | void | Fired when modal closes |
| `onOkClick` | void | Fired when OK button clicked |
| `onShow` | void | Fired when modal shows |
| `onHide` | void | Fired when modal hides |

#### Methods
| Method | Description |
|--------|-------------|
| `show()` | Programmatically show modal |
| `hide()` | Programmatically hide modal |
| `closeModal()` | Close modal and emit events |

#### Features
- Dynamic component loading
- Backdrop click handling
- Keyboard escape handling
- Template content support
- Accessibility features (ARIA)
- Smooth animations

#### Usage Examples

##### Basic Modal
```html
<lds-modal
  [isVisible]="showModal"
  modalTitle="Confirm Action"
  (onClose)="showModal = false"
  (onOkClick)="confirmAction()">
  <p>Are you sure you want to proceed?</p>
</lds-modal>
```

##### Dynamic Component Modal
```html
<lds-modal
  [isVisible]="showEditModal"
  modalTitle="Edit User"
  [modalComponent]="UserEditComponent"
  [componentData]="selectedUser"
  (onClose)="closeEditModal()">
</lds-modal>
```

##### Custom Footer Modal
```html
<lds-modal
  [isVisible]="showCustomModal"
  modalTitle="Custom Actions"
  [showOkButton]="false"
  (onClose)="closeCustomModal()">
  <p>Modal content here...</p>
  <div slot="footer">
    <button (click)="saveChanges()">Save</button>
    <button (click)="closeCustomModal()">Cancel</button>
  </div>
</lds-modal>
```

---

## Input Type Controls

Located in `src/app/shared/components/input-types/`

### Button Component (`lds-btn`)

**Purpose**: Standardized button component with consistent styling and behavior.

**Selector**: `lds-btn`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | '' | Button ID attribute |
| `value` | string | '' | Button value |
| `cssClass` | string | '' | Additional CSS classes |
| `styles` | string | '' | Inline styles |
| `enable` | boolean | true | Enable/disable button |
| `visible` | boolean | true | Show/hide button |
| `labelText` | string | '' | Button label text |
| `icon` | string | '' | Material icon name |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `valueChanged` | string | Fired when button value changes |
| `onClick` | MouseEvent | Fired when button clicked |

#### Usage
```html
<lds-btn
  labelText="Save Changes"
  icon="save"
  [enable]="formValid"
  cssClass="btn-primary"
  (onClick)="saveForm()">
</lds-btn>
```

### Text Base Input (`lds-text-base-input`)

**Purpose**: Enhanced text input component with validation and multiple display modes.

**Selector**: `lds-text-base-input`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `label` | string | '' | Input label |
| `placeholder` | string | '' | Placeholder text |
| `type` | string | 'text' | Input type (text, email, etc.) |
| `displayMode` | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| `isReadonly` | boolean | false | Read-only state |
| `maxLength` | number | undefined | Maximum character length |
| `tooltip` | string | '' | Tooltip text |
| `tooltipPosition` | string | 'above' | Tooltip position |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `onDoubleClick` | void | Fired on double-click |
| `onKeyDown` | KeyboardEvent | Fired on key press |
| `onChange` | Event | Fired on value change |
| `onInput` | Event | Fired on input |

#### Display Modes
1. **Vertical**: Label above input
2. **Horizontal**: Label beside input
3. **Outline**: Floating label design

#### Features
- Reactive form integration
- Built-in validation display
- Clear button functionality
- Multiple layout modes
- Tooltip support
- Character length validation

#### Usage
```html
<lds-text-base-input
  [frmGroup]="userForm"
  controlName="firstName"
  label="First Name"
  displayMode="outline"
  [maxLength]="50"
  tooltip="Enter your first name">
</lds-text-base-input>
```

### Switch Component (`lds-switch`)

**Purpose**: Toggle switch component for boolean values.

**Selector**: `lds-switch`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `id` | string | '' | Switch ID |
| `value` | string | '' | Switch value |
| `labelText` | string | '' | Label text |
| `isChecked` | boolean | false | Initial checked state |
| `enable` | boolean | true | Enable/disable switch |
| `visible` | boolean | true | Show/hide switch |
| `isVisible` | boolean | true | Alternative visibility control |
| `cssClass` | string | '' | Additional CSS classes |
| `style` | string | '' | Inline styles |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `isCheckedChanged` | boolean | Fired when checked state changes |
| `onSwitchChanged` | boolean | Fired when switch toggled |

#### Features
- Reactive form integration
- Visual state indicators (checkmark/X)
- Smooth animations
- Validation support
- Boolean value conversion
- Accessibility features

#### Usage
```html
<lds-switch
  [frmGroup]="settingsForm"
  controlName="emailNotifications"
  labelText="Email Notifications"
  [isChecked]="true"
  (onSwitchChanged)="updateNotificationSettings($event)">
</lds-switch>
```

### Amount Input (`lds-amount`)

**Purpose**: Specialized input component for monetary amounts with comprehensive validation and formatting.

**Selector**: `lds-amount`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `label` | string | required | Input label |
| `displayMode` | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| `decimalPlaces` | number | 2 | Number of decimal places allowed |
| `allowLeadingZeros` | boolean | false | Allow leading zeros in input |
| `allowNegative` | boolean | true | Allow negative amounts |
| `maxLen` | number | undefined | Maximum length of input |
| `maxAmt` | number | undefined | Maximum amount allowed |
| `tooltip` | string | '' | Tooltip text |
| `tooltipPosition` | string | 'above' | Tooltip position |
| `isReadonly` | boolean | false | Read-only state |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `onBlurred` | void | Fired when input loses focus |
| `onChanged` | number | Fired when amount value changes |
| `onInput` | Event | Fired on input events |
| `onChange` | Event | Fired on change events |

#### Key Features
- **Amount Validation**: Min/max amount constraints, decimal place validation
- **Format Validation**: Leading zeros prevention, negative amount handling
- **Input Restrictions**: Numeric-only input with decimal support
- **Display Modes**: Supports vertical, horizontal, and outline layouts
- **Clear Functionality**: Built-in clear button when value exists
- **Accessibility**: ARIA labels and keyboard navigation

#### Usage Examples
```html
<!-- Outline Mode with Validation -->
<lds-amount
  [frmGroup]="frmGroup"
  [controlName]="'amount'"
  [label]="'Transaction Amount'"
  displayMode="outline"
  [decimalPlaces]="2"
  [allowLeadingZeros]="false"
  [maxLen]="12"
  [tooltip]="'Amount affects tax calculation'"
  (onBlurred)="onBlur($event)"
  (onChanged)="onAmountChanged($event)">
</lds-amount>

<!-- Horizontal Mode with Constraints -->
<lds-amount
  [frmGroup]="frmGroup"
  [controlName]="'budgetAmount'"
  [label]="'Budget Amount'"
  displayMode="horizontal"
  [decimalPlaces]="2"
  [allowNegative]="false"
  [maxAmt]="1000000"
  [tooltip]="'Maximum budget amount is 1M'"
  (onChanged)="updateBudget($event)">
</lds-amount>
```

### Office Box Input (`lds-office-box`)

**Purpose**: Specialized input for office codes with dynamic office name lookup and validation.

**Selector**: `lds-office-box`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `labelText` | string | required | Input label |
| `displayMode` | string | 'vertical' | Layout mode (vertical/horizontal/outline) |
| `id` | string | '' | Input ID attribute |
| `placeholder` | string | 'Enter Office Code' | Placeholder text |
| `enable` | boolean | true | Enable/disable input |
| `visible` | boolean | true | Show/hide input |
| `isReadonly` | boolean | false | Read-only state |
| `allowSpecialChars` | boolean | false | Allow special characters |
| `maxLen` | number | undefined | Maximum length |
| `minLen` | number | undefined | Minimum length |
| `tooltip` | string | '' | Tooltip text |
| `tooltipPosition` | string | 'above' | Tooltip position |
| `customErrorMessages` | object | {} | Custom error message mapping |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `valueChanged` | number | Fired when office code value changes |
| `onChanged` | {officeCode: string, officeName: string} | Fired with office details |
| `onBlurred` | any | Fired when input loses focus |

#### Key Features
- **Office Lookup**: Automatically looks up office name based on code
- **Dynamic Display**: Shows office name below the input field
- **Input Validation**: Character restrictions and length validation
- **Real-time Updates**: Updates office name as user types
- **Built-in Office Database**: Pre-configured office code mappings

#### Built-in Office Mappings
```typescript
const officeLookup = {
  '1001': 'Head Office',
  '1002': 'Dhaka Corporate Office', 
  '1003': 'Chittagong Branch',
  '1004': 'Sylhet Branch'
};
```

#### Usage Examples
```html
<!-- Outline Mode with Office Lookup -->
<lds-office-box
  [frmGroup]="frmGroup"
  [controlName]="'officeCode'"
  [labelText]="'Office Code'"
  displayMode="outline"
  [enable]="true"
  [visible]="true"
  [maxLen]="4"
  [placeholder]="'Enter office code'"
  (onChanged)="onOfficeSelected($event)">
</lds-office-box>

<!-- Horizontal Mode with Restrictions -->
<lds-office-box
  [frmGroup]="frmGroup"
  [controlName]="'branchOffice'"
  [labelText]="'Branch Office'"
  displayMode="horizontal"
  [allowSpecialChars]="false"
  [maxLen]="4"
  [minLen]="3"
  [tooltip]="'Enter valid office code'"
  (onChanged)="updateBranchInfo($event)"
  (onBlurred)="validateOffice($event)">
</lds-office-box>
```

### Text Area Input (`lds-txt-area`)

**Purpose**: Multi-line text input component with advanced features like auto-resize and character counting.

**Selector**: `lds-txt-area`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `labelText` | string | required | Input label |
| `id` | string | '' | Textarea ID attribute |
| `placeholder` | string | '' | Placeholder text |
| `isVertical` | boolean | true | Vertical layout mode |
| `rows` | number | 3 | Initial number of rows |
| `minRows` | number | 1 | Minimum number of rows |
| `maxRows` | number | 10 | Maximum number of rows |
| `maxCols` | number | undefined | Maximum number of columns |
| `width` | string | '100%' | Textarea width |
| `showRowCount` | boolean | false | Show row count indicator |
| `tooltip` | string | '' | Tooltip text |
| `tooltipPosition` | string | 'above' | Tooltip position |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `onChanged` | string | Fired when textarea value changes |

#### Key Features
- **Auto-resize**: Automatically adjusts height based on content
- **Row Management**: Configurable min/max rows with auto-expansion
- **Character Validation**: Built-in validation with error display
- **Layout Flexibility**: Vertical/horizontal layout options
- **Row Counter**: Optional row count display
- **Rich Validation**: Integration with reactive forms validation

#### Usage Examples
```html
<!-- Basic Text Area with Auto-resize -->
<lds-txt-area
  [frmGroup]="frmGroup"
  [controlName]="'description'"
  [labelText]="'Description'"
  [rows]="3"
  [maxRows]="8"
  [placeholder]="'Enter detailed description...'"
  (onChanged)="onDescriptionChange($event)">
</lds-txt-area>

<!-- Horizontal Layout with Row Count -->
<lds-txt-area
  [frmGroup]="frmGroup"
  [controlName]="'notes'"
  [labelText]="'Additional Notes'"
  [isVertical]="false"
  [rows]="4"
  [minRows]="2"
  [maxRows]="12"
  [width]="'100%'"
  [showRowCount]="true"
  [tooltip]="'Add any additional comments'"
  (onChanged)="onNotesChange($event)">
</lds-txt-area>

<!-- Comments Section -->
<lds-txt-area
  [frmGroup]="frmGroup"
  [controlName]="'comments'"
  [labelText]="'Comments'"
  [placeholder]="'Enter your comments here...'"
  [rows]="5"
  [maxRows]="15"
  [maxCols]="80"
  [showRowCount]="true"
  (onChanged)="updateComments($event)">
</lds-txt-area>
```

### Time Input (`app-time-input`)

**Purpose**: Time picker component with 12/24 hour format support and validation.

**Selector**: `app-time-input`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `label` | string | required | Input label |
| `minTime` | string | '00:00' | Minimum allowed time |
| `maxTime` | string | '23:59' | Maximum allowed time |
| `isReadonly` | boolean | false | Read-only state |
| `placeholder` | string | '--:--' | Placeholder text |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `timeChange` | string | Fired when time value changes (12-hour format) |

#### Key Features
- **Format Conversion**: Automatic 24-hour to 12-hour format conversion
- **Time Validation**: Min/max time constraints with validation
- **Native HTML5**: Uses HTML5 time input for better UX
- **Format Display**: Shows time in 12-hour format with AM/PM
- **Accessibility**: Proper ARIA labeling and keyboard support

#### Time Format Conversion
- **Input**: 24-hour format (HH:MM)
- **Output**: 12-hour format (HH:MM AM/PM)
- **Static Method**: `TimeInput.convertTo24Hour()` for reverse conversion

#### Usage Examples
```html
<!-- Basic Time Input -->
<app-time-input
  [frmGroup]="reminderForm"
  [controlName]="'reminderTime'"
  label="Reminder Time"
  [minTime]="'09:00'"
  [maxTime]="'18:00'"
  (timeChange)="onReminderTimeChange($event)">
</app-time-input>

<!-- Business Hours Time Picker -->
<app-time-input
  [frmGroup]="scheduleForm"
  [controlName]="'startTime'"
  label="Start Time"
  [minTime]="'08:00'"
  [maxTime]="'20:00'"
  placeholder="Select start time"
  (timeChange)="updateSchedule($event)">
</app-time-input>

<!-- Meeting Time with Validation -->
<app-time-input
  [frmGroup]="meetingForm"
  [controlName]="'meetingTime'"
  label="Meeting Time"
  [minTime]="'09:00'"
  [maxTime]="'17:00'"
  [isReadonly]="meetingLocked"
  (timeChange)="scheduleMeeting($event)">
</app-time-input>
```

#### Integration Example
```typescript
// Component integration
export class TimeExampleComponent {
  timeForm = this.fb.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });

  onTimeChange(time: string) {
    console.log('Selected time (12-hour):', time);
    // Convert back to 24-hour if needed
    const time24 = TimeInput.convertTo24Hour(time);
    console.log('24-hour format:', time24);
  }
}
```

### Number Input (`lds-number`)

**Purpose**: Numeric input component with comprehensive validation and constraints.

**Selector**: `lds-number`

#### Key Features
- **Numeric Validation**: Integer and decimal number support
- **Range Constraints**: Min/max value validation
- **Length Restrictions**: Maximum digit length control
- **Format Control**: Decimal places and step increments
- **Input Filtering**: Prevents non-numeric characters

#### Usage Examples
```html
<!-- Reference Number with Constraints -->
<lds-number
  [frmGroup]="frmGroup"
  [controlName]="'referenceNumber'"
  [label]="'Reference Number'"
  displayMode="horizontal"
  [minValue]="1"
  [maxValue]="9999"
  [maxLen]="4"
  [placeholder]="'Auto-generated number'"
  (onChanged)="onNumberChanged($event)">
</lds-number>
```

### File Input (`lds-file`)

**Purpose**: File upload component with drag-and-drop support and type validation.

**Selector**: `lds-file`

#### Key Features
- **File Type Filtering**: Extension-based file filtering
- **Multiple Files**: Single or multiple file selection
- **Custom Styling**: Configurable appearance and layout
- **Path Management**: Custom save paths and file naming
- **Upload Tracking**: File selection change events

#### Usage Examples
```html
<!-- PDF Document Upload -->
<lds-file
  #pdfFileInput
  [id]="'pdf-upload'"
  [multipleFile]="false"
  [fileExtension]="'.pdf'"
  [isVertical]="false"
  [labelText]="'Upload Supporting Document'"
  [cssClass]="'border-green-300 bg-green-50'"
  [savePath]="'documents/transactions'"
  [customFileName]="'transaction-document'"
  (selectedFilesChanged)="onPdfSelected($event)"
  (onFileChanged)="onFileInputChanged($event)">
</lds-file>
```

### Label Component (`lds-label`)

**Purpose**: Standardized label component.

**Selector**: `lds-label`

#### Input Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `labelValue` | string | '' | Label text to display |
| `visible` | boolean | true | Show/hide label |

#### Usage
```html
<lds-label
  labelValue="User Information"
  [visible]="showLabels">
</lds-label>
```

---

## Multi-Select Components

Located in `src/app/shared/components/multi-select-option-field/`

### Multi-Select Option Field (`lds-multi-select-option-field`)

**Purpose**: Advanced multi-select dropdown with search and filtering capabilities.

**Selector**: `lds-multi-select-option-field`

#### Key Features
- Multiple item selection
- Search/filter functionality
- Custom item templates
- Select all/deselect all
- Chip display for selections
- Async data loading
- Validation integration
- Keyboard navigation

#### Input Parameters (Key ones)
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frmGroup` | FormGroup | required | Reactive form group |
| `controlName` | string | required | Form control name |
| `options` | any[] | [] | Available options |
| `displayProperty` | string | required | Property to display |
| `valueProperty` | string | required | Property for value |
| `placeholder` | string | '' | Placeholder text |
| `searchEnabled` | boolean | true | Enable search functionality |
| `selectAllEnabled` | boolean | true | Enable select all option |
| `maxSelections` | number | undefined | Maximum selections allowed |

#### Output Events
| Event | Type | Description |
|-------|------|-------------|
| `selectionChange` | any[] | Fired when selections change |
| `searchChange` | string | Fired when search term changes |
| `selectAll` | boolean | Fired when select all toggled |

#### Usage
```html
<lds-multi-select-option-field
  [frmGroup]="filterForm"
  controlName="departments"
  [options]="departmentList"
  displayProperty="name"
  valueProperty="id"
  placeholder="Select departments..."
  [searchEnabled]="true"
  [selectAllEnabled]="true"
  (selectionChange)="onDepartmentSelection($event)">
</lds-multi-select-option-field>
```

---

## Global State Management

### Button Signals

Located in `src/app/shared/constant/button-signals.constant.ts`

The application uses Angular signals for global state management of button actions and form states.

#### Available Signals
- `ONCLICK_SAVE`: Triggered when save action occurs
- `ONCLICK_VIEW`: Triggered when view action occurs  
- `ONCLICK_RESET`: Triggered when reset action occurs
- `ONCLICK_EXIT`: Triggered when exit action occurs
- `ONCLICK_DELETE`: Triggered when delete action occurs
- `ONCLICK_UPDATE`: Triggered when update action occurs
- `FormGroupSignal`: Global form group signal
- `BUTTON_VISIBILITY`: Controls visibility of action buttons
- `MENU_NAME`: Current menu/page name

#### Usage
```typescript
import { ONCLICK_SAVE, FormGroupSignal } from './shared/constant/button-signals.constant';

// Listen for save events
effect(() => {
  if (ONCLICK_SAVE()) {
    this.saveData();
    ONCLICK_SAVE.set(false); // Reset signal
  }
});

// Access global form
const form = FormGroupSignal();
```

---

## Best Practices

### 1. Form Integration
- Always use reactive forms with form controls
- Implement proper validation
- Handle form state consistently

### 2. Event Handling
- Use output events for component communication
- Implement proper error handling
- Clean up subscriptions in ngOnDestroy

### 3. Accessibility
- Provide proper ARIA labels
- Ensure keyboard navigation
- Use semantic HTML elements

### 4. Performance
- Use OnPush change detection where possible
- Implement proper loading states
- Optimize large data sets with pagination

### 5. Styling
- Use consistent CSS classes
- Follow theme guidelines
- Ensure responsive design

### 6. Validation
- Implement client-side validation
- Provide clear error messages
- Handle edge cases gracefully

---

## Common Integration Patterns

### 1. Form with Validation
```typescript
ngOnInit() {
  this.userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    isActive: [false]
  });
}
```

### 2. Data Grid with Actions
```typescript
onEditClick(id: string) {
  const user = this.users.find(u => u.id === id);
  this.openEditModal(user);
}

onDeleteClick(id: string) {
  if (confirm('Are you sure?')) {
    this.deleteUser(id);
  }
}
```

### 3. Modal Communication
```typescript
openEditModal(user: User) {
  this.selectedUser = user;
  this.showEditModal = true;
}

onModalClose() {
  this.showEditModal = false;
  this.refreshData();
}
```

---

## Real-World Usage Examples

Based on the actual implementation in the application, here are comprehensive examples showing how these components work together in real scenarios:

### Transaction Form Implementation

This example shows how multiple components work together in a complete transaction management form:

```html
<form [formGroup]="frmGroup" class="transaction-form">
  <!-- Header Panel -->
  <app-expansion-panel-header
    [isOpenSignal]="businessHeaderPanel"
    [panelTitle]="'Transaction Management'">
  </app-expansion-panel-header>

  <!-- OUTLINE MODE SECTION -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <!-- Transaction Reference with Custom Validation -->
    <app-text-base-input
      [frmGroup]="frmGroup"
      [controlName]="'textBox'"
      [label]="'Transaction Reference'"
      [isReadonly]="false"
      displayMode="outline"
      [tooltip]="'Auto-generated based on currency and category'"
      [tooltipPosition]="'above'"
      [tooltipDelay]="300"
      [tooltipClass]="'success-tooltip'"
      (onBlurred)="onBlur($event)"
      (onChanged)="onTextBoxChanged($event)"
      [customErrorMessages]="{
        required: 'Transaction reference is required',
        minlength: 'Minimum 3 characters required',
        maxlength: 'Maximum 20 characters allowed',
        pattern: 'Only alphanumeric characters and underscores are allowed'
      }">
    </app-text-base-input>

    <!-- Currency Selection -->
    <app-select-option-field
      [frmGroup]="frmGroup"
      [controlName]="'currency'"
      [label]="'Currency'"
      displayMode="outline"  
      [options]="currencyOptions"
      [tooltip]="'Currency selection affects country and tax rate'"
      [searchable]="false"
      (onSelect)="handleCategorySelection($event)">
    </app-select-option-field>

    <!-- Amount Input with Validation -->
    <lds-amount
      [frmGroup]="frmGroup"
      [controlName]="'amount'"
      [label]="'Transaction Amount'"
      displayMode="outline"
      [decimalPlaces]="2"
      [allowLeadingZeros]="false"
      [maxLen]="12"
      [tooltip]="'Amount affects tax calculation and approval requirements'"
      (onBlurred)="onBlur($event)"
      (onChanged)="onAmountChanged($event)">
    </lds-amount>

    <!-- Amount in Words (Auto-sync) -->
    <app-amount-to-word-input
      [frmGroup]="frmGroup"
      [controlName]="'amountToWord'"
      [label]="'Amount in Words'"
      displayMode="outline"
      [currency]="selectedCurrency()"
      [decimalPlaces]="2"
      [maxLen]="12"
      [tooltip]="'Automatically synced with amount field'"
      (onBlurred)="onBlur($event)"
      (onChanged)="onAmountToWordChanged($event)">
    </app-amount-to-word-input>
  </div>

  <!-- VERTICAL LAYOUT SECTION -->
  <app-expansion-sub-panel-header
    [isOpenSignal]="subPanel2"
    [subPanelTitle]="'Configuration Fields'">
  </app-expansion-sub-panel-header>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    
    <!-- ID Box with Modal Integration -->
    <lds-id-box
      [frmGroup]="frmGroup"
      [controlName]="'id'"
      [label]="'Account ID'"
      [allowSpecialChars]="true"
      [isDotsVisible]="true"
      [tooltip]="'Click to select account ID'"
      [tooltipPosition]="'above'"
      [tooltipDelay]="300"
      displayMode="vertical"
      (onBlurred)="onBlur($event)"
      (dotsClicked)="openModal()"
      (onChanged)="onIdBoxChanged($event)">
    </lds-id-box>

    <!-- Date Input with Time -->
    <app-date-input
      [frmGroup]="frmGroup"
      [controlName]="'date'"
      [label]="'Transaction Date'"
      displayMode="vertical"
      [dateFormat]="'YYYY-MM-DD'"
      [maxYear]="2034"
      [includeTime]="2"
      [enableYearRangeValidation]="false"
      (onBlurred)="onBlur($event)">
    </app-date-input>

    <!-- Office Code with Auto-lookup -->
    <lds-office-box
      [frmGroup]="frmGroup"
      [controlName]="'officeCode'"
      [labelText]="'Office Code'"
      displayMode="vertical"
      [enable]="true"
      [visible]="true"
      [maxLen]="4"
      [placeholder]="'Auto-suggested based on currency'"
      (onChanged)="onOfficeBoxChanged($event)">
    </lds-office-box>
  </div>

  <!-- HORIZONTAL LAYOUT SECTION -->
  <div class="space-y-6">
    
    <!-- Switch with Description -->
    <div class="component-section">
      <lds-switch
        [frmGroup]="frmGroup"
        [controlName]="'switch'"
        [labelText]="'Express Processing'"
        [isChecked]="frmGroup.get('switch')?.value || false">
      </lds-switch>
      <div class="text-xs text-gray-600 mt-1">
        Express processing reduces validation requirements
      </div>
    </div>

    <!-- File Upload -->
    <lds-file
      #pdfFileInput
      [id]="'pdf-upload'"
      [multipleFile]="false"
      [fileExtension]="'.pdf'"
      [isVertical]="false"
      [labelText]="'Upload Supporting Document'"
      [cssClass]="'border-green-300 bg-green-50'"
      [savePath]="'documents/transactions'"
      [customFileName]="'transaction-document'"
      (selectedFilesChanged)="onPdfSelected($event)"
      (onFileChanged)="onFileInputChanged('Transaction Document')">
    </lds-file>

    <!-- Text Area with Row Management -->
    <lds-txt-area
      [frmGroup]="frmGroup"
      [controlName]="'textArea'"
      [labelText]="'Transaction Notes'"
      [isVertical]="false"
      [rows]="3"
      [minRows]="2"
      [width]="'100%'"
      [maxRows]="10"
      [maxCols]="80"
      [placeholder]="'Enter transaction description and notes...'"
      [showRowCount]="true"
      (onChanged)="onTextAreaChanged($event)">
    </lds-txt-area>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-4">
    <lds-btn
      id="saveBtn"
      value="save"
      labelText="Save"
      (onClick)="addCurrentFormToGrid()">
    </lds-btn>
    <lds-btn
      id="openModalBtn"
      value="open"
      labelText="Open in Modal"
      (onClick)="openModal()">
    </lds-btn>
  </div>

  <!-- Data Grid Integration -->
  <lds-data-grid 
    #transactionGrid
    [id]="'enhanced-transactions'"
    [dataSource]="sampleTransactions()"
    [initPageSize]="8"
    [enableSelection]="true"
    [showEditButton]="true"
    [showDeleteButton]="true"
    [showViewButton]="true"
    [searchEnabled]="true"
    [showPrintButton]="true"
    [useInlineEdit]="true"
    [editableColumns]="['amount', 'status', 'priority', 'currency']"
    [numberColumns]="['amount', 'calculatedTax', 'totalAmount', 'taxRate']"
    [dropdownColumns]="transactionDropdownColumns()"
    [dropdownOptions]="transactionDropdownOptions()"
    [selectedColumns]="['id', 'amount', 'currency', 'country', 'status', 'totalAmount']"
    [rowDesignerList]="transactionRowDesigners()"
    [groupOptionEnabled]="true"
    [summaryGridEnabled]="true"
    [summaryColumns]="['amount','calculatedTax']"
    [groupByColumns]="['currency', 'country','productCategory']"
    [summaryGridPosition]="'above'"
    [gridTitle]="'Transaction Grid'"
    (onFHEditClick)="onTransactionEdit($event)"
    (onFHDeleteClick)="onTransactionDelete($event)"
    (onFHViewClick)="onTransactionView($event)"
    (onPrint)="onTransactionPrint($event)"
    (onChecked)="onTransactionRowSelect($event)"
    (onSelectAllChange)="onTransactionSelectAll($event)"
    (dataSourceChanged)="onTransactionDataChanged($event)">
  </lds-data-grid>

  <!-- Modal Integration -->
  <lds-modal
    [isVisible]="showModal"
    [modalTitle]="'Account Selection'"
    [cssClass]="'modal-sm'"
    [okButtonText]="'Process'"
    [modalComponent]="modalComponent"
    [modalComponentData]="modalComponentData"
    (modalClosed)="onModalClose(false)"
    (modalResult)="onModalResult($event)">
  </lds-modal>
</form>
```

### Component State Management

```typescript
export class TransactionComponent {
  // Form setup with comprehensive validation
  frmGroup = this.fb.group({
    textBox: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    currency: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    amountToWord: [''],
    officeCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    date: ['', Validators.required],
    switch: [false],
    textArea: ['', Validators.maxLength(500)]
  });

  // Signal-based panel management
  businessHeaderPanel = signal(true);
  subPanel1 = signal(false);
  subPanel2 = signal(true);
  
  // Dynamic data for dropdowns
  currencyOptions = signal([
    { value: 'USD', text: 'US Dollar' },
    { value: 'EUR', text: 'Euro' },
    { value: 'GBP', text: 'British Pound' }
  ]);

  // Component integration handlers
  onAmountChanged(amount: number) {
    // Auto-sync amount to words
    const control = this.frmGroup.get('amountToWord');
    if (control) {
      control.setValue(this.convertAmountToWords(amount));
    }
    
    // Trigger tax calculation
    this.calculateTax(amount);
  }

  onOfficeBoxChanged(office: {officeCode: string, officeName: string}) {
    console.log('Office selected:', office);
    // Update related fields based on office selection
    this.updateOfficeRelatedFields(office);
  }

  onCurrencySelection(currency: any) {
    // Update country and tax rate based on currency
    this.updateCurrencyRelatedFields(currency);
  }
}
```

### Advanced Data Grid Configuration

```typescript
// Row designer for conditional styling
transactionRowDesigners = signal<TableRowDesigner[]>([
  {
    condition: (item: any) => item.status === 'pending',
    backgroundColor: '#fff3cd',
    textColor: '#856404',
    borderColor: '#ffeaa7'
  },
  {
    condition: (item: any) => item.amount > 10000,
    backgroundColor: '#f8d7da',
    textColor: '#721c24',
    fontWeight: 'bold'
  }
]);

// Dynamic dropdown configuration
transactionDropdownColumns = signal(['status', 'priority', 'currency']);

transactionDropdownOptions = signal({
  status: [
    { value: 'pending', text: 'Pending' },
    { value: 'approved', text: 'Approved' },
    { value: 'rejected', text: 'Rejected' }
  ],
  priority: [
    { value: 'low', text: 'Low' },
    { value: 'medium', text: 'Medium' },
    { value: 'high', text: 'High' },
    { value: 'critical', text: 'Critical' }
  ]
});
```

### Time Management Integration

```html
<!-- Meeting Scheduler Example -->
<div class="meeting-scheduler">
  <app-time-input
    [frmGroup]="meetingForm"
    [controlName]="'startTime'"
    label="Meeting Start"
    [minTime]="'09:00'"
    [maxTime]="'18:00'"
    (timeChange)="onStartTimeChange($event)">
  </app-time-input>

  <app-time-input
    [frmGroup]="meetingForm"
    [controlName]="'endTime'"
    label="Meeting End"
    [minTime]="getMinEndTime()"
    [maxTime]="'18:00'"
    (timeChange)="onEndTimeChange($event)">
  </app-time-input>
</div>
```

```typescript
// Time management logic
onStartTimeChange(startTime: string) {
  this.selectedStartTime.set(startTime);
  // Update minimum end time
  const endTimeControl = this.meetingForm.get('endTime');
  if (endTimeControl) {
    endTimeControl.updateValueAndValidity();
  }
}

getMinEndTime(): string {
  const startTime = this.selectedStartTime();
  if (!startTime) return '09:00';
  
  // Add 30 minutes to start time for minimum meeting duration
  const start24 = TimeInput.convertTo24Hour(startTime);
  const [hours, minutes] = start24.split(':').map(Number);
  const minEndTime = new Date(2024, 0, 1, hours, minutes + 30);
  
  return minEndTime.toTimeString().substring(0, 5);
}
```

This comprehensive documentation covers all the major components and their usage patterns. Each component is designed to work together as part of a cohesive UI framework with consistent behavior and styling.