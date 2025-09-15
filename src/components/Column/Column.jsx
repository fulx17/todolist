import { useState, useEffect, useRef, use } from "react";
import "./Column.css";
import { sortByDeadline, sortById, calculateRecomend, sortByChangeState, getTodayDate, updateLateness, secondsToHHMM} from "../../utils/taskUtils";
import Dropdown from "../Dropdown/Dropdown";

function Column({items, setItems, addTask, updateTask, deleteTask, moveToNextColumn, dailyMode, customMode, allTasks}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [text, setText] = useState("");
    
    const titleToTags = async (text) => {
        return "personal";
    };


    const [suggestions, setSuggestions] = useState([]); 

    const handleSearch = (e) => {
        const value = e.target.value;
        setText(value);
        if(value.trim() == "") {
            setSuggestions([]);
            return;
        }
        const filtered = allTasks.filter((t) => t.title.toLowerCase().startsWith(value.toLowerCase()) && !items.find((it) => it.id == t.id)).slice(0, 6);
        setSuggestions(filtered);
    };

    const addToCustom = (task) => {
        if (!items.find((it) => it.id === task.id)) {
            setItems([task, ...items]);
        }
        setText("");
        setSuggestions([]);
    };


    const columns = ["todo", "in-progress", "done"];

    const [printMethod, setPrintMethod] = useState({
        todo: sortById, 
        "in-progress": sortByChangeState, 
        done: sortByChangeState
    });
    const [buttonState, setButtonState] = useState("Deadline");
    const [pauseState, setPauseState] = useState("Pause");
    const [inprogressTask, setInprogressTask] = useState(() => {
        const saved = localStorage.getItem("inprogressTask");
        return saved ? JSON.parse(saved) : {};
    }); 

    const [secondsLeft, setSecondsLeft] = useState(() => {
        const saved = localStorage.getItem("secondsLeft");
        return saved ? JSON.parse(saved) : 0;
    });
    const [isPaused, setIsPaused] = useState(() => {
        const saved = localStorage.getItem("isPaused");
        return saved ? JSON.parse(saved) : false;
    });

    const [countDown, setCountDown] = useState(() => {
        const saved = localStorage.getItem("countDown");
        return saved ? JSON.parse(saved) : 0
    });
    const [usedTime, setUsedTime] = useState(() => {
        const saved = localStorage.getItem("usedTime");
        return saved ? JSON.parse(saved) : 0
    });


    useEffect(() => {
        localStorage.setItem("inprogressTask", JSON.stringify(inprogressTask));
    }, [inprogressTask]);

    useEffect(() => {
        localStorage.setItem("secondsLeft", JSON.stringify(secondsLeft));
    }, [secondsLeft]);

    useEffect(() => {
        localStorage.setItem("isPaused", JSON.stringify(isPaused));
    }, [isPaused]);

    useEffect(() => {
        localStorage.setItem("countDown", JSON.stringify(countDown));
    }, [isPaused]);
    useEffect(() => {
        isPaused ? setPauseState("Continue") : setPauseState("Pause");
    }, [isPaused]);

    

    useEffect(() => {
        if (secondsLeft <= 0 || isPaused) return;

        const interval = setInterval(() => {
            setSecondsLeft(prev => Math.max(prev - 1, 0));
        }, 960);

        return () => clearInterval(interval);
    }, [isPaused, secondsLeft]);

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, "0");
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };
    return (
        <>
        {Object.keys(inprogressTask).length !== 0 && (
            <div className="count-down-store">
                <div className="count-down-clock">{formatTime(secondsLeft)}</div>
                <button 
                    className="pause-button" 
                    onClick={() => {
                        if(isPaused) {
                            setIsPaused(false);
                            setCountDown(Date.now());
                        }
                        else {
                            setIsPaused(true);
                            setUsedTime(usedTime + Date.now() - countDown);
                        }
                    }}
                >
                    {pauseState}
                </button>
            </div>
        )}
        <div className="column-store">
            {columns.map((col) => (
                <div className={`column-${col}`}>
                    {
                        col !== "todo" ? (
                            <h3>{col.toLocaleUpperCase()}</h3>
                        ) : (
                            <div className="todo-header">
                                <div className="todo-header-left">
                                    <h3>{col.toLocaleUpperCase()}</h3>
                                </div>
                                <div className="todo-header-right">
                                    <p>Sort by:</p>
                                    <button
                                        onClick={() => {
                                            if(buttonState === "Deadline") {
                                                setButtonState("Default");
                                                setPrintMethod(prev => ({...prev, todo: sortByDeadline}));
                                            }
                                            else {
                                                setButtonState("Deadline");
                                                setPrintMethod(prev => ({...prev, todo: sortById}));
                                            }
                                        }}
                                    >
                                        {buttonState}
                                    </button>
                                </div>
                            </div>
                        )
                    }
                    {col === "todo" && (
                        <>
                            {
                                !customMode ? (
                                    <input 
                                        type="text"
                                        placeholder="New activity..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key == "Enter" && text.trim() !== "") {
                                                titleToTags(text)
                                                    .then(result => addTask(text, getTodayDate(), "23:59", 0, 30, result.charAt(0).toUpperCase() + result.slice(1)))
                                                setText("");
                                            }
                                        }}
                                        className="column-input"
                                    />
                                ) : (
                                    <div className="custom-search">
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={text}
                                            onChange={handleSearch}
                                            className="column-input" 
                                        />
                                        {suggestions.length > 0 && (
                                            <ul className="suggestion-list">
                                            {suggestions.map((s) => (
                                                <li key={s.id} className="suggestion-item" onClick={() => addToCustom(s)}>
                                                {s.title}
                                                </li>
                                            ))}
                                            </ul>
                                        )}
                                    </div>
                                )
                            }
                        
                        </>
                    )}
                    {items.filter((item) => item.status === col).sort(printMethod[col]).map((item) => (
                        <div key={item.id} className={`column-item-${item.status}`}>
                            <span className="item-content" onClick={() => setSelectedItem(item)}>
                                {item.title}
                            </span>
                            <button
                                className={`next-btn-${col}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(item.status === "todo")  {
                                        if(!items.some(task => task.status === "in-progress")) {
                                            setInprogressTask(item);
                                            dailyMode ? setSecondsLeft(item.recomendTime) : setSecondsLeft(item.estimatedTime);
                                            setIsPaused(false);
                                            setCountDown(Date.now());
                                            moveToNextColumn(item.id);
                                        }
                                        else alert("Already have task in progress");
                                    }
                                    else if(item.status === "in-progress") {
                                        setInprogressTask({});
                                        setSecondsLeft(0);
                                        setIsPaused(true);
                                        updateTask(item.id, {usedTime: Math.floor((usedTime + Date.now() - countDown) / 1000)});
                                        setUsedTime(0);
                                        moveToNextColumn(item.id);
                                        const x =  Math.floor((usedTime + Date.now() - countDown) / 1000) / item.estimatedTime;
                                        updateLateness(item.tag, x, true);
                                    }
                                    else moveToNextColumn(item.id);
                                }}
                            >
                                ➤
                            </button>
                            <button
                                className={`pre-btn-${col}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(item.status === "in-progress") {
                                        setInprogressTask({});
                                        setIsPaused(true);
                                        setSecondsLeft(0);
                                        setUsedTime(0);
                                    }
                                    deleteTask(item.id);
                                }}
                            >
                                🗑
                            </button>
                        </div>
                    ))}
                </div>
            ))}
            {selectedItem && (
            <div
                className="modal-overlay"
                onClick={() => setSelectedItem(null)}
            >
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="todo-header">
                        <div className="todo-header-left">
                            <input 
                                type="text"
                                value={selectedItem.title}
                                onChange={(e) =>
                                    setSelectedItem({ ...selectedItem, title: e.target.value })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && selectedItem.title.trim() !== "") {
                                        updateTask(selectedItem.id, {title: selectedItem.title});
                                    }
                                }}
                                onBlur={() => {
                                    if(selectedItem.title.trim() !== "") {
                                        updateTask(selectedItem.id, {title: selectedItem.title});
                                    }
                                }}
                                className="modal-title-input"
                            />
                        </div> 
                        <div className="todo-header-right">
                            <p>Tags:</p>   
                            <Dropdown task={selectedItem} prev={selectedItem.tag} updateTask={(it) => {
                                setSelectedItem({...it, recomendTime: calculateRecomend(it.estimatedHours, it.estimatedMinutes, it.tag)}); 
                            }}/>
                        </div>
                    </div>
                    <div className="detail-store">
                        <div className="detail-name">Due Date</div>
                        <input 
                            type="date" 
                            value={selectedItem.dueDate || ""} 
                            onChange={(e) =>
                                setSelectedItem({ ...selectedItem, dueDate: e.target.value })
                            }
                            className="detail-input"
                        />

                    </div>
                    <div className="detail-store">
                        <div className="detail-name">Due Time</div>
                        <input
                        type="time"
                        step="60"
                        value={selectedItem.dueTime || ""}
                        onChange={(e) =>
                            setSelectedItem({ ...selectedItem, dueTime: e.target.value })
                        }
                        className="detail-input"
                        />
                    </div>

                    <div className="detail-store">
                    <div className="detail-name">Estimated Time</div>
                        <div className="detail-estimate-time">
                            <input
                                type="number"
                                min={0}
                                max={23}
                                value={selectedItem.estimatedHours || ""}
                                onChange={(e) => {
                                const hours = parseInt(e.target.value) || 0;
                                const minutes = parseInt(selectedItem.estimatedMinutes) || 0;
                                setSelectedItem({ 
                                    ...selectedItem, 
                                    estimatedHours: hours,
                                    estimatedTime: (hours * 60 + minutes) * 60,
                                    recomendTime: calculateRecomend(hours, minutes, selectedItem.tag)
                                });
                                }}
                                className="detail-input"
                                placeholder="hours"
                            />
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    height: "30px"
                                }}
                            >
                                :
                            </span>
                            <input
                                type="number"
                                min={0}
                                max={59}
                                value={selectedItem.estimatedMinutes || ""}
                                onChange={(e) => {
                                const minutes = parseInt(e.target.value) || 0;
                                const hours = parseInt(selectedItem.estimatedHours) || 0;
                                setSelectedItem({ 
                                    ...selectedItem, 
                                    estimatedMinutes: minutes,
                                    estimatedTime: (hours * 60 + minutes) * 60,
                                    recomendTime: calculateRecomend(hours, minutes, selectedItem.tag)
                                });
                                }}
                                className="detail-input"
                                placeholder="minutes"
                            />
                        </div>
                    </div>
                    {dailyMode && 
                        <div className="detail-store">Recomended Time: {secondsToHHMM(selectedItem.recomendTime)}</div>
                    }
                    <div className="detail-store">
                        <div className="detail-name">Description</div>
                            <textarea
                                placeholder="Describe your task..."
                                value={selectedItem.description || ""}
                                onChange={(e) => {
                                    setSelectedItem({ ...selectedItem, description: e.target.value });
                                    e.target.style.height = "auto"; 
                                    e.target.style.height = e.target.scrollHeight + "px"; 
                                }}
                                className="detail-input"
                                style={{
                                    overflowY: "auto",
                                    minHeight: "80px",
                                    maxHeight: "200px",
                                }}
                            />
                        </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedItem.title.trim() !== "") {
                                updateTask(selectedItem.id, selectedItem);
                            }
                            setSelectedItem(null); 
                        }}
                        >
                        Save
                    </button>
                </div>
            </div>)}
        </div>
        </>
    );
}

export default Column