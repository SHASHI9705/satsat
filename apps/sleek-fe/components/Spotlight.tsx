import React from 'react';

const SpotlightPage: React.FC = () => {
    const randomGradient = () => {
        const colors = [
            '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'
        ];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        return `linear-gradient(135deg, ${color1}, ${color2})`;
    };

    const animationStyles = `
        @keyframes tiltAndScale {
            0% {
                transform: rotate(0deg) scale(1);
            }
            25% {
                transform: rotate(10deg) scale(1.1);
            }
            50% {
                transform: rotate(-10deg) scale(1);
            }
            75% {
                transform: rotate(10deg) scale(1.1);
            }
            100% {
                transform: rotate(0deg) scale(1);
            }
        }

        @keyframes glowEffect {
            0%, 100% {
                box-shadow: 0 0 7px rgb(0, 0, 0);
            }
            50% {
                box-shadow: 0 0 7px rgb(0, 0, 0);
            }
        }
    `;

    return (
        <div className="flex -mt-4 md:mt-0 mb-4 flex-col justify-start items-center bg-gray-100">
            <style>{animationStyles}</style>
            <h1 className="flex gap-2">
                {Array.from('SPOTLIGHT').map((letter, index) => (
                    <span
                        key={index}
                        className="text-black rounded text-center text-xs md:text-2xl font-extrabold md:w-[30px] md:h-[30px] w-[17px] h-[17px]"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            WebkitTextStroke: '1px black',
                            background: randomGradient(),
                            fontFamily: 'Playfair Display, serif',
                            animation: `tiltAndScale 2s ${index * 0.2}s infinite, glowEffect 2s infinite`,
                            border: '1px solid black',
                        }}
                    >
                        {letter}
                    </span>
                ))}
            </h1>
        </div>
    );
};

export default SpotlightPage;