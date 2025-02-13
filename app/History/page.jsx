'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { IoChatbubbleOutline } from "react-icons/io5";
import { FaRegCopy, FaCheck, FaUser } from "react-icons/fa6";
import { CiStar } from "react-icons/ci";
import { RiStarFill } from "react-icons/ri";

export default function History() {
    const [history, setHistory] = useState([]);
    const [displayedHistory, setDisplayedHistory] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(4); // Initially show 4 messages
    const [filterDate, setFilterDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('/api/history');
                setHistory(response.data.data);
                setDisplayedHistory(response.data.data.slice(0, 4)); // Show first 4 items
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        fetchHistory();
    }, []);

    useEffect(() => {
        let filteredData = history;

        if (filterDate) {
            filteredData = filteredData.filter((item) => {
                const itemDate = new Date(item.timestamp).toISOString().split('T')[0]; // Convert to YYYY-MM-DD
                return itemDate === filterDate;
            });
        }
        if (searchQuery) {
            filteredData = filteredData.filter((item) =>
                item.text.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setDisplayedHistory(filteredData.slice(0, visibleCount));
    }, [filterDate, searchQuery, visibleCount, history]);

    const handleViewMore = () => {
        setVisibleCount(visibleCount + 5);
    };

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const handleStar = async (id, currentStatus) => {
        try {
            const response = await fetch('/api/history', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, starred: !currentStatus }),
            });

            if (response.ok) {
                setHistory((prev) =>
                    prev.map((msg) =>
                        msg._id === id ? { ...msg, starred: !currentStatus } : msg
                    )
                );
            }
        } catch (error) {
            console.error('Error starring message:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="max-w-4xl mx-auto p-3 overflow-y-auto h-[calc(100vh-4rem)]">
            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                {/* Date Filter */}
                <input
                    type="date"
                    className="p-2 bg-gray-800 text-gray-300 rounded"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />

                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search messages..."
                    className="p-2 bg-gray-800 text-gray-300 rounded w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Starred Messages Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500 text-transparent bg-clip-text">
                    Starred Messages
                </h2>
                {history.filter(msg => msg.starred).length === 0 ? (
                    <p className="text-gray-400 text-sm">No starred messages yet.</p>
                ) : (
                    history.filter(msg => msg.starred).map((message) => (
                        <div key={message._id} className="p-2 text-gray-300 border-b border-gray-700 flex">
                            <p className='py-1 mx-2'><RiStarFill color='yellow' /></p>
                            {message.text}
                        </div>
                    ))
                )}
            </div>

            {/* Chat History Section */}
            <h2 className="text-2xl font-bold mt-6 mb-4 bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500 text-transparent bg-clip-text">
                Chat History
            </h2>

            <div className="space-y-2">
                {displayedHistory.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No chat history found</div>
                ) : (
                    displayedHistory.map((item) => (
                        <div 
                            key={item._id}
                            className="group relative rounded-lg hover:bg-gray-900 transition-colors duration-200 p-2"
                        >
                            <div className="flex items-start gap-1">
                                <div className="flex-shrink-0">
                                    {item.role === 'user' ? (
                                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                                            <FaUser className="text-white" size={16} />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                            <IoChatbubbleOutline size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center mb-1">
                                        <span className="text-xs text-gray-400">
                                            {formatTimestamp(item.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap text-sm">
                                        {item.text}
                                    </p>
                                </div>

                                {/* Copy Button */}
                                <button
                                    onClick={() => handleCopy(item.text, item._id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-900 rounded"
                                >
                                    {copiedId === item._id ? (
                                        <FaCheck className="text-green-500" size={14} />
                                    ) : (
                                        <FaRegCopy className="text-gray-400 hover:text-white" size={14} />
                                    )}
                                </button>

                                {/* Star Button */}
                                <button 
                                    onClick={() => handleStar(item._id, item.starred)}
                                    className="p-2 hover:bg-gray-700 rounded"
                                >
                                    <CiStar className={item.starred ? "text-yellow-400" : "text-gray-400"} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View More Button */}
            {visibleCount < history.length && (
                <div className="mx-auto cursor-pointer hover:text-blue-500 text-center mt-4">
                    <p onClick={handleViewMore}>View More ...</p>
                </div>
            )}
        </div>
    );
}
