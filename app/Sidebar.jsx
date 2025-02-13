'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBars } from 'react-icons/fa'; 
import History from './History/page';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className='shadow-4xl'>
      <button 
        onClick={toggleSidebar} 
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg focus:outline-none hover:scale-105"
      >
        <FaBars size={24} />
      </button>
      <motion.div 
        initial={{ x: '-100%' }} 
        animate={{ x: isOpen ? '0%' : '-100%' }} 
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-80 bg-gray-800 text-white shadow-lg flex flex-col p-4 z-40"
      >
        <div className=" mt-14">
        <History />
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
