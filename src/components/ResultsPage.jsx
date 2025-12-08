import React, { useEffect, useState, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import ResultsView from './ResultsView';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const ResultsPage = () => {
    const getInitialRatings = useCallback(() => {
        const cachedRatings = localStorage.getItem('generalRatings');
        const ratingsTimestamp = localStorage.getItem('ratingsTimestamp');

        if (cachedRatings && ratingsTimestamp) {
            const timestamp = parseInt(ratingsTimestamp, 10);
            const now = Date.now();

            // Use cached data if it's fresh
            if (now - timestamp < CACHE_DURATION) {
                try {
                    return JSON.parse(cachedRatings);
                } catch (error) {
                    console.error('خطأ في تحليل البيانات المختزنة:', error);
                    localStorage.removeItem('generalRatings');
                    localStorage.removeItem('ratingsTimestamp');
                }
            }
        }
        return { humble: 50, considerate: 50, kind: 50, smart: 50 };
    }, []);

    const initial = getInitialRatings();
    const hasFreshCache = (() => {
        const ts = localStorage.getItem('ratingsTimestamp');
        if (!ts) return false;
        return Date.now() - parseInt(ts, 10) < CACHE_DURATION;
    })();

    const [averageRatings, setAverageRatings] = useState(initial);

    const normalize = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return null;
        return Math.min(Math.max(Math.round(n), 0), 100);
    };

    const fetchRatings = useCallback(async () => {
        try {
            console.log("Fetching ratings from Firebase...");
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
                setAverageRatings(newRatings);

                // Cache the results
                localStorage.setItem('generalRatings', JSON.stringify(newRatings));
                localStorage.setItem('ratingsTimestamp', Date.now().toString());
            } else {
                // If no data from database, clear cache and use defaults
                localStorage.removeItem('generalRatings');
                localStorage.removeItem('ratingsTimestamp');
                setAverageRatings({ humble: 50, considerate: 50, kind: 50, smart: 50 });
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
            // On error, clear cache to force fresh data on next load
            localStorage.removeItem('generalRatings');
            localStorage.removeItem('ratingsTimestamp');
            setAverageRatings({ humble: 50, considerate: 50, kind: 50, smart: 50 });
        }
    }, []);

    useEffect(() => {
        fetchRatings();
    }, [fetchRatings]);

    const handleRefresh = () => {
        // Clear cache and force fresh fetch
        localStorage.removeItem('generalRatings');
        localStorage.removeItem('ratingsTimestamp');
        fetchRatings();
    };

    return (
        <div className="results-page">
            <h2>التقيم العام</h2>
            <ResultsView userRatings={null} generalRatingsOverride={averageRatings} />
            <button 
                className="submit-btn" 
                onClick={handleRefresh}
                style={{ 
                    marginTop: '2rem',
                    fontSize: '0.9rem',
                    padding: '0.6rem 1.5rem'
                }}
            >
                تحديث النتائج
            </button>
        </div>
    );
};

export default ResultsPage;
