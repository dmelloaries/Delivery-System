import Header from "@/components/Header";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import React from "react";

const Home = () => {
  return (
    <div>
      <Header></Header>
      <div>
        <h1>This is Home page</h1>
        <AnimatedCircularProgressBar
          value={50}
          gaugePrimaryColor={"green"}
          gaugeSecondaryColor={"blue"}
        ></AnimatedCircularProgressBar>
      </div>
    </div>
  );
};

export default Home;
