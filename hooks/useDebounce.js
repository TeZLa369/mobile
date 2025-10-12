import { useState, useEffect } from "react";

export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler);
    }, [value, delay])
    return debouncedValue;

}

// Custom hook to delay updating a value until user stops typing for a specified time


