import { useState } from "react";
import Body from "../../components/Body/Body";
import Column from "../../components/Column/Column";
import { useTasks } from "../../hooks/useTasks";
import "./Custom.css";

export default function Custom() {

  const { tasks, setTasks, addTask, deleteTask, updateTask, moveToNextColumn } = useTasks();
   const {
    tasks: tasksDy,
    setTasks: setTasksDy,
    addTask: addTaskDy,
    deleteTask: deleteTaskDy,
    updateTask: updateTaskDy,
    moveToNextColumn: moveToNextColumnDy
  } = useTasks("customTasks");


  return (
    <div className="Custom-body">
      <Body text={"Custom"}/>
      <Column
        items={tasksDy}
        setItems={setTasksDy}
        addTask={(title) => {
          const today = new Date().toISOString().split("T")[0];
          addTask(title, today, "23:59"); 
          addTaskDy(title, today, "23:59");
        }}
        deleteTask={(id) => {
          deleteTaskDy(id);
        }}
        updateTask={(id, updates) => {
          updateTask(id, updates);
          updateTaskDy(id, updates);
        }}
        moveToNextColumn={(id) => {
          moveToNextColumn(id);
          moveToNextColumnDy(id);
        }}
        dailyMode={true}
        customMode={true}
        allTasks={tasks}
      />
    </div>
  );
}
