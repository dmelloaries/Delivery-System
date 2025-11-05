import { useState } from "react";
import { Button } from "./components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h1 className="bg-red-800 text-white">Vite + React</h1>
        <Button className="bg-black text-white">HGeythertger </Button>
      </div>
    </>
  );
}

export default App;
