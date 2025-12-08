import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import Slider from './Slider';
import './RatingCard.css';

// Import images
import humbleImg from '../../picts/humble.jpeg';
import narcissistImg from '../../picts/narcessist.jpeg';
import empethyImg from '../../picts/empethy.jpeg';
import bullyImg from '../../picts/bully.jpeg';
import niceImg from '../../picts/nice.jpeg';
import badImg from '../../picts/bad.jpeg';
import stupidImg from '../../picts/stupid.jpeg';
import smartImg from '../../picts/smart.jpeg';

const RatingCard = ({ onVoteComplete }) => {
    const [ratings, setRatings] = useState({
        humble: 50,
        considerate: 50,
        kind: 50,
        smart: 50,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (key, value) => {
        setRatings((prev) => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            console.log("Starting to save ratings...", ratings);
            
            // Call the callback first to show results immediately
            // This saves to localStorage and updates the UI
            if (onVoteComplete) {
                console.log("Calling onVoteComplete callback...");
                await onVoteComplete(ratings);
                console.log("onVoteComplete callback completed");
            }
            
            // Save to Realtime Database in the background (non-blocking)
            // This way if Firebase is slow or fails, the user still sees their results
            const dataToSave = {
                ...ratings,
                timestamp: Date.now(),
                deviceId: navigator.userAgent // Simple device fingerprinting
            };
            console.log("Saving to Firebase:", dataToSave);
            console.log("Ratings breakdown:", {
                humble: ratings.humble,
                considerate: ratings.considerate,
                kind: ratings.kind,
                smart: ratings.smart
            });
            
            push(ref(db, "ratings"), dataToSave)
            .then((ref) => {
                console.log("Successfully saved to Firebase with key:", ref.key);
                console.log("Saved data:", dataToSave);
            })
            .catch((e) => {
                console.error("Error saving to Firebase (non-critical): ", e);
                // Don't show alert for background save failures
            });
            
        } catch (e) {
            console.error("Error in handleSubmit: ", e);
            alert("حدث خطأ أثناء حفظ التقييم. يرجى المحاولة مرة أخرى.\nError: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rating-card">
            <Slider
                leftLabel="متواضع"
                rightLabel="نرجسي"
                leftImage={humbleImg}
                rightImage={narcissistImg}
                value={ratings.humble}
                onChange={(val) => handleChange('humble', val)}
            />
            <Slider
                leftLabel="مراعي لمشاعر الاخرين"
                rightLabel="متنمر"
                leftImage={empethyImg}
                rightImage={bullyImg}
                value={ratings.considerate}
                onChange={(val) => handleChange('considerate', val)}
            />
            <Slider
                leftLabel="طيب"
                rightLabel="شرير"
                leftImage={niceImg}
                rightImage={badImg}
                value={ratings.kind}
                onChange={(val) => handleChange('kind', val)}
            />
            <Slider
                leftLabel="ذكي"
                rightLabel="غبي"
                leftImage={smartImg}
                rightImage={stupidImg}
                value={ratings.smart}
                onChange={(val) => handleChange('smart', val)}
            />
            <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'جاري الحفظ...' : 'انتهيت من التقيم'}
            </button>
        </div>
    );
};

export default RatingCard;
