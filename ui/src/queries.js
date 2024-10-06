export const fetchSystem = async () => {
    const response = await fetch('http://localhost:8000/solarsystem')
    const data = await response.json()
    return data
}