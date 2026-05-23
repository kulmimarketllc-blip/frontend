import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) {
          s = 59;
          m--;
        }
        if (m < 0) {
          m = 59;
          h--;
        }
        if (h < 0) {
          h = 0;
          m = 0;
          s = 0;
        }
        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <div className="bg-navy3 px-3 py-1 rounded font-bold text-white text-lg w-11 text-center">
        {pad(time.h)}
      </div>
      <span className="text-gray font-bold">:</span>
      <div className="bg-navy3 px-3 py-1 rounded font-bold text-white text-lg w-11 text-center">
        {pad(time.m)}
      </div>
      <span className="text-gray font-bold">:</span>
      <div className="bg-navy3 px-3 py-1 rounded font-bold text-white text-lg w-11 text-center">
        {pad(time.s)}
      </div>
    </div>
  );
};

export default CountdownTimer;
