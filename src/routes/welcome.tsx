import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { WelcomeStories } from '../components/Stories'

export const Route = createFileRoute('/welcome')({
  component: WelcomeScreen,
})

function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <WelcomeStories
      stories={[
        { id: 1, text: 'Добро пожаловать в Trekopes' },
        { id: 2, text: 'Создавайте треки и делитесь идеями мгновенно' },
        { id: 3, text: 'Готовы начать?' },
      ]}
      onFinish={() => navigate({ to: '/referral' })}
    />
  )
}

