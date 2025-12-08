import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import RatingCard from './RatingCard';
import ResultsView from './ResultsView';

const VotePage = () => {
    const navigate = useNavigate();
    const [hasVoted, setHasVoted] = useState(false);
    const [userRatings, setUserRatings] = useState(null);
    const [generalRatings, setGeneralRatings] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [isNewVote, setIsNewVote] = useState(false);

    useEffect(() => {
        const voted = localStorage.getItem('hasVoted');
        const savedRatings = localStorage.getItem('userRatings');
        if (voted && savedRatings) {
            setHasVoted(true);
            setUserRatings(JSON.parse(savedRatings));
        }
    }, []);

    // Fetch general ratings when hasVoted becomes true
    useEffect(() => {
        if (hasVoted) {
            fetchGeneralRatings();
        }
    }, [hasVoted]);

    const fetchGeneralRatings = async () => {
        setLoadingResults(true);
        try {
            const querySnapshot = await getDocs(collection(db, "ratings"));
            let total = { humble: 0, considerate: 0, kind: 0, smart: 0 };
            let count = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                total.humble += data.humble;
                total.considerate += data.considerate;
                total.kind += data.kind;
                total.smart += data.smart;
                count++;
            });

            if (count > 0) {
                setGeneralRatings({
                    humble: Math.round(total.humble / count),
                    considerate: Math.round(total.considerate / count),
                    kind: Math.round(total.kind / count),
                    smart: Math.round(total.smart / count),
                });
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
        } finally {
            setLoadingResults(false);
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
            
            // Fetch general ratings in the background
            fetchGeneralRatings().catch(error => {
                console.error("Error fetching general ratings:", error);
            });
        } catch (error) {
            console.error("Error in handleVoteComplete:", error);
            throw error;
        }
    };

    if (hasVoted && userRatings) {
        return (
            <div className="vote-page">
                <h2>{isNewVote ? 'شكراً لك! تم حفظ تقييمك' : 'لقد قمت بالتصويت مسبقاً'}</h2>
                {loadingResults ? (
                    <div className="loading">جاري تحميل النتائج...</div>
                ) : (
                    <ResultsView userRatings={userRatings} generalRatingsOverride={generalRatings} />
                )}
                <button className="submit-btn" onClick={() => navigate('/results')} style={{ marginTop: '2rem' }}>
                    شاهد النتائج العامة
                </button>
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

