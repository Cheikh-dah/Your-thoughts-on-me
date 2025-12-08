import React, { useEffect, useState, useRef, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
    const [loading, setLoading] = useState(!hasFreshCache); // No spinner if cache is fresh
    const [isUpdating, setIsUpdating] = useState(hasFreshCache); // show small update notice when refreshing cache
    const [error, setError] = useState(null);
    const timeoutRef = useRef(null);

    const normalize = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return null;
        return Math.min(Math.max(Math.round(n), 0), 100);
    };

    const fetchRatings = useCallback(async () => {
        setError(null);
        setIsUpdating(hasFreshCache);
        if (!hasFreshCache) setLoading(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setError('وقت التحميل طال، تحقق من الاتصال ثم أعد المحاولة.');
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

                setAverageRatings(newRatings);

                // Cache the results
                localStorage.setItem('generalRatings', JSON.stringify(newRatings));
                localStorage.setItem('ratingsTimestamp', Date.now().toString());
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
            setError('تعذر تحميل النتائج، حاول مجدداً.');
        } finally {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setLoading(false);
            setIsUpdating(false);
        }
    }, [hasFreshCache]);

    useEffect(() => {
        fetchRatings();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [fetchRatings]);

    if (loading) {
        return (
            <div className="loading">
                جاري تحميل النتائج...
                {error && (
                    <div style={{ marginTop: '1rem' }}>
                        <div>{error}</div>
                        <button className="submit-btn" onClick={() => window.location.reload()}>
                            إعادة المحاولة
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // For the public results page, we might only want to show the "General Rating"
    // So we can pass a dummy userRatings or modify ResultsView to handle missing userRatings
    return (
        <div className="results-page">
            <h2>النتائج العامة</h2>
            {isUpdating && (
                <div style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                    جاري تحديث النتائج...
                </div>
            )}
            {error && (
                <div className="loading" style={{ marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            <ResultsView userRatings={null} generalRatingsOverride={averageRatings} />
        </div>
    );
};

export default ResultsPage;
