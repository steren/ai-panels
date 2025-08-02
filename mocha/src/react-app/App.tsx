import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import PuzzlePage from "@/react-app/pages/PuzzlePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/puzzle/:id" element={<PuzzlePage />} />
      </Routes>
    </Router>
  );
}
