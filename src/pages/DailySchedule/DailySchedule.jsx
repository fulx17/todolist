import Body from "../../components/Body/Body";
import Column from "../../components/Column/Column";
import { useTasks } from "../../hooks/useTasks";
import {twoOpt} from "../../utils/taskUtils" 
import "./DailySchedule.css";

export default function DailySchedule() {
  const { tasks, setTasks, addTask, deleteTask, updateTask, moveToNextColumn } = useTasks();
   const {
    tasks: tasksDy,
    setTasks: setTasksDy,
    addTask: addTaskDy,
    deleteTask: deleteTaskDy,
    updateTask: updateTaskDy,
    moveToNextColumn: moveToNextColumnDy
  } = useTasks("smartTasks");

  return (
    <div className="daily-schedule-body">
      <Body text={`Smart Plan`}/>
      <button className="calc" onClick={() => {
        setTasksDy(twoOpt(tasks)[0]);
      }}>Calulate</button>
      <Column
        items={tasksDy}
        setItems={setTasksDy}
        addTask={(title) => {
          const today = new Date().toISOString().split("T")[0];
          addTask(title, today, "23:59"); 
          addTaskDy(title, today, "23:59");
        }}
        deleteTask={(id) => {
          deleteTask(id);
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
