import Header from "./components/Header/Header.jsx";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const About = lazy(() => import("./pages/About/About.jsx"));
const DailySchedule = lazy(() => import("./pages/DailySchedule/DailySchedule.jsx"));
const Custom = lazy(() => import("./pages/Custom/Custom.jsx"));
const TaskAlert = lazy(() => import("./pages/TaskAlerts/TaskAlert.jsx"));
const DashBoard = lazy(() => import("./pages/DashBoard/Dashboard.jsx"));

function App() {
  return (
    <Router>
      <Header/>
      <Suspense fallback={<div style={{ textAlign: "center", marginTop: "50px", fontSize: "25px", fontFamily:"\'Dancing Script\', cursive" }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/DailySchedule" element={<DailySchedule />} />
          <Route path="/Custom" element={<Custom />} />
          <Route path="/TaskAllert" element={<TaskAlert/>}/>
          <Route path="/DashBoard" element={<DashBoard/>}/>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App