import { useState, useEffect } from "react";
import { getTasksFromStorage, setTasksToStorage, calculateRecomend } from "../utils/taskUtils";

export function useTasks(itemId = "tasks") {
  const [tasks, setTasks] = useState(() => {
    return getTasksFromStorage(itemId);
  });


  useEffect(() => {
    setTasks(getTasksFromStorage(itemId));
  }, []);


   useEffect(() => {
    setTasksToStorage(tasks, itemId);
  }, [tasks, itemId])  
  const addTask = (title, dueDate, dueTime, estimatedHours, estimatedMinutes, tag) => {
    const newTask = {
      id: Date.now(),
      title,
      description: "",
      dueDate,
      dueTime,
      estimatedTime: (estimatedHours * 60 + estimatedMinutes) * 60,
      changeState: 0,
      estimatedHours,
      estimatedMinutes,
      status: "todo",
      tag,
      recomendTime: calculateRecomend(estimatedHours, estimatedMinutes, tag),
      usedTime: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask.id;
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const moveToNextColumn = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          let [next, state] =
            t.status === "todo"
              ? ["in-progress", Date.now()]
              : t.status === "in-progress"
              ? ["done", Date.now()]
              : ["done", t.changeState];
          return { ...t, status: next, changeState: state };
        }
        return t;
      })
    );
  };

  return { tasks, setTasks, addTask, deleteTask, updateTask, moveToNextColumn };
}

