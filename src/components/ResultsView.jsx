import React from 'react';
import './ResultsView.css';

const ResultsView = ({ userRatings, generalRatingsOverride }) => {
    // Mock general ratings or use override
    const generalRatings = generalRatingsOverride || {
        humble: 75,
        considerate: 60,
        kind: 85,
        smart: 90,
    };

    const renderBar = (label, value, color) => (
        <div className="result-item">
            <div className="result-label">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="progress-bar-bg">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${value}%`, backgroundColor: color }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="results-container">
            {userRatings && (
                <div className="results-panel">
                    <h3>تقييمك</h3>
                    {renderBar('تواضع', userRatings.humble, '#3b82f6')}
                    {renderBar('مراعاة المشاعر', userRatings.considerate, '#3b82f6')}
                    {renderBar('طيبة', userRatings.kind, '#3b82f6')}
                    {renderBar('ذكاء', userRatings.smart, '#3b82f6')}
                </div>
            )}

            <div className="results-panel">
                <h3>التقيم العام</h3>
                {renderBar('تواضع', generalRatings.humble, '#10b981')}
                {renderBar('مراعاة المشاعر', generalRatings.considerate, '#10b981')}
                {renderBar('طيبة', generalRatings.kind, '#10b981')}
                {renderBar('ذكاء', generalRatings.smart, '#10b981')}
            </div>
        </div>
    );
};

export default ResultsView;
