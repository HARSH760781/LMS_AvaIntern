import React from "react";
import Robo from "../../assets/react.svg";
import { Rocket, Sparkles, Target } from "lucide-react";

const About = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Left - Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={Robo}
              alt="Fresherbot AI"
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-2xl object-cover shadow-lg"
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Right - Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Fresherbot
            </h2>
          </div>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4">
            Your Gateway to Excellence! 🌟
          </p>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            Step into the future of learning with Fresherbot, an AI-powered
            platform engineered to elevate your interview preparation and career
            readiness. Experience cutting-edge tools, personalized guidance, and
            innovative resources tailored to unlock your true potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <Rocket className="w-4 h-4" />
              <span>AI-Powered Learning</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Personalized Guidance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <Target className="w-4 h-4" />
              <span>Career Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
