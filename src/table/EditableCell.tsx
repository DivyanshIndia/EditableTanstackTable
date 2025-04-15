import React from 'react';
import { ValueType } from './data-table';

interface EditableCellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  columnId: string;
  rowId: string;
  isEditing: boolean;
  onChange?: (rowId: string, columnId: string, value: ValueType) => void;
  inputType?: "text" | "checkbox" | "radio" | "date" | "number" | "textarea" | "select" | "email" | "password" | "tel" | "url" | "range" | "color" | "time" | "datetime-local";
  options?: Array<{label: string; value: string}>;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

/**
 * EditableCell component for in-line editing in tables or grid layouts
 * 
 * @param {EditableCellProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
const EditableCell: React.FC<EditableCellProps> = ({
  value,
  columnId,
  rowId,
  isEditing,
  onChange,
  inputType = "text",
  options = [],
  placeholder = "",
  min,
  max,
  step,
  disabled = false,
  required = false,
  className = "",
  autoFocus = false,
}) => {
  // Handler for input changes
  const handleChange = (newValue: ValueType) => {
    if (onChange) {
      onChange(rowId, columnId, newValue);
    }
  };

  // Format display value based on input type
  const formatDisplayValue = () => {
    if (value === null || value === undefined) return "";
    
    if (inputType === "checkbox") return value ? "Yes" : "No";
    if (inputType === "date" && value instanceof Date) return value.toLocaleDateString();
    if (inputType === "select" && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    return String(value);
  };

  if (!isEditing) {
    return <span className={className}>{formatDisplayValue()}</span>;
  }

  // Render appropriate input based on inputType
  switch (inputType) {
    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={disabled}
          required={required}
          className={className}
          autoFocus={autoFocus}
          
        />
      );
      
    case "radio":
      return (
        <div className={className}>
          {options.map((option) => (
            <label key={option.value} className="mr-2 inline-flex items-center">
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                required={required}
                className="mr-1"
              />
              {option.label}
            </label>
          ))}
        </div>
      );
      
    case "textarea":
      return (
        <textarea
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={className}
          autoFocus={autoFocus}
          rows={3}
        />
      );
      
    case "select":
      return (
        <select
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={className}
          autoFocus={autoFocus}
        >
          <option value="" disabled>{placeholder || "Select an option"}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      
    case "number":
    case "range":
      return (
        <input
          type={inputType}
          value={value || ""}
          onChange={(e) => handleChange(inputType === "number" ? 
            (e.target.value === "" ? "" : Number(e.target.value)) : 
            Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={className}
          autoFocus={autoFocus}
        />
      );
      
    case "date":
    case "time":
    case "datetime-local":
    case "color":
    case "email":
    case "password":
    case "tel":
    case "url":
      return (
        <input
          type={inputType}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={className}
          autoFocus={autoFocus}
          min={inputType === "date" || inputType === "time" || inputType === "datetime-local" ? min : undefined}
          max={inputType === "date" || inputType === "time" || inputType === "datetime-local" ? max : undefined}
        />
      );
      
    default: // "text" or fallback
      return (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={className}
          autoFocus={autoFocus}
        />
      );
  }
};

export default EditableCell;