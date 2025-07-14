import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingTourProps {
  runTour: boolean;
  onTourEnd: () => void;
}

const tourSteps: Step[] = [
  {
    target: '.domain-input',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">🌐 Nhập Domain</h3>
        <p className="text-gray-700">
          Bắt đầu bằng cách nhập URL website bạn muốn phân tích SEO. 
          Hệ thống sẽ quét toàn bộ trang web để tìm ra các vấn đề SEO.
        </p>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Mẹo:</strong> Nhập URL đầy đủ như https://example.com
          </p>
        </div>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.analyze-button',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">🔍 Phân Tích SEO</h3>
        <p className="text-gray-700">
          Nhấn nút này để bắt đầu quá trình phân tích SEO chi tiết. 
          Hệ thống AI sẽ kiểm tra hơn 50+ yếu tố SEO quan trọng.
        </p>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            ⚡ <strong>Thời gian:</strong> Quá trình phân tích mất 30-60 giây
          </p>
        </div>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '.seo-comparison',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">📊 Bảng So Sánh SEO</h3>
        <p className="text-gray-700">
          Xem chi tiết các vấn đề SEO được phát hiện và gợi ý cải thiện từ AI. 
          Bảng này so sánh trạng thái hiện tại với phiên bản được tối ưu.
        </p>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-purple-800">
            🎯 <strong>Điểm SEO:</strong> Mục tiêu đạt từ 80+ điểm
          </p>
        </div>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '.ai-optimize-button',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">🤖 Tối Ưu AI</h3>
        <p className="text-gray-700">
          Sử dụng AI để tự động sửa các lỗi SEO. AI sẽ viết lại title, 
          meta description, heading và cải thiện nội dung.
        </p>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-sm text-orange-800">
            🛡️ <strong>An toàn:</strong> Luôn tạo backup trước khi thay đổi
          </p>
        </div>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '.pdf-report-button',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">📄 Báo Cáo PDF</h3>
        <p className="text-gray-700">
          Tạo báo cáo SEO chuyên nghiệp định dạng PDF để chia sẻ với khách hàng 
          hoặc đồng nghiệp. Báo cáo bao gồm tất cả phân tích và gợi ý.
        </p>
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-red-800">
            📈 <strong>Chuyên nghiệp:</strong> Báo cáo chi tiết với biểu đồ
          </p>
        </div>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '.account-menu',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">👤 Tài Khoản</h3>
        <p className="text-gray-700">
          Quản lý gói dịch vụ, xem lịch sử phân tích và theo dõi số lượt sử dụng còn lại. 
          Bạn có thể xem lại hướng dẫn này bất cứ lúc nào.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-800">
            🔄 <strong>Mẹo:</strong> Có thể xem lại tour này từ trang Tài khoản
          </p>
        </div>
      </div>
    ),
    placement: 'bottom-start',
  }
];

export function OnboardingTour({ runTour, onTourEnd }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (runTour) {
      setIsRunning(true);
      setStepIndex(0);
    }
  }, [runTour]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, type, index } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setIsRunning(false);
      
      // Mark onboarding as completed for this user
      if (user) {
        try {
          await supabase
            .from('user_profiles')
            .update({ 
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        } catch (error) {
          console.error('Error updating onboarding status:', error);
        }
      }
      
      onTourEnd();
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  if (!isRunning) return null;

  return (
    <Joyride
      steps={tourSteps}
      run={isRunning}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#6366f1', // Indigo color
          textColor: '#374151',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltip: {
          fontSize: '14px',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '320px',
          maxWidth: '400px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
        },
        buttonBack: {
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '600',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          backgroundColor: '#ffffff',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '600',
          padding: '8px 16px',
        },
        buttonClose: {
          color: '#6b7280',
          fontSize: '18px',
          fontWeight: 'bold',
          width: '24px',
          height: '24px',
          right: '8px',
          top: '8px',
        },
        spotlight: {
          borderRadius: '8px',
        }
      }}
      locale={{
        back: 'Quay lại',
        close: 'Đóng',
        last: 'Hoàn thành',
        next: 'Tiếp theo',
        skip: 'Bỏ qua',
        open: 'Mở hộp thoại',
      }}
      callback={handleJoyrideCallback}
      disableOverlayClose
      hideCloseButton={false}
      scrollToFirstStep
      spotlightClicks
    />
  );
}