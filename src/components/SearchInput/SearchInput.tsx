import { tv } from 'tailwind-variants';
import SVGIcon from '../SVGIcon/SVGIcon';

const formStyle = tv({
  base: 'flex items-center gap-[15px] h-[45px] flex-1 w-full text-xl-medium text-grayscale-500 bg-grayscale-100 rounded-[10px]  py-[10px] px-[20px]',
});

const inputStyle = tv({
  base: 'flex flex-1 bg-transparent focus:outline-none',
});

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  onSubmit?: () => void;
}

export default function SearchInput({ value, onChange, onSubmit }: SearchInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form onSubmit={handleSubmit} className={formStyle()}>
      <SVGIcon icon="IC_Search" />
      <input
        type="text"
        onChange={onChange}
        value={value}
        className={inputStyle()}
        placeholder="이름을 검색해 주세요."
        aria-label="이름 검색 입력창"
      />
    </form>
  );
}
