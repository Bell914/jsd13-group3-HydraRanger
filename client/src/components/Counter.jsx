import React from "react";
import { useCounterStore } from "../store/useStore";
const Counter = () => {
  const { count, increment, decrement, text, setText } = useCounterStore();

  return (
    <div>
      <p>count : {count}</p>
      <button onClick={increment}>increment</button>
      <input
        type="text"
        className="bg-amber-100 border-2 text-black"
        value={text}
        placeholder="ช่างมอส ช่างต่าย"
        onChange={(e) => setText(e.target.value)}
      />
      <p>Current Text: {text}</p>
    </div>
  );
};

export default Counter;
