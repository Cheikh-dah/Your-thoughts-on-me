import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VotePage from './components/VotePage';
import ResultsPage from './components/ResultsPage';
import chdImg from '../picts/chd.jpeg';

function App() {
    return (
        <Router>
            <div className="app-container">
                <h1>شنه رأيك فالشيخ الداه</h1>
                <img src={chdImg} alt="الشيخ الداه" className="profile-image" />
                <Routes>
                    <Route path="/" element={<VotePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
