"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackForm from "./FeedbackForm";
import ReviewCard from "./ReviewCard";
import styles from "./Chatbot.module.css";

interface Message {
    role: "bot" | "user";
    type: "text" | "form" | "result";
    content?: string;
    data?: any;
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", type: "text", content: "Hello! Type 'denishbhai' to start generating your review." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue.toLowerCase().trim();
        setMessages(prev => [...prev, { role: "user", type: "text", content: inputValue }]);
        setInputValue("");

        if (userMessage === "denishbhai") {
            setTimeout(() => {
                setMessages(prev => [...prev,
                { role: "bot", type: "text", content: "Great! Please fill out this quick form to help me write a perfect review for you." },
                { role: "bot", type: "form" }
                ]);
            }, 500);
        } else {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: "bot", type: "text", content: "I don't recognize that command. Hint: Try 'denishbhai'." }]);
            }, 500);
        }
    };

    const handleFormSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/generate-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev,
            { role: "bot", type: "text", content: "Here is your professional review based on your feedback:" },
            { role: "bot", type: "result", data }
            ]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "bot", type: "text", content: "Oops! Something went wrong while generating the review. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.botIcon}>🤖</div>
                <div className={styles.botInfo}>
                    <h2>AI Review Assistant</h2>
                    <span>Online</span>
                </div>
            </header>

            <div className={styles.chatWindow} ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.message} ${styles[msg.role]}`}
                        >
                            <div className={styles.bubble}>
                                {msg.type === "text" && <p>{msg.content}</p>}
                                {msg.type === "form" && (
                                    <FeedbackForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                                )}
                                {msg.type === "result" && (
                                    <ReviewCard review={msg.data.review} sentiment={msg.data.sentiment} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className={styles.inputArea}>
                <input
                    type="text"
                    placeholder="Type 'denishbhai'..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} className={styles.sendBtn}>
                    Send
                </button>
            </div>
        </div>
    );
}
