'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import SnackBar from '@/components/SnackBar/SnackBar';
import { useAuth } from '@/contexts/AuthContext';

export default function WikiCreatePage() {
  const router = useRouter();
  const [errSnackBar, setErrorSnackBar] = useState(false);
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    securityQuestion: '',
    securityAnswer: '',
  });
  const [errors, setErrors] = useState({
    securityQuestion: '',
    securityAnswer: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    let error = '';

    if (field === 'securityQuestion' && !formData.securityQuestion.trim()) {
      error = '질문을 입력해주세요';
    }
    if (field === 'securityAnswer' && !formData.securityAnswer.trim()) {
      error = '답을 입력해주세요';
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const securityQuestionError = !formData.securityQuestion.trim() ? '질문을 입력해주세요' : '';
    const securityAnswerError = !formData.securityAnswer.trim() ? '답을 입력해주세요' : '';

    if (securityQuestionError || securityAnswerError) {
      setErrors({
        securityQuestion: securityQuestionError,
        securityAnswer: securityAnswerError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const accessToken =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer,
        }),
      });

      if (!response.ok) {
        setErrorSnackBar(true);
        return;
      }

      const data = await response.json();

      setShowSnackbar(true);

      // 생성된 위키의 code로 이동
      if (data.code) {
        // userProfile에 code 업데이트
        updateUserProfile({ code: data.code });
        router.push(`/wiki/${data.code}`);
      } else {
        router.push('/wikilist');
      }
    } catch (error) {
      console.error('위키 생성 실패:', error);
      alert(error instanceof Error ? error.message : '위키 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <main className="flex items-center justify-center px-4 py-28">
          <div className="w-full max-w-md">
            <h1 className="text-2xl-semibold text-grayscale-600 mb-8 text-center">위키 생성하기</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 질문 입력 */}
              <Input
                label=""
                name="securityQuestion"
                type="text"
                placeholder="질문을 입력해 주세요"
                value={formData.securityQuestion}
                onChange={handleChange}
                onBlur={() => handleBlur('securityQuestion')}
                error={errors.securityQuestion}
                required
                fullWidth
              />

              {/* 답 입력 */}
              <Input
                label=""
                name="securityAnswer"
                type="text"
                placeholder="답을 입력해 주세요"
                value={formData.securityAnswer}
                onChange={handleChange}
                onBlur={() => handleBlur('securityAnswer')}
                error={errors.securityAnswer}
                required
                fullWidth
              />

              {/* 생성하기 버튼 */}
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" fullWidth loading={isLoading}>
                  생성하기
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <SnackBar
        type="success"
        message="위키가 생성되었습니다."
        isOpen={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        duration={2000}
      />
      <SnackBar
        isOpen={errSnackBar}
        message="이미 생성된 위키가 있습니다."
        type="error"
        onClose={() => setErrorSnackBar(false)}
      />
    </>
  );
}
