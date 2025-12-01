import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { WelcomeStories } from '../components/Stories'
import { PreLoader } from '../components/PreLoader'
import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'

export const Route = createFileRoute('/welcome')({
  component: WelcomeScreen,
})

function WelcomeScreen() {
  const navigate = useNavigate();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Проверяем, первый ли это вход
  useEffect(() => {
    const isWelcomeSeen = localStorage.getItem('isWelcomeSeen');
    const firstVisit = !isWelcomeSeen;
    setIsFirstVisit(firstVisit);
    
    // Если не первый вход, видео считается готовым сразу
    if (!firstVisit) {
      setIsVideoReady(true);
    }
  }, []);

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const handleFinish = () => {
    localStorage.setItem('isWelcomeSeen', 'true');
    navigate({ to: '/referral' });
  };

  const stories = [
    { id: 1, text: 'Добро пожаловать в Trekopes' },
    { id: 2, video: 'https://storage.yandexcloud.net/trekopes-ai/IMG_8911.MOV'  },
    { id: 3, text: 'Готовы начать?'},
  ];

  // Пока не определили, первый ли это вход, показываем прелоадер
  if (isFirstVisit === null) {
    return <PreLoader />;
  }

  // Если первый вход, показываем прелоадер пока видео не загрузится
  // Если не первый вход, показываем stories сразу (прелоадер уже скрыт после /me)
  return (
    <Box position="relative" w="100vw" h="100vh">
      {isFirstVisit && !isVideoReady && (
        <Box position="absolute" inset={0} zIndex={10}>
          <PreLoader />
        </Box>
      )}
      <WelcomeStories
        stories={stories}
        onFinish={handleFinish}
        waitForVideo={isFirstVisit}
        onVideoReady={handleVideoReady}
      />
    </Box>
  );
}

