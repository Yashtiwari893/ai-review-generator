"use client";

import React, { useState } from "react";
import styles from "./FeedbackForm.module.css";

interface FeedbackFormProps {
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

export default function FeedbackForm({ onSubmit, isLoading }: FeedbackFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        feedback: "",
        rating: 5,
        comments: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.field}>
                <label>Service Feedback</label>
                <textarea
                    name="feedback"
                    placeholder="How was your experience?"
                    value={formData.feedback}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.field}>
                <label>Rating</label>
                <select name="rating" value={formData.rating} onChange={handleChange}>
                    <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (Good)</option>
                    <option value={3}>⭐⭐⭐ (Average)</option>
                    <option value={2}>⭐⭐ (Poor)</option>
                    <option value={1}>⭐ (Terrible)</option>
                </select>
            </div>

            <div className={styles.field}>
                <label>Additional Comments (Optional)</label>
                <textarea
                    name="comments"
                    placeholder="Anything else?"
                    value={formData.comments}
                    onChange={handleChange}
                />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? "Generating Review..." : "Generate AI Review"}
            </button>
        </form>
    );
}
