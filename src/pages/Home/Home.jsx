import Column from "../../components/Column/Column";
import Quote from "../../components/Quote/Quote"
import { useTasks } from "../../hooks/useTasks";
import "./Home.css";

export default function Home() {
  const { tasks, setTasks, addTask, deleteTask, updateTask, moveToNextColumn } = useTasks();
  const { deleteTask: deleteCustom } = useTasks("customTasks")

  return (
    <div className="home-body">
      <Quote />
      <Column
        items={tasks}
        setItems={setTasks}
        addTask={addTask}
        deleteTask={(id) => {
          deleteTask(id);
          deleteCustom(id);
        }}
        updateTask={updateTask}
        moveToNextColumn={moveToNextColumn}
        dailyMode={false}
        customMode={false}
        allTasks={tasks}
      />
    </div>
  );
}
