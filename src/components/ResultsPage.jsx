import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ResultsView from './ResultsView';

const ResultsPage = () => {
    const [averageRatings, setAverageRatings] = useState({
        humble: 50,
        considerate: 50,
        kind: 50,
        smart: 50,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
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
                    setAverageRatings({
                        humble: Math.round(total.humble / count),
                        considerate: Math.round(total.considerate / count),
                        kind: Math.round(total.kind / count),
                        smart: Math.round(total.smart / count),
                    });
                }
            } catch (error) {
                console.error("Error fetching ratings:", error);
                // Fallback to mock data or show error
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, []);

    if (loading) {
        return <div className="loading">جاري تحميل النتائج...</div>;
    }

    // For the public results page, we might only want to show the "General Rating"
    // So we can pass a dummy userRatings or modify ResultsView to handle missing userRatings
    return (
        <div className="results-page">
            <h2>النتائج العامة</h2>
            <ResultsView userRatings={null} generalRatingsOverride={averageRatings} />
        </div>
    );
};

export default ResultsPage;
