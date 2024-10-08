# Big Rolly

Big Rolly is an interactive digital orrery designed for educational purposes, allowing users to explore the solar system in a unique and engaging way. The application features two main views:

1. **Broad View**: A comprehensive overview of the solar system, displaying the planets from the Sun to Jupiter, along with the density of asteroids in the asteroid belt.
2. **Detailed View**: A 3D simulation that lets users click into specific sections of the orrery to fly around and explore a rich environment filled with asteroids.

## Project Structure

The project consists of two main subfolders:

- **api**: Contains the backend components.
- **ui**: Contains the frontend components.

## Installation and Running

To set up and run Big Rolly, follow these steps:

1. **Navigate to the API directory**:
   ```bash
   cd api
   ```
   Install the necessary dependencies:
   ```bash
   pip install fastapi uvicorn httpx
   ```
   Start the API server:
   ```bash
   uvicorn main:app --reload
   ```

2. **Navigate to the UI directory**:
   ```bash
   cd ../ui
   ```
   Install the required frontend packages:
   ```bash
   npm install
   ```
   Start the UI application:
   ```bash
   npm start
   ```

## Usage

Once both the API and UI are running, you can access the interactive digital orrery through your web browser. Have fun!
