# Settings Schema Constants

This directory contains comprehensive constants for the settings table based on the database schema.

## Files

- `settings-schema.js` - Complete field definitions, validation rules, and helper functions

## Usage

### Basic Usage

```javascript
import { SETTINGS_TABLE, SETTINGS_HELPERS } from '@/constants/settings-schema.js';

// Get field configuration
const fieldConfig = SETTINGS_HELPERS.getFieldConfig('company_name');
console.log(fieldConfig.label); // 'שם החברה'

// Validate field value
const validation = SETTINGS_HELPERS.validateField('company_email', 'invalid-email');
console.log(validation.isValid); // false
console.log(validation.error); // 'אימייל החברה אינו תקין'

// Get fields in a group
const companyFields = SETTINGS_HELPERS.getGroupFields('company');
console.log(companyFields); // ['company_name', 'company_description', ...]
```

### Form Integration

```jsx
import SettingsForm from '@/components/admin/settings/SettingsForm';

// Use with specific group
<SettingsForm
  groupName="company"
  initialData={existingSettings}
  onSave={handleSave}
  onCancel={handleCancel}
/>

// Use with all fields
<SettingsForm
  initialData={existingSettings}
  onSave={handleSave}
/>
```

### Field Groups

The settings are organized into logical groups:

- **company** - מידע על החברה (Company Information)
- **branding** - מיתוג וצבעים (Branding & Colors)
- **regional** - הגדרות אזוריות (Regional Settings)
- **tax** - הגדרות מע"מ (Tax Settings)
- **shipping** - הגדרות משלוח (Shipping Settings)
- **invoice** - הגדרות חשבונית (Invoice Settings)
- **notifications** - הגדרות התראות (Notification Settings)
- **system** - הגדרות מערכת (System Settings)
- **security** - הגדרות אבטחה (Security Settings)
- **performance** - הגדרות ביצועים (Performance Settings)

### Field Types

Each field includes:

- **type** - Database field type
- **nullable** - Whether the field can be null
- **label** - Hebrew label for forms
- **placeholder** - Placeholder text
- **validation** - Validation type (email, phone, url, etc.)
- **min/max** - Range constraints
- **maxLength** - Maximum character length
- **options** - Available options for select fields
- **default** - Default value

### Validation

Built-in validation for:

- Email addresses
- Phone numbers
- URLs
- Hex colors
- Currency codes
- Decimal numbers
- Integers
- Required fields
- Length constraints
- Range constraints

### Helper Functions

- `getFieldConfig(fieldName)` - Get field configuration
- `getGroupFields(groupName)` - Get fields in a group
- `validateField(fieldName, value)` - Validate field value
- `getDefaultValue(fieldName)` - Get default value
- `formatValue(fieldName, value)` - Format value for display
- `getFieldOptions(fieldName)` - Get select options

## Database Schema

Based on the PostgreSQL settings table with all constraints and indexes:

```sql
create table public.settings (
  id uuid not null default extensions.uuid_generate_v4(),
  company_name character varying(255) null,
  company_description text null,
  -- ... all other fields
  constraint settings_pkey primary key (id)
);
```

## Examples

### Company Settings Form

```jsx
<SettingsForm
  groupName="company"
  initialData={{
    company_name: 'חברת דוגמה',
    company_email: 'info@example.com'
  }}
  onSave={async (data) => {
    await updateCompanySettings(data);
  }}
/>
```

### Tax Settings Form

```jsx
<SettingsForm
  groupName="tax"
  onSave={async (data) => {
    await updateTaxSettings(data);
  }}
/>
```

### Custom Field Validation

```javascript
const validateCustomField = (fieldName, value) => {
  const validation = SETTINGS_HELPERS.validateField(fieldName, value);
  if (!validation.isValid) {
    // Handle validation error
    console.error(validation.error);
  }
  return validation.isValid;
};
```
