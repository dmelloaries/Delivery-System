import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h1 className="bg-red-800 text-white">Vite + React</h1>
      </div>
    </>
  );
}

export default App;
