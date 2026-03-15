'use client';

import BestArticle from '@/components/BestArticle/BestArticle';
import Button from '@/components/Button/Button';
import { tv } from 'tailwind-variants';
import { BestArticleSkeleton, ArticleRowSkeleton } from '@/components/Skeleton/Skeleton';
import SearchInput from '@/components/SearchInput/SearchInput';
import DropDown from '@/components/DropDown/DropDown';
import ArticleList from '@/components/ArticleList/ArticleList';
import { API } from '@/constants/api';
import { useState, useRef, useCallback, useEffect } from 'react';
import Pagination from '@/components/Pagination/Pagination';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import SnackBar from '@/components/SnackBar/SnackBar';
import { useAuth } from '@/contexts/AuthContext';
import BaseModal from '@/components/Modal/BaseModal';
import { useModal } from '@/hooks/useModal';

type ArticleProps = {
  id: number;
  title: string;
  writer: {
    id: number;
    name: string;
  };
  likeCount: number;
  createdAt: string;
  image?: string;
};

type SortOption = '최신순' | '인기순' | '내가 쓴 글';
const PAGE_SIZE = 10;

const boardStyle = tv({
  base: 'lg:w-[1060px] m-auto px-[20px] sm:px-[60px] lg:px-[0] box-border',
});

export default function BoardsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('최신순');
  const [articleData, setArticleData] = useState<ArticleProps[]>([]);
  const [filteredarticleData, setFilteredarticleData] = useState<ArticleProps[]>(articleData);
  const [page, setPage] = useState(1);
  const [errSnackBar, setErrorSnackBar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredarticleData(articleData);
      setPage(1);
      return;
    }

    const result = articleData.filter((article) => {
      const title = article.title.toLowerCase();
      const writer = article.writer.name.toLowerCase();

      return title.includes(keyword) || writer.includes(keyword);
    });

    setFilteredarticleData(result);
    setPage(1);
  };

  const handleSelect = (option: SortOption) => {
    setSort(option);
    setPage(1);
  };

  const startIndex = (page - 1) * PAGE_SIZE;
  // const sortedarticleData = [...filteredarticleData].sort((a, b) => {
  //   if (sort === '인기순') {
  //     return b.likeCount - a.likeCount;
  //   }

  //   return b.createdAt.localeCompare(a.createdAt);
  // });

  const dropdownSort = () => {
    if (sort === '내가 쓴 글') {
      return filteredarticleData.filter((article) => article.writer.id === Number(user?.id));
    }

    const data = [...filteredarticleData];

    if (sort === '인기순') {
      return data.sort((a, b) => b.likeCount - a.likeCount);
    }

    return data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  };

  const sortedArticleData = dropdownSort();

  const pagedarticleData = sortedArticleData.slice(startIndex, startIndex + PAGE_SIZE);

  const useHorizontalScroll = () => {
    const bestArticleRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleWheel = useCallback((e: WheelEvent) => {
      const container = bestArticleRef.current;

      if (container) {
        if (window.innerWidth >= 640) {
          return;
        }

        const delta = e.deltaY;
        container.scrollLeft += delta;
        e.preventDefault();
      }
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent) => {
      const container = bestArticleRef.current;
      if (!container || window.innerWidth >= 640) return;

      isDragging.current = true;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      const container = bestArticleRef.current;
      if (!container || !isDragging.current) return;

      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX.current) * 2;
      container.scrollLeft = scrollLeft.current - walk;
    }, []);

    const handleMouseUp = useCallback(() => {
      const container = bestArticleRef.current;
      if (!container) return;

      isDragging.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    }, []);

    const handleMouseLeave = useCallback(() => {
      const container = bestArticleRef.current;
      if (!container) return;

      isDragging.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    }, []);

    useEffect(() => {
      const container = bestArticleRef.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseLeave);

        // 초기 커서 스타일 설정
        if (window.innerWidth < 640) {
          container.style.cursor = 'grab';
        }

        return () => {
          container.removeEventListener('wheel', handleWheel);
          container.removeEventListener('mousedown', handleMouseDown);
          container.removeEventListener('mousemove', handleMouseMove);
          container.removeEventListener('mouseup', handleMouseUp);
          container.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
      return () => {};
    }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);
    return bestArticleRef;
  };

  const bestRef = useHorizontalScroll();

  useEffect(() => {
    async function fetcharticleData() {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API.ARTICLES}?page=1&pageSize=100&orderBy=recent`);

        setArticleData(res.data.list);
        setFilteredarticleData(res.data.list);
      } catch (error) {
        console.error(error);
        setErrorSnackBar(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetcharticleData();
  }, []);

  const handleClickAddBoard = () => {
    if (!isLoggedIn) {
      openModal();
      return;
    }
    router.push('/addboard');
  };

  return (
    <>
      <div className={boardStyle()}>
        <div className="mt-10 mb-10 flex items-center justify-between sm:mt-[60px] sm:mb-[60px]">
          <h1 className="responsive-text text-3xl-to-2xl text-grayscale-500">베스트 게시글</h1>

          <Button
            variant="primary"
            size="md"
            className="text-md-semibold flex h-[45px] items-center justify-center"
            onClick={handleClickAddBoard}
            disabled={!isLoggedIn}
          >
            게시물 등록하기
          </Button>
        </div>
        <div
          ref={bestRef}
          id="dragBox"
          className="no-scrollbar min-h-[220px] overflow-x-auto sm:min-h-auto"
        >
          <div className="mb-10 grid max-w-[1048px] auto-cols-[250px] grid-flow-col gap-4 min-[640px]:auto-cols-auto min-[640px]:grid-flow-row min-[640px]:grid-cols-2 sm:mb-[60px] lg:grid-cols-4">
            {isLoading
              ? // 로딩 스켈레톤
                Array.from({ length: 4 }).map((_, i) => <BestArticleSkeleton key={i} />)
              : [...articleData]
                  .sort((a, b) => b.likeCount - a.likeCount)
                  .slice(0, 4)
                  .map((article) => <BestArticle key={article.id} {...article} />)}
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-1 gap-5">
            <div className="min-w-0 flex-1">
              <SearchInput value={search} onChange={handleChange} onSubmit={handleSearchSubmit} />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="hover:bg-primary-300 active:bg-primary-300 bg-primary-200 text-grayscale-50 text-md-semibold h-[45px] w-20 shrink-0 rounded-[10px]"
            >
              검색
            </button>
          </div>
          <DropDown onSelect={handleSelect} />
        </div>
        <table className="text-grayscale-400 m-auto mt-[30px] mb-8 w-full sm:mt-5 sm:mb-[60px] md:px-[60px] lg:w-[1060px]">
          <thead className="text-lg-regular max-[640px]:hidden">
            <tr className="border-b">
              <th className="text-lg-regular px-4 py-2">번호</th>
              <th className="text-lg-regular px-4 py-2">제목</th>
              <th className="text-lg-regular px-4 py-2">작성자</th>
              <th className="text-lg-regular px-4 py-2">좋아요</th>
              <th className="text-lg-regular px-4 py-2">날짜</th>
            </tr>
          </thead>

          <tbody>
            {isLoading
              ? // 로딩 스켈레톤
                Array.from({ length: 5 }).map((_, i) => <ArticleRowSkeleton key={i} />)
              : pagedarticleData.map((article) => (
                  <ArticleList
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    writer={article.writer.name}
                    likeCount={article.likeCount}
                    createdAt={article.createdAt}
                  />
                ))}
          </tbody>
        </table>
        <div className="mb-[57px] flex justify-center md:mb-20 lg:mb-[120px]">
          <Pagination
            currentPage={page}
            totalCount={filteredarticleData.length}
            setPage={setPage}
            viewCount={PAGE_SIZE}
          />
        </div>
      </div>
      <SnackBar
        isOpen={errSnackBar}
        message="데이터를 불러오는데 실패했습니다."
        type="error"
        onClose={() => setErrorSnackBar(false)}
      />
      <BaseModal size="image" isOpen={isOpen} onClose={closeModal}>
        <div className="mt-5 flex flex-col justify-center gap-5 p-3">
          <span className="text-lg">로그인이 필요한 서비스입니다.</span>
          <Button href="/login">로그인 페이지</Button>
        </div>
      </BaseModal>
    </>
  );
}
