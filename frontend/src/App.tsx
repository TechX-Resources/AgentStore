import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AgentsPage from './pages/AgentsPage'
import AgentDetailPage from './pages/AgentDetailPage'
import ToolsPage from './pages/ToolsPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="logo">
          <h1><span className="harsh-style">/</span>AgentStore</h1>
          <p className="tagline">Workspace marketplace</p>
        </Link>
        <nav>
          <Link to="/agents"><span className="harsh-style">#</span>agents</Link>
          <Link to="/tools"><span className="harsh-style">#</span>tools</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </main>
      <footer>
        <p>AgentStore — TechX Student Project (Skeleton)</p>
      </footer>
    </div>
  )
}

export default App
