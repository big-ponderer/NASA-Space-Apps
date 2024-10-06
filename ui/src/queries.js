export const fetchSystem = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/solarsystem`)
    const data = await response.json()
    return data
}