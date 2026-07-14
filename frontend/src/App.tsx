import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AgentsPage from "./pages/AgentsPage";
import AgentDetailPage from "./pages/AgentDetailPage";
import ToolsPage from "./pages/ToolsPage";
import TrendingPage from "./pages/TrendingPage";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="logo">
          <h1>AgentStore</h1>
          <p className="tagline">The App Store for Agents</p>
        </Link>
        <nav>
          <Link to="/agents">Agents</Link>
          <Link to="/tools">Tools</Link>
          <Link to="/trending">Trending</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/trending" element={<TrendingPage />} />
        </Routes>
      </main>
      <footer>
        <p>AgentStore — TechX Student Project (Skeleton)</p>
      </footer>
    </div>
  );
}

export default App;
