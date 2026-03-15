'use client';

import { useState, useRef, useEffect } from 'react';
import SVGIcon from '../SVGIcon/SVGIcon';
import { tv } from 'tailwind-variants';

type SortOption = '최신순' | '인기순' | '내가 쓴 글';

interface DropDownProps {
  onSelect: (option: SortOption) => void;
}

const options: SortOption[] = ['최신순', '인기순', '내가 쓴 글'];

const dropDownStyle = tv({
  base: 'bg-grayscale-100 flex h-[45px] w-[335px] w-full items-center justify-between  px-[20px] py-[10px] sm:w-[120px] lg:w-[140px] cursor-pointer rounded-[10px]',
});

const dropDownValueStyle = tv({
  base: 'absolute bottom-[-70px] flex flex-col items-start px-[20px] py-[10px] bg-grayscale-100 text-md-regular  w-[335px] w-full sm:w-[120px] lg:w-[140px] gap-[8px] cursor-pointer rounded-b-[10px]',
});

export default function DropDown({ onSelect }: DropDownProps) {
  const [value, setValue] = useState<SortOption>('최신순');
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isOpen) return;

      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
      className="relative"
    >
      <div className={dropDownStyle() + ' text-md-regular text-grayscale-500'}>
        {value}
        <SVGIcon icon="IC_Arrow" />
      </div>
      {isOpen && (
        <ul className={dropDownValueStyle()}>
          {options.map((option) => (
            <li
              key={option}
              className="text-grayscale-500 w-full"
              onClick={(e) => {
                e.stopPropagation();
                setValue(option);
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
