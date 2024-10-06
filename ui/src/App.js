import logo from './logo.svg';
import './App.css';
import Display from './components/Display';

const App = () => <div className="App">
  <header className="header">
    <h1 className="title">Orrery</h1>
    <p className="subtitle">use your cursor to look around. press W to move forard and S to move backward</p>
  </header>

  <Display />

  <footer className="footer">
    <p className="footer-text">Created for the NASA Space Apps Challenge &copy; 2024</p>
  </footer>
</div>

export default App;
