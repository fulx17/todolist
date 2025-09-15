export const getTasksFromStorage = (itemId) => {
  const saved = localStorage.getItem(itemId);
  return saved ? JSON.parse(saved) : [];
};

export const setTasksToStorage = (tasks, itemId) => {
  localStorage.setItem(itemId, JSON.stringify(tasks));
};

export const getTime = (date, time) => {
  const datetime = `${date}T${time}:00`;
  const d = new Date(datetime);
  return Math.floor(d.getTime() / 1000);
}

export const getTodayDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getNextDate = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function daysBetween(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diffMs = dateB - dateA;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

export function secondsToHHMM(totalSeconds) {
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
}


export const sortByDeadline = (a, b) => {
  const diff = getTime(a.dueDate, a.dueTime) - getTime(b.dueDate, b.dueTime);
  if(diff == 0) return a.id - b.id;
  return diff;
}
export const sortById = (a, b) => a.id - b.id;

export const sortByPriority = (a, b) => a.inportance - b.importance;

export const sortByChangeState = (a, b) => b.changeState - a.changeState;

export const calculateRecomend = (hour, minute, tag) => {
  const itemStr = localStorage.getItem(`${tag}`);
  const estimatedTime = (hour * 60 + minute) * 60;
  if (!itemStr) {
    return estimatedTime;
  }

  const stats = JSON.parse(itemStr);

  if (stats.n < 2) {
    return estimatedTime;
  }

  const variance = stats.M2 / (stats.n - 1);
  const stdDev = Math.sqrt(variance);
  const SE = stdDev / Math.sqrt(stats.n);
  const CI95_upper = stats.mean + 1.96 * SE;


  // Recommended time = estimatedTime * (1 + CI95_upper)
  const recommendedTime = Math.ceil(estimatedTime * CI95_upper);

  return recommendedTime;
};


// CI 95% for lateness percentage of each tag
export const updateLateness = (tag, x, add = true) => {
  const itemStr = localStorage.getItem(`${tag}`);
  let stats = itemStr
    ? JSON.parse(itemStr)
    : { mean: 0, M2: 0, n: 0 };

  if (add) {
    stats.n += 1;
    const delta = x - stats.mean;
    stats.mean += delta / stats.n;
    stats.M2 += delta * (x - stats.mean);
  } else {
    if (stats.n <= 1) {
      stats = { mean: 0, M2: 0, n: 0 };
    } else {
      const delta = x - stats.mean;
      const meanNew = (stats.mean * stats.n - x) / (stats.n - 1);
      stats.M2 -= delta * (x - meanNew);
      stats.mean = meanNew;
      stats.n -= 1;
    }
  }
  localStorage.setItem(`${tag}`, JSON.stringify(stats));
};


// optimizing

const dayBegin = "08:00", dayEnd = "23:00";


// sorting tasks by deadline, filter "done" tasks and "in-progress" task
const normalizeTask = (tasks) => {
  const temp = tasks.filter(task => task.status !== "done");
  if(temp.some(task => task.status === "in-progress")) {
    return [[...temp.filter(task => task.status === "in-progress"), ...temp.filter(task => task.status !== "in-progress").sort(sortByDeadline)], 1];
  }
  return [temp.sort(sortByDeadline), 0];
}

// checking for binary search
const checkDayLimit = (limit, tasks) => {
  let todayDate = getTodayDate();
  let startTime = Math.max(Math.floor(Date.now() / 1000), getTime(todayDate, dayBegin));
  let endTime = startTime + limit;
  let count = 1;
  const maxTask = tasks.reduce((prev, curr) => 
    new Date(curr.dueDate) > new Date(prev.dueDate) ? curr : prev
  );
  const minTask = tasks.reduce((prev, curr) => 
    new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev
  );
  const diffDays = daysBetween(minTask.dueDate, maxTask.dueDate);

  for (let task of tasks) {
    if(task.recomendTime > limit) {
      return false;
    }
    if (startTime + task.recomendTime > endTime) {
      todayDate = getNextDate(todayDate);
      startTime = getTime(todayDate, dayBegin);
      endTime = startTime + limit;
      count++;
    }
    if (startTime + task.recomendTime > getTime(task.dueDate, task.dueTime)) return false;
    startTime += task.recomendTime;
  }
  return count <= diffDays;
};

// binary search the limit time for each days base on current tasks distribution
const minimizeDayLimit = (tasks) => {
  let lowerBound = 0, upperBound = 57_600; // 16h
  let result = upperBound;

  while (lowerBound <= upperBound) {
    const mid = Math.floor((lowerBound + upperBound) / 2);
    if (checkDayLimit(mid, tasks)) {
      result = mid;
      upperBound = mid - 1;
    } else {
      lowerBound = mid + 1;
    }
  }
  return result;
};


// evaluate function for 2-opt swap base on tardiness, standard deviation of time used per day and slack
const evaluate = (tasks, flag, w1 = 0.5, w2 = 0.3, w3 = 0.2,) => {
  let limit = minimizeDayLimit(tasks);
  let todayDate = getTodayDate();
  let startTime = Math.max(Math.floor(Date.now() / 1000), getTime(todayDate, dayBegin));
  let endTime = startTime + limit;

  const maxTask = tasks.reduce((prev, curr) => 
    new Date(curr.dueDate) > new Date(prev.dueDate) ? curr : prev
  );
  const minTask = tasks.reduce((prev, curr) => 
    new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev
  );

  const diffDays = daysBetween(minTask.dueDate, maxTask.dueDate);

  let days = [];
  let currentTime = 0;
  let daysTask = [];
  let currentTask = [];
  let tardiness = 0;
  let slackMax = 1, slackMin = 2_592_000;
  let workTime = 0;

  // mimic the checking function
  for (let task of tasks) {
    if (startTime + task.recomendTime > endTime) {
      todayDate = getNextDate(todayDate);
      startTime = getTime(todayDate, dayBegin);
      endTime = startTime + limit;
      days.push(currentTime);
      currentTime = 0;
      daysTask.push(currentTask);
      currentTask = []
    }
    const taskDeadline = getTime(task.dueDate, task.dueTime);
    startTime += task.recomendTime;
    workTime += task.recomendTime;
    currentTime += task.recomendTime;
    currentTask.push(task);
    tardiness += Math.max(0, startTime - taskDeadline);
    slackMin = Math.min(slackMin, Math.max(0, taskDeadline - startTime));   
    slackMax = Math.max(slackMax, Math.max(0, taskDeadline - startTime));
  }
  days.push(currentTime);
  daysTask.push(currentTask);

  // standard deviation 
  const mean = days.reduce((sum, val) => sum + val, 0) / diffDays;
  const variance = days.reduce((sum, val) => sum + (val - mean) ** 2, 0) / diffDays;
  const std = Math.sqrt(variance);

  // normalize
  const stdNorm = std / Math.max(...days);
  const tardinessNorm = tardiness / (tardiness + workTime);
  const slackNorm = 1 - slackMin / slackMax;
  if(flag === 0) return  w1 * tardinessNorm + w2 * stdNorm + w3 * slackNorm;
  return daysTask;
}

// 2-opt for best 
export const twoOpt = (tasks) => {
  if(tasks.length === 0) return [[]];
  let improve = true; 
  let [best, start] = normalizeTask(tasks);
  let bestCost = evaluate(best);
  let loop = 100;
  while(--loop && improve) {
    improve = false;
    for(let i = start; i < tasks.length; i++) {
      for(let j = i + 1; j < tasks.length; j++) {
        let candidate = JSON.parse(JSON.stringify(best));
        [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
        let cost = evaluate(candidate, 1);
        if(cost < bestCost) {
          best = candidate;
          bestCost = cost;
          improve = true;
        }  
      }
    }
  }
  const bestDistributed = evaluate(best, 1);
  return bestDistributed;
}

const tasks = [
  {
    id: Date.now() + 1,
    title: "Finish project report",
    description: "Write the final report for Q3 project",
    dueDate: "2025-09-20",
    dueTime: "17:00",
    estimatedTime: 2 * 3600,
    changeState: 0,
    estimatedHours: 2,
    estimatedMinutes: 0,
    status: "todo",
    tag: "work",
    recomendTime: 2 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 2,
    title: "Team meeting",
    description: "Weekly sync with the dev team",
    dueDate: "2025-09-15",
    dueTime: "10:00",
    estimatedTime: 1 * 3600,
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 0,
    status: "todo",
    tag: "meeting",
    recomendTime: 1 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 3,
    title: "Prepare client presentation",
    description: "Slides for the new product pitch",
    dueDate: "2025-09-16",
    dueTime: "14:00",
    estimatedTime: 3 * 3600,
    changeState: 0,
    estimatedHours: 3,
    estimatedMinutes: 0,
    status: "todo",
    tag: "work",
    recomendTime: 3 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 4,
    title: "Doctor appointment",
    description: "Annual health checkup",
    dueDate: "2025-09-18",
    dueTime: "09:00",
    estimatedTime: (1 * 3600) + (30 * 60),
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 30,
    status: "todo",
    tag: "personal",
    recomendTime: (1 * 3600) + (30 * 60),
    usedTime: 0,
  },
  {
    id: Date.now() + 5,
    title: "Code review",
    description: "Review PRs on GitHub",
    dueDate: "2025-09-15",
    dueTime: "18:00",
    estimatedTime: 2 * 3600,
    changeState: 0,
    estimatedHours: 2,
    estimatedMinutes: 0,
    status: "todo",
    tag: "work",
    recomendTime: 2 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 6,
    title: "Grocery shopping",
    description: "Weekly grocery run",
    dueDate: "2025-09-17",
    dueTime: "20:00",
    estimatedTime: 1 * 3600,
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 0,
    status: "todo",
    tag: "personal",
    recomendTime: 1 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 7,
    title: "Prepare budget proposal",
    description: "Draft Q4 budget report",
    dueDate: "2025-09-19",
    dueTime: "15:00",
    estimatedTime: 4 * 3600,
    changeState: 0,
    estimatedHours: 4,
    estimatedMinutes: 0,
    status: "todo",
    tag: "finance",
    recomendTime: 4 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 8,
    title: "Call supplier",
    description: "Follow up on raw material delivery",
    dueDate: "2025-09-15",
    dueTime: "11:30",
    estimatedTime: 30 * 60,
    changeState: 0,
    estimatedHours: 0,
    estimatedMinutes: 30,
    status: "todo",
    tag: "work",
    recomendTime: 30 * 60,
    usedTime: 0,
  },
  {
    id: Date.now() + 9,
    title: "Organize project kickoff",
    description: "Kickoff meeting for new client project",
    dueDate: "2025-09-21",
    dueTime: "09:30",
    estimatedTime: (2 * 3600) + (30 * 60),
    changeState: 0,
    estimatedHours: 2,
    estimatedMinutes: 30,
    status: "todo",
    tag: "meeting",
    recomendTime: (2 * 3600) + (30 * 60),
    usedTime: 0,
  },
  {
    id: Date.now() + 10,
    title: "Read research paper",
    description: "AI conference proceedings",
    dueDate: "2025-09-22",
    dueTime: "22:00",
    estimatedTime: (1 * 3600) + (45 * 60),
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 45,
    status: "todo",
    tag: "learning",
    recomendTime: (1 * 3600) + (45 * 60),
    usedTime: 0,
  },
  {
    id: Date.now() + 11,
    title: "Workout session",
    description: "Gym training - legs day",
    dueDate: "2025-09-15",
    dueTime: "19:00",
    estimatedTime: 1 * 3600,
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 0,
    status: "todo",
    tag: "health",
    recomendTime: 1 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 12,
    title: "Call parents",
    description: "Weekly catch-up with family",
    dueDate: "2025-09-16",
    dueTime: "20:00",
    estimatedTime: 45 * 60,
    changeState: 0,
    estimatedHours: 0,
    estimatedMinutes: 45,
    status: "todo",
    tag: "personal",
    recomendTime: 45 * 60,
    usedTime: 0,
  },
  {
    id: Date.now() + 13,
    title: "Study machine learning",
    description: "Finish reading Chapter 5 of ML textbook",
    dueDate: "2025-09-17",
    dueTime: "23:00",
    estimatedTime: 2 * 3600,
    changeState: 0,
    estimatedHours: 2,
    estimatedMinutes: 0,
    status: "todo",
    tag: "learning",
    recomendTime: 2 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 14,
    title: "Backup server data",
    description: "Monthly full backup",
    dueDate: "2025-09-20",
    dueTime: "01:00",
    estimatedTime: 3 * 3600,
    changeState: 0,
    estimatedHours: 3,
    estimatedMinutes: 0,
    status: "todo",
    tag: "work",
    recomendTime: 3 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 15,
    title: "Dinner with friends",
    description: "Catch up at the new Italian restaurant",
    dueDate: "2025-09-19",
    dueTime: "19:30",
    estimatedTime: 2 * 3600,
    changeState: 0,
    estimatedHours: 2,
    estimatedMinutes: 0,
    status: "todo",
    tag: "personal",
    recomendTime: 2 * 3600,
    usedTime: 0,
  },
  {
    id: Date.now() + 16,
    title: "Update documentation",
    description: "Revise API docs for new release",
    dueDate: "2025-09-18",
    dueTime: "16:00",
    estimatedTime: (1 * 3600) + (30 * 60),
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 30,
    status: "todo",
    tag: "work",
    recomendTime: (1 * 3600) + (30 * 60),
    usedTime: 0,
  },
  {
    id: Date.now() + 17,
    title: "Laundry",
    description: "Wash and fold clothes",
    dueDate: "2025-09-15",
    dueTime: "21:00",
    estimatedTime: 1 * 3600,
    changeState: 0,
    estimatedHours: 1,
    estimatedMinutes: 0,
    status: "todo",
    tag: "personal",
    recomendTime: 1 * 3600,
    usedTime: 0,
  },
  // {
  //   id: Date.now() + 18,
  //   title: "Fix production bug",
  //   description: "Urgent hotfix for login API",
  //   dueDate: "2025-09-14",
  //   dueTime: "23:59",
  //   estimatedTime: 2 * 3600,
  //   changeState: 0,
  //   estimatedHours: 2,
  //   estimatedMinutes: 0,
  //   status: "todo",
  //   tag: "urgent",
  //   recomendTime: 2 * 3600,
  //   usedTime: 0,
  // },
  // {
  //   id: Date.now() + 19,
  //   title: "Brainstorm marketing ideas",
  //   description: "Plan social media campaign",
  //   dueDate: "2025-09-21",
  //   dueTime: "11:00",
  //   estimatedTime: 2 * 3600,
  //   changeState: 0,
  //   estimatedHours: 2,
  //   estimatedMinutes: 0,
  //   status: "todo",
  //   tag: "marketing",
  //   recomendTime: 2 * 3600,
  //   usedTime: 0,
  // },
  // {
  //   id: Date.now() + 20,
  //   title: "Meditation",
  //   description: "Daily mindfulness session",
  //   dueDate: "2025-09-15",
  //   dueTime: "07:00",
  //   estimatedTime: 30 * 60,
  //   changeState: 0,
  //   estimatedHours: 0,
  //   estimatedMinutes: 30,
  //   status: "todo",
  //   tag: "health",
  //   recomendTime: 30 * 60,
  //   usedTime: 0,
  // },
];
