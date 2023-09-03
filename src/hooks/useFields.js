import { useState } from 'react';

/* 
  Accepts the initialState of the fields as an object:
    { 
      field1Name: field1Value,
      filed2Name: field2Value,
      ...
    }
  and a maxChar object (optional and not all fields need to be present)
    {
      field1Name: 300,
      field3Name: 20
    }
*/
const useFields = (initialState, maxChar = {}) => {
  const [formData, setFormData] = useState(initialState);

  const handleFieldChange = (evt) => {
    setFormData((formData) => {
      const field = evt.target.name;
      const value = evt.target.value;
      // if the current field value is already at max chars, then ignore new input
      if (maxChar[field] !== undefined && value.length > maxChar[field]) {
        return formData;
      }
      return {
          ...formData,
          [evt.target.name]: evt.target.value
      }
    });
  }

  const setFields = (fieldValueObj) => {
    setFormData((formData) => (
      {
        ...formData,
        ...fieldValueObj
      }
    ))
  }

  const resetFormData = () => {
    console.log(initialState);
    setFormData(initialState);
  }
  const resetPasswordField = () => {
    setFormData((formData) => (
      {
        ...formData,
        password: ''
      }
    ))
  }
  return { formData, handleFieldChange, setFields, resetFormData, resetPasswordField };
}

export default useFields;