import React from "react";
import Robo from "../../assets/react.svg";
import "./About.css";
import { color } from "framer-motion";
import { Weight } from "lucide-react";

const About = () => {
  return (
    <div className="about">
      <div className="left">
        <img src={Robo} alt="" />
      </div>
      <div className="right">
        <strong style={{ color: "blue", fontWeight: "bold", fontSize: "30px" }}>
          Welcome to Fresherbot – Your Gateway to Excellence! 🌟
        </strong>
        <br /> Step into the future of learning with Fresherbot, an AI-powered
        platform engineered to elevate your interview preparation and career
        readiness. Experience cutting-edge tools, personalized guidance, and
        innovative resources tailored to unlock your true potential. Get ready
        to conquer challenges and stand out in every opportunity! 🚀✨
      </div>
    </div>
  );
};

export default About;
