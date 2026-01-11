import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentJoin from './pages/StudentJoin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentJoin />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Live Polling System</h1>
        <p>Real-time polling with synchronized timers</p>
        
        <div className="role-selection">
          <Link to="/teacher" className="role-card teacher-card">
            <div className="role-icon">👨‍🏫</div>
            <h2>I'm a Teacher</h2>
            <p>Create and manage polls</p>
          </Link>
          
          <Link to="/student" className="role-card student-card">
            <div className="role-icon">👨‍🎓</div>
            <h2>I'm a Student</h2>
            <p>Join and participate in polls</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
