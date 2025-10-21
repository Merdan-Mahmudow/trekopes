import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import type { Telegram } from 'telegram-web-app'


export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const tg: Telegram = window.Telegram;
    const navigate = useNavigate();
    useEffect(() => {
        tg.WebApp.BackButton.hide()
        navigate({ to: '/referral' })
    }, [tg]);
    return <>
        
    </>
}
