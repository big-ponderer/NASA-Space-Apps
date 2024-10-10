import './App.css';
import Display from './components/Display';
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

const App = () => <QueryClientProvider client={queryClient}>
  <div className="App">
    <Display />

    <footer className="footer">
      <p className="footer-text">Created for the NASA Space Apps Challenge &copy; 2024</p>
    </footer>
  </div>
</QueryClientProvider>

export default App;
