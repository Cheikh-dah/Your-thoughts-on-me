import React, { useState, useEffect, useRef } from 'react';
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
    const [resultsError, setResultsError] = useState(null);
    const timeoutRef = useRef(null);

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
                    setLoadingResults(false);
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
        // Only show loading if we don't have cached data
        if (!generalRatings) {
            setLoadingResults(true);
        }
        setResultsError(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setResultsError('وقت التحميل طال، تحقق من الاتصال ثم أعد المحاولة.');
        }, 7000);
        
        try {
            const querySnapshot = await getDocs(collection(db, "ratings"));
            let total = { humble: 0, considerate: 0, kind: 0, smart: 0 };
            let count = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
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

            if (count > 0) {
                const newRatings = {
                    humble: Math.round(total.humble / count),
                    considerate: Math.round(total.considerate / count),
                    kind: Math.round(total.kind / count),
                    smart: Math.round(total.smart / count),
                };
                
                setGeneralRatings(newRatings);
                
                // Cache the results in localStorage
                localStorage.setItem('generalRatings', JSON.stringify(newRatings));
                localStorage.setItem('ratingsTimestamp', Date.now().toString());
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
            setResultsError('تعذر تحميل النتائج، حاول مجدداً.');
        } finally {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
                {loadingResults && !generalRatings ? (
                    <div className="loading">
                        جاري تحميل النتائج...
                        {resultsError && (
                            <div style={{ marginTop: '1rem' }}>
                                <div>{resultsError}</div>
                                <button className="submit-btn" onClick={fetchGeneralRatings} style={{ marginTop: '0.5rem' }}>
                                    إعادة المحاولة
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <ResultsView userRatings={userRatings} generalRatingsOverride={generalRatings} />
                        {resultsError && (
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                {resultsError}
                                <div>
                                    <button className="submit-btn" onClick={fetchGeneralRatings} style={{ marginTop: '0.5rem' }}>
                                        إعادة المحاولة
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {loadingResults && generalRatings && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                        جاري تحديث النتائج...
                    </div>
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

