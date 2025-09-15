import React, { useState, useEffect } from "react";
import { useTasks } from "../../hooks/useTasks";
import { getTime } from "../../utils/taskUtils.js";
import Body from "../../components/Body/Body.jsx"
import "./TaskAlert.css";

const TaskAlert = () => {
  const { tasks, setTasks, deleteTask } = useTasks();
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const upcomingTasks = [];
    const overdueTasks = [];

    tasks.forEach(task => {
      if (task.status === "done") return;

      const taskDeadline = getTime(task.dueDate, task.dueTime);

      if (taskDeadline < now) {
        overdueTasks.push(task);
      } else {
        upcomingTasks.push(task);
      }
    });

    upcomingTasks.sort((a, b) => getTime(a.dueDate, a.dueTime) - getTime(b.dueDate, b.dueTime));
    overdueTasks.sort((a, b) => getTime(a.dueDate, a.dueTime) - getTime(b.dueDate, b.dueTime));

    setUpcoming(upcomingTasks);
    setOverdue(overdueTasks);
  }, [tasks]);

  const postponeDeadline = (taskId, days = 1) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              dueDate: new Date(new Date(task.dueDate).getTime() + days * 24 * 3600 * 1000)
                .toISOString()
                .slice(0, 10),
            }
          : task
      )
    );
  };

  return (
    <div className="task-alert-store">
      <Body text={`Task Allert`}/>
      <div className="task-alert">
        <h2>Upcoming Tasks</h2>
        {upcoming.length === 0 && <p>No upcoming tasks!</p>}
        <ul>
          {upcoming.map(task => (
            <li key={task.id} className="upcoming">
              <div className="task-title">
                <strong>{task.title}</strong> - due: {task.dueDate} {task.dueTime}
              </div>
              <button onClick={() => postponeDeadline(task.id)}>Postpone 1 day</button>
            </li>
          ))}
        </ul>

        <h2>Overdue Tasks</h2>
        {overdue.length === 0 && <p>No overdue tasks!</p>}
        <ul>
          {overdue.map(task => (
            <li key={task.id} className="overdue">
              <div className="task-title">
                <strong>{task.title}</strong> - overdue since: {task.dueDate} {task.dueTime}
              </div>
              <div className="task-actions">
                <button onClick={() => postponeDeadline(task.id)}>Postpone 1 day</button>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskAlert;
