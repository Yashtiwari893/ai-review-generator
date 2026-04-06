"use client";

import React, { useState } from "react";
import styles from "./FeedbackForm.module.css";

interface FeedbackFormProps {
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

export default function FeedbackForm({ onSubmit, isLoading }: FeedbackFormProps) {
    const [formData, setFormData] = useState({
        Your_Name_4b003f: "",
        Company_Name_ecbff6: "",
        City_5a70fd: "",
        What_did_you_purchase_9093e3: [] as string[],
        What_stood_out_you_539226: "0_Product_Quality",
        star_rating: 5,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                What_did_you_purchase_9093e3: checked 
                    ? [...prev.What_did_you_purchase_9093e3, value]
                    : prev.What_did_you_purchase_9093e3.filter(v => v !== value)
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label>Full Name</label>
                <input
                    type="text"
                    name="Your_Name_4b003f"
                    placeholder="Enter your name"
                    value={formData.Your_Name_4b003f}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.field}>
                <label>Company & City</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        name="Company_Name_ecbff6"
                        placeholder="Company Name"
                        value={formData.Company_Name_ecbff6}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="City_5a70fd"
                        placeholder="City"
                        value={formData.City_5a70fd}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label>What did you purchase?</label>
                <div className={styles.checkboxGroup}>
                    {["0_Jib_Crane", "1_EOT_Crane", "2_Electric_Hoist", "3_Spare_Parts"].map(item => (
                        <label key={item} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                value={item}
                                checked={formData.What_did_you_purchase_9093e3.includes(item)}
                                onChange={handleChange}
                            />
                            {item.split('_').slice(1).join(' ')}
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.field}>
                <label>Experience Star Rating</label>
                <select name="star_rating" value={formData.star_rating} onChange={handleChange}>
                    <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (Good)</option>
                    <option value={3}>⭐⭐⭐ (Average)</option>
                    <option value={2}>⭐⭐ (Poor)</option>
                    <option value={1}>⭐ (Terrible)</option>
                </select>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? "Generating Professional Review..." : "Generate AI Review"}
            </button>
        </form>
    );
}
