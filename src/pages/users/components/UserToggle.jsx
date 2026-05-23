import React, { useEffect, useState } from 'react';

const UserToggle = ({ defaultOn = false, onChange }) => {
  const [on, setOn] = useState(defaultOn);

  useEffect(() => {
    setOn(defaultOn);
  }, [defaultOn]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative h-5 w-9 shrink-0 rounded-full border-none transition-colors ${
        on ? 'bg-teal' : 'bg-white/[0.07]'
      }`}
    >
      <span
        className={`absolute top-[3px] h-3.5 w-3.5 rounded-full bg-white transition-all ${
          on ? 'left-[19px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
};

export default UserToggle;
