import { useState } from 'react';

const useFields = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleFieldChange = (evt) => {
    setFormData((formData) => (
      {
        ...formData,
        [evt.target.name]: evt.target.value
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
  return { formData, handleFieldChange, resetFormData, resetPasswordField };
}

export default useFields;