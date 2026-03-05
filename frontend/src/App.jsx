import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import TripPlanner from './pages/tripPlanner';
import TripResult from './pages/tripResult';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<TripPlanner />} />
        <Route path="/result" element={<TripResult />} />
      </Routes>
    </Router>
  );
}

export default App;
