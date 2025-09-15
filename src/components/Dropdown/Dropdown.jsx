import { useState, useRef, useEffect } from "react";
import "./Dropdown.css";
const options=["Work", "Study", "Sport", "Relax", "Personal", "Errands"];
function Dropdown({updateTask, task, prev }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(prev);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="dropdown" ref={dropdownRef}>
      <input
        type="text"
        readOnly
        value={selected}
        placeholder="tags"
        className="dropdown-input"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="dropdown-options">
          {options.map((opt, i) => (
            <div
              key={i}
              className="dropdown-option"
              onClick={() => {
                setSelected(opt);
                updateTask({...task, tag: opt});
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
