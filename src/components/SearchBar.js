import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const SearchBar = React.memo(function SearchBar({ onSearch }) {
    // State for the value of the input field
    const [inputValue, setInputValue] = useState('');

    // Handle when the input value changes
    const handleChange = useCallback((e) => {
        setInputValue(e.target.value);
    }, []);

    // Handler when form is submitted
    const handleSubmit = useCallback((e) => {
        e.preventDefault();// Prevent the default form submission behavior (page reload)
        //checking if value is not empty
        if (inputValue.trim()) {
            // Call the onSearch prop (which is handleSearch in App.js)
            // Pass the trimmed input value back to the parent component
            onSearch(inputValue.trim());
        }
        setInputValue('');// Clear the input field after searching
    }, [inputValue, onSearch]);

    return (
        <div className='search-bar'>
            <form onSubmit={handleSubmit} aria-label="Search for a city">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <label htmlFor="city-search" style={{ display: 'none' }}>Search for a city</label>
                <input
                    id="city-search"
                    type="text"
                    placeholder='Search for a city...'
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    aria-label="City name"
                />
            </form>
            <div aria-live="polite" style={{position:'absolute',left:'-9999px',height:'1px',width:'1px',overflow:'hidden'}}>
                {inputValue && `Searching for: ${inputValue}`}
            </div>
        </div>
    );
});

SearchBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
};

export default SearchBar;