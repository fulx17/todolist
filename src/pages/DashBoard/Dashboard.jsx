import React, { useEffect, useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import "./Dashboard.css";
import Body from "../../components/Body/Body.jsx"

const Dashboard = () => {
  const { tasks } = useTasks();
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("dashboardStats");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (!tasks.length) return;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "done").length;

    const totalEstimatedHours = tasks.reduce((sum, t) => sum + t.estimatedTime, 0) / 3600;
    const avgEstimatedTime = totalTasks ? totalEstimatedHours / totalTasks : 0;

    const lateTasks = tasks.filter(t => t.lateTime && t.lateTime > 0);
    const totalLateSeconds = lateTasks.reduce((sum, t) => sum + t.lateTime, 0);
    const averageLateSeconds = lateTasks.length ? totalLateSeconds / lateTasks.length : 0;
    const lateCount = lateTasks.length;
    const latePercent = totalTasks ? (lateCount / totalTasks) * 100 : 0;
    const longestLate = lateTasks.length
      ? Math.max(...lateTasks.map(t => t.lateTime))
      : 0;

    const newStats = {
      totalTasks,
      completedTasks,
      totalEstimatedHours,
      avgEstimatedTime,
      totalLateSeconds,
      averageLateSeconds,
      lateCount,
      latePercent,
      longestLate
    };

    setStats(newStats);
    localStorage.setItem("dashboardStats", JSON.stringify(newStats));
  }, [tasks]);

  const secondsToHHMM = (sec) => {
    const totalMinutes = Math.floor(sec / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      <Body className="dashboard-title" text={Dashboard}/>

      <div className="stats-grid">
        {/* Hàng 1 */}
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{stats.completedTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Estimated Hours</h3>
          <p>{(stats.totalEstimatedHours || 0).toFixed(2)}h</p>
        </div>
        <div className="stat-card">
          <h3>Average Estimated Time</h3>
          <p>{(stats.avgEstimatedTime || 0).toFixed(2)}h</p>
        </div>

        {/* Hàng 2 */}
        <div className="stat-card">
          <h3>Total Late Time</h3>
          <p>{secondsToHHMM(stats.totalLateSeconds || 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Average Late Time</h3>
          <p>{secondsToHHMM(stats.averageLateSeconds || 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Tasks Late</h3>
          <p>{stats.lateCount || 0} ({(stats.latePercent || 0).toFixed(1)}%)</p>
        </div>
        <div className="stat-card">
          <h3>Longest Late Task</h3>
          <p>{secondsToHHMM(stats.longestLate || 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
