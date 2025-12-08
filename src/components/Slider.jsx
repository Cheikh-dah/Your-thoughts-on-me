import React from 'react';
import './Slider.css';

const Slider = ({ leftLabel, rightLabel, leftImage, rightImage, value, onChange, disabled = false }) => {
    const leftPercentage = 100 - value;
    const rightPercentage = value;

    return (
        <div className="slider-container">
            <div className="slider-row">
                <div className="label-side">
                    {leftImage && <img src={leftImage} alt={leftLabel} className="trait-image" />}
                    <span className="label-left">{leftLabel}</span>
                    {value <= 50 && <span className="percentage-text percentage-left">{leftPercentage}%</span>}
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="slider-input"
                    disabled={disabled}
                />
                <div className="label-side">
                    <span className="label-right">{rightLabel}</span>
                    {rightImage && <img src={rightImage} alt={rightLabel} className="trait-image" />}
                    {value >= 50 && <span className="percentage-text percentage-right">{rightPercentage}%</span>}
                </div>
            </div>
        </div>
    );
};

export default Slider;
