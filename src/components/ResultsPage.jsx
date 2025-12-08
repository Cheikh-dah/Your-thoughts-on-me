import React, { useEffect, useState, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import ResultsView from './ResultsView';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const ResultsPage = () => {
    // Get initial ratings from cache if available, otherwise use defaults
    const getInitialRatings = () => {
        const cachedRatings = localStorage.getItem('generalRatings');
        const ratingsTimestamp = localStorage.getItem('ratingsTimestamp');

        if (cachedRatings && ratingsTimestamp) {
            const timestamp = parseInt(ratingsTimestamp, 10);
            const now = Date.now();

            // Use cached data if it's fresh (less than 5 minutes)
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
    };

    const [averageRatings, setAverageRatings] = useState(getInitialRatings());

    const normalize = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return null;
        return Math.min(Math.max(Math.round(n), 0), 100);
    };

    const fetchRatings = useCallback(async () => {
        try {
            console.log("Fetching ratings from Firebase Realtime Database...");
            const snapshot = await get(ref(db, "ratings"));
            let total = { humble: 0, considerate: 0, kind: 0, smart: 0 };
            let count = 0;
            const allRatings = []; // Store all ratings for debugging

            if (snapshot.exists()) {
                const ratingsData = snapshot.val();
                console.log("Raw ratings data from Firebase:", ratingsData);
                
                // Realtime Database returns an object with keys
                Object.entries(ratingsData).forEach(([key, data]) => {
                    const humble = normalize(data.humble);
                    const considerate = normalize(data.considerate);
                    const kind = normalize(data.kind);
                    const smart = normalize(data.smart);
                    const isValid = [humble, considerate, kind, smart].every((v) => v !== null);

                    if (isValid) {
                        allRatings.push({ key, humble, considerate, kind, smart });
                        total.humble += humble;
                        total.considerate += considerate;
                        total.kind += kind;
                        total.smart += smart;
                        count++;
                    } else {
                        console.warn(`Invalid rating data for key ${key}:`, data);
                    }
                });
            } else {
                console.log("No ratings found in Firebase database");
            }

            console.log(`Found ${count} valid ratings:`, allRatings);
            console.log(`Totals:`, total);

            if (count > 0) {
                const newRatings = {
                    humble: Math.round(total.humble / count),
                    considerate: Math.round(total.considerate / count),
                    kind: Math.round(total.kind / count),
                    smart: Math.round(total.smart / count),
                };

                console.log(`Calculated average ratings (from ${count} ratings):`, newRatings);
                console.log(`Calculation: humble=${total.humble}/${count}=${newRatings.humble}, considerate=${total.considerate}/${count}=${newRatings.considerate}, kind=${total.kind}/${count}=${newRatings.kind}, smart=${total.smart}/${count}=${newRatings.smart}`);
                
                setAverageRatings(newRatings);

                // Cache the results
                localStorage.setItem('generalRatings', JSON.stringify(newRatings));
                localStorage.setItem('ratingsTimestamp', Date.now().toString());
            } else {
                // If no data from database, clear cache and use defaults
                console.log("No valid ratings found in Firebase, clearing cache and using default values (50%)");
                localStorage.removeItem('generalRatings');
                localStorage.removeItem('ratingsTimestamp');
                // Force update to default values
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
