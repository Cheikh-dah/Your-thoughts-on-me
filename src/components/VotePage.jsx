import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import RatingCard from './RatingCard';
import ResultsView from './ResultsView';

const VotePage = () => {
    const navigate = useNavigate();
    const [hasVoted, setHasVoted] = useState(false);
    const [userRatings, setUserRatings] = useState(null);
    const [generalRatings, setGeneralRatings] = useState(null);
    const [isNewVote, setIsNewVote] = useState(false);

    useEffect(() => {
        const voted = localStorage.getItem('hasVoted');
        const savedRatings = localStorage.getItem('userRatings');
        const cachedGeneralRatings = localStorage.getItem('generalRatings');
        const ratingsTimestamp = localStorage.getItem('ratingsTimestamp');
        
        if (voted && savedRatings) {
            setHasVoted(true);
            setUserRatings(JSON.parse(savedRatings));
            
            // Show cached general ratings immediately if available and not too old (less than 5 minutes)
            if (cachedGeneralRatings) {
                const timestamp = ratingsTimestamp ? parseInt(ratingsTimestamp) : 0;
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000;
                
                if (now - timestamp < fiveMinutes) {
                    setGeneralRatings(JSON.parse(cachedGeneralRatings));
                }
            }
        }
    }, []);

    // Fetch general ratings when hasVoted becomes true
    useEffect(() => {
        if (hasVoted) {
            fetchGeneralRatings();
        }
    }, [hasVoted]);

    const normalize = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return null;
        return Math.min(Math.max(Math.round(n), 0), 100);
    };

    const fetchGeneralRatings = async () => {
        try {
            console.log("Fetching general ratings from Firebase...");
            const snapshot = await get(ref(db, "ratings"));
            let total = { humble: 0, considerate: 0, kind: 0, smart: 0 };
            let count = 0;

            if (snapshot.exists()) {
                const ratingsData = snapshot.val();
                console.log("Ratings data from Firebase:", ratingsData);
                // Realtime Database returns an object with keys
                Object.values(ratingsData).forEach((data) => {
                    const humble = normalize(data.humble);
                    const considerate = normalize(data.considerate);
                    const kind = normalize(data.kind);
                    const smart = normalize(data.smart);
                    const isValid = [humble, considerate, kind, smart].every((v) => v !== null);

                    if (isValid) {
                        total.humble += humble;
                        total.considerate += considerate;
                        total.kind += kind;
                        total.smart += smart;
                        count++;
                    }
                });
            }

            console.log(`Total count: ${count}, Totals:`, total);

            if (count > 0) {
                const newRatings = {
                    humble: Math.round(total.humble / count),
                    considerate: Math.round(total.considerate / count),
                    kind: Math.round(total.kind / count),
                    smart: Math.round(total.smart / count),
                };
                
                console.log("New average ratings:", newRatings);
                setGeneralRatings(newRatings);
                
                // Cache the results in localStorage
                localStorage.setItem('generalRatings', JSON.stringify(newRatings));
                localStorage.setItem('ratingsTimestamp', Date.now().toString());
            } else {
                // If no data from database, clear cache
                localStorage.removeItem('generalRatings');
                localStorage.removeItem('ratingsTimestamp');
                setGeneralRatings(null);
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
            // On error, clear cache
            localStorage.removeItem('generalRatings');
            localStorage.removeItem('ratingsTimestamp');
            setGeneralRatings(null);
        }
    };

    const handleVoteComplete = async (ratings) => {
        try {
            // Update state first to show the results immediately
            localStorage.setItem('hasVoted', 'true');
            localStorage.setItem('userRatings', JSON.stringify(ratings));
            setHasVoted(true);
            setUserRatings(ratings);
            setIsNewVote(true);
            
            // Wait a bit for the new rating to be saved to Firebase, then fetch updated ratings
            setTimeout(() => {
                // Clear cache to force fresh data fetch
                localStorage.removeItem('generalRatings');
                localStorage.removeItem('ratingsTimestamp');
                fetchGeneralRatings().catch(error => {
                    console.error("Error fetching general ratings:", error);
                });
            }, 1000); // Wait 1 second for Firebase to save
        } catch (error) {
            console.error("Error in handleVoteComplete:", error);
            throw error;
        }
    };

    if (hasVoted && userRatings) {
        return (
            <div className="vote-page">
                <h2>{isNewVote ? 'شكراً لك! تم حفظ تقييمك' : 'لقد قمت بالتصويت مسبقاً'}</h2>
                <ResultsView userRatings={userRatings} generalRatingsOverride={generalRatings} />
            </div>
        );
    }

    return (
        <div className="vote-page">
            <RatingCard onVoteComplete={handleVoteComplete} />
        </div>
    );
};

export default VotePage;

