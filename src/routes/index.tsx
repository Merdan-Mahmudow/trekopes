import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import type { Telegram } from 'telegram-web-app'


export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const tg: Telegram = window.Telegram;
    const isWelcomeSeen = localStorage.getItem('isWelcomeSeen')
    const navigate = useNavigate();
    useEffect(() => {
        tg.WebApp.BackButton.hide()
        if (!isWelcomeSeen) {
            localStorage.setItem('isWelcomeSeen', 'true')
            navigate({ to: '/welcome' })
        } else {
            navigate({ to: '/generate' })
        }
    }, [tg, isWelcomeSeen]);
    return <>
        
    </>
}
