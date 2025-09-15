import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      <h1>About This Web App</h1>

      <p>
        This web application is designed to help users manage tasks efficiently
        and track their productivity. It features six main pages, each serving
        a specific purpose:
      </p>

      <ul>
        <li>
          <strong>Home:</strong> Displays all tasks in a 3-column Kanban board.
          Users can add tasks, view details, edit information such as due date,
          time, estimated time, and mark tasks as in-progress or done.
        </li>
        <li>
          <strong>About:</strong> Introduces the app and explains its features.
        </li>
        <li>
          <strong>Smart Plan:</strong> Similar to Home but adds estimated
          completion times based on past behavior. It also provides suggested
          schedules to balance work and reduce late tasks.
        </li>
        <li>
          <strong>Custom:</strong> Allows users to create a personalized daily
          plan by selecting tasks from the Home task pool.
        </li>
        <li>
          <strong>Dashboard:</strong> Shows user statistics including the number
          of tasks, completed tasks, late tasks, self-evaluated time, and
          actual execution time.
        </li>
        <li>
          <strong>Task Alert:</strong> Orders tasks by increasing deadline to
          focus on upcoming tasks and highlights overdue tasks. Users can
          quickly postpone deadlines.
        </li>
      </ul>

      <p>
        All tasks have a built-in timer that can be paused and resumed,
        providing precise tracking of working time and helping users stay
        focused and organized.
      </p>

      <p>
        This app is designed to maximize productivity, help balance workload,
        and ensure deadlines are met efficiently.
      </p>
    </div>
  );
};

export default About;
