import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-9999">
      <motion.div
        className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.9,
          ease: "linear",
        }}
      ></motion.div>
    </div>
  );
};

export default Loader;
