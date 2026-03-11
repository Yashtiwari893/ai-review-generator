"use client";

import React, { useState } from "react";
import styles from "./ReviewCard.module.css";

interface ReviewCardProps {
    review: string;
    sentiment: string;
}

export default function ReviewCard({ review, sentiment }: ReviewCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(review);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openGoogleReview = () => {
        // Replace with actual Google Review Link
        window.open("https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID", "_blank");
    };

    return (
        <div className={`${styles.card} ${styles[sentiment]}`}>
            <h3>Your Generated Review</h3>
            <p className={styles.reviewText}>"{review}"</p>

            <div className={styles.actions}>
                <button onClick={handleCopy} className={styles.copyBtn}>
                    {copied ? "Copied!" : "Copy Review"}
                </button>
                <button onClick={openGoogleReview} className={styles.linkBtn}>
                    Open Google Review
                </button>
            </div>
            <p className={styles.hint}>Paste this message on the Google Review page.</p>
        </div>
    );
}
