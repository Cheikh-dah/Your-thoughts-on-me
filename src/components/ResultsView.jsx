import React from 'react';
import Slider from './Slider';
import './ResultsView.css';

// Import images
import humbleImg from '../../picts/humble.jpeg';
import narcissistImg from '../../picts/narcessist.jpeg';
import empethyImg from '../../picts/empethy.jpeg';
import bullyImg from '../../picts/bully.jpeg';
import niceImg from '../../picts/nice.jpeg';
import badImg from '../../picts/bad.jpeg';
import stupidImg from '../../picts/stupid.jpeg';
import smartImg from '../../picts/smart.jpeg';

const ResultsView = ({ userRatings, generalRatingsOverride }) => {
    // Use override if provided, otherwise default to 50% for all ratings
    const generalRatings = generalRatingsOverride || {
        humble: 50,
        considerate: 50,
        kind: 50,
        smart: 50,
    };

    return (
        <div className="results-container">
            {userRatings && (
                <div className="results-panel">
                    <h3>تقييمك</h3>
                    <div className="rating-card">
                        <Slider
                            leftLabel="متواضع"
                            rightLabel="نرجسي"
                            leftImage={humbleImg}
                            rightImage={narcissistImg}
                            value={userRatings.humble}
                            onChange={() => {}}
                            disabled={true}
                        />
                        <Slider
                            leftLabel="مراعي لمشاعر الاخرين"
                            rightLabel="متنمر"
                            leftImage={empethyImg}
                            rightImage={bullyImg}
                            value={userRatings.considerate}
                            onChange={() => {}}
                            disabled={true}
                        />
                        <Slider
                            leftLabel="طيب"
                            rightLabel="شرير"
                            leftImage={niceImg}
                            rightImage={badImg}
                            value={userRatings.kind}
                            onChange={() => {}}
                            disabled={true}
                        />
                        <Slider
                            leftLabel="ذكي"
                            rightLabel="غبي"
                            leftImage={smartImg}
                            rightImage={stupidImg}
                            value={userRatings.smart}
                            onChange={() => {}}
                            disabled={true}
                        />
                    </div>
                </div>
            )}

            <div className="results-panel">
                <h3>التقيم العام</h3>
                <div className="rating-card">
                    <Slider
                        leftLabel="متواضع"
                        rightLabel="نرجسي"
                        leftImage={humbleImg}
                        rightImage={narcissistImg}
                        value={generalRatings.humble}
                        onChange={() => {}}
                        disabled={true}
                    />
                    <Slider
                        leftLabel="مراعي لمشاعر الاخرين"
                        rightLabel="متنمر"
                        leftImage={empethyImg}
                        rightImage={bullyImg}
                        value={generalRatings.considerate}
                        onChange={() => {}}
                        disabled={true}
                    />
                    <Slider
                        leftLabel="طيب"
                        rightLabel="شرير"
                        leftImage={niceImg}
                        rightImage={badImg}
                        value={generalRatings.kind}
                        onChange={() => {}}
                        disabled={true}
                    />
                    <Slider
                        leftLabel="ذكي"
                        rightLabel="غبي"
                        leftImage={smartImg}
                        rightImage={stupidImg}
                        value={generalRatings.smart}
                        onChange={() => {}}
                        disabled={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResultsView;
