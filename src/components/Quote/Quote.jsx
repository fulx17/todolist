import "./Quote.css"
import { useState, useEffect } from "react";
import quotesData from "./quotes.json";

export default function Quote() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const today = new Date();
    const dayIndex = today.getDate(); 

    const selectedQuote = quotesData[dayIndex % quotesData.length];
    setQuote(selectedQuote);
  }, []);

  return (
    <div className="quote-store">
      {quote}
    </div>
  );
}