import { useEffect, useState } from "react"

export function useDebonceValue<T = unknown>(value: T, delay: number) {
    const [debounceValue, setDebounceValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }

    }, [value, delay])
    return debounceValue
}

