import React, { useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, type, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        <input 
          className={`input-field ${error ? 'input-field-error' : ''} ${isPassword ? 'input-field-password' : ''}`} 
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          {...props} 
        />
        {isPassword && (
          <button 
            type="button" 
            className="password-toggle" 
            onClick={togglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? '👁️' : '🙈'}
          </button>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
