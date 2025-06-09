import React, { useState } from 'react';

function SearchBar({ onSearch }) {
    // State for the value of the input field
    const [inputValue, setInputValue] = useState('');

    //handle when the input value changes
    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    //handler when form is submitted
    const handleSubmit = (e) => {
        e.preventDefault();// Prevent the default form submission behavior (page reload)
        //checking if value is not empty
        if (inputValue.trim()) {
            // Call the onSearch prop (which is handleSearch in App.js)
            // Pass the trimmed input value back to the parent component
            onSearch(inputValue.trim());
        }
        setInputValue('');// Clear the input field after searching
    };
    return (
        <div className='search-bar'>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder='Search for a city...' value={inputValue} onChange={handleChange}></input>
                {/* <button type='submit'>Submit</button> */}
            </form>
        </div>
    );
}

export default SearchBar;