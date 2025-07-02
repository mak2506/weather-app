import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

const SearchBar = memo(({ onSearch, placeholder = 'Search for a city...', className = '' }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Handle input value changes with validation
    const handleChange = useCallback((e) => {
        const value = e.target.value;
        // Only allow letters, spaces, hyphens, and apostrophes
        const sanitizedValue = value.replace(/[^a-zA-Z\s\-']/g, '');
        setInputValue(sanitizedValue);
    }, []);

    // Handle form submission with validation
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        const trimmedValue = inputValue.trim();
        
        if (!trimmedValue) {
            toast.error('Please enter a city name');
            inputRef.current?.focus();
            return;
        }

        if (trimmedValue.length < 2) {
            toast.error('City name must be at least 2 characters long');
            inputRef.current?.focus();
            return;
        }

        if (trimmedValue.length > 50) {
            toast.error('City name is too long');
            inputRef.current?.focus();
            return;
        }

        // Validate city name format
        const cityNameRegex = /^[a-zA-Z\s\-']{2,50}$/;
        if (!cityNameRegex.test(trimmedValue)) {
            toast.error('Please enter a valid city name');
            inputRef.current?.focus();
            return;
        }

        try {
            onSearch(trimmedValue);
            setInputValue('');
            toast.success(`Searching for weather in ${trimmedValue}`);
        } catch (error) {
            toast.error('Failed to search. Please try again.');
            console.error('Search error:', error);
        }
    }, [inputValue, onSearch]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
        
        // Escape key to clear input
        if (e.key === 'Escape') {
            setInputValue('');
            inputRef.current?.blur();
        }
    }, [handleSubmit]);

    // Focus management
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // Auto-focus on mount for better UX
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className={`search-bar ${className}`}>
            <form onSubmit={handleSubmit} role="search">
                <div className="search-input-container">
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder={placeholder}
                        value={inputValue} 
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        aria-label="Search for a city"
                        aria-describedby="search-instructions"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        maxLength={50}
                        className={`search-input ${isFocused ? 'focused' : ''}`}
                    />
                    <button 
                        type="submit" 
                        className="search-button"
                        aria-label="Search weather"
                        disabled={!inputValue.trim()}
                    >
                        🔍
                    </button>
                </div>
                <div id="search-instructions" className="sr-only">
                    Press Enter to search or Escape to clear
                </div>
            </form>
        </div>
    );
});

SearchBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;