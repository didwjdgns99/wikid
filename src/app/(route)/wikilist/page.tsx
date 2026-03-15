'use client';

import { Suspense, useEffect } from 'react';
import type React from 'react';
import SearchInput from '@/components/SearchInput/SearchInput';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';
import ListCard from '@/components/ListCard/ListCard';
import Pagination from '@/components/Pagination/Pagination';
import { tv } from 'tailwind-variants';
import Image from 'next/image';
import NoSearch from '@/assets/images/no-search.png';
import { API } from '@/constants/api';
import SnackBar from '@/components/SnackBar/SnackBar';
import { ListCardSkeleton } from '@/components/Skeleton/Skeleton';

interface Profile {
  id: number;
  name: string;
  image: string;
  city: string;
  nationality: string;
  job: string;
  code: string;
}

interface ProfileListResponse {
  list: Profile[];
}

const PAGE_SIZE = 3;

function WikiListContent() {
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errSnackBar, setErrorSnackBar] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get('keyword') ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/wikilist?keyword=${encodeURIComponent(search)}`);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredProfiles = keywordFromUrl
    ? profiles.filter((profile) => profile.name.includes(keywordFromUrl))
    : profiles;

  const startIndex = (page - 1) * PAGE_SIZE;
  const currentProfiles = filteredProfiles.slice(startIndex, startIndex + PAGE_SIZE);

  const wikiWrap = tv({
    base: 'flex flex-col justify-center items-center m-auto md:w-[860px] mt-[40px] sm:mt-[70px] lg:mt-[80px]',
  });

  const searchStyle = tv({
    base: 'flex flex-col items-start w-full gap-[16px] mb-[40px] sm:mb-[100px] lg:mb-[57px] px-[20px]',
  });

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setIsLoading(true);
        const res = await apiClient.publicJson<ProfileListResponse>(
          `${API.PROFILE}?page=1&pageSize=100`
        );
        // console.log('프로필 개수:', res.list.length);
        // console.log(res.list);
        setProfiles(res.list);
      } catch (error) {
        console.error(error);
        setErrorSnackBar(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  return (
    <div>
      <div className={wikiWrap()}>
        <div className={searchStyle()}>
          <SearchInput value={search} onChange={handleChange} />
          <span className="text-grayscale-400 max-[680px]:text-sm">
            {keywordFromUrl ? (
              filteredProfiles.length > 0 ? (
                <>
                  "{keywordFromUrl}"님을 총
                  <span className="text-primary-200">&nbsp;{filteredProfiles.length}&nbsp;</span>명
                  찾았습니다.
                </>
              ) : (
                ''
              )
            ) : (
              '검색어를 입력해 주세요.'
            )}
          </span>
        </div>

        <section className="mb-[54px] flex h-[466px] min-h-[466px] w-full max-w-[860px] flex-col gap-6 px-6 md:mb-[81px] md:h-[474px] md:min-h-[474px] md:px-6 lg:mb-[121px]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ListCardSkeleton key={i} />)
          ) : filteredProfiles.length <= 0 ? (
            <div className="text-grayscale-400 flex flex-col items-center justify-center gap-8 py-[60px] text-center">
              {keywordFromUrl ? (
                <span className="text-md">"{keywordFromUrl}"과 일치한 검색 결과가 없습니다.</span>
              ) : (
                <span className="text-md">데이터를 불러오는데 실패했습니다.</span>
              )}
              <Image
                className="h-[108px] w-[108px] md:h-36 md:w-36"
                src={NoSearch}
                alt="검색결과 없음 이미지"
              />
            </div>
          ) : (
            currentProfiles.map((profile) => (
              <ListCard
                key={profile.id}
                image={profile.image}
                name={profile.name}
                city={profile.city}
                nationality={profile.nationality}
                job={profile.job}
                code={profile.code}
              />
            ))
          )}
        </section>

        <div className="mb-[35px] md:mb-[229px] lg:mb-[136px]">
          <Pagination
            currentPage={page}
            totalCount={filteredProfiles.length}
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
    </div>
  );
}

export default function WikiListPage() {
  return (
    <Suspense fallback={<div>위키 리스트 불러오는 중...</div>}>
      <WikiListContent />
    </Suspense>
  );
}
