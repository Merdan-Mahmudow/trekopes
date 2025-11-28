import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import type { Telegram } from 'telegram-web-app'


export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const tg: Telegram | undefined = window.Telegram;
    const navigate = useNavigate();
    useEffect(() => {
        if (tg?.WebApp) {
            tg.WebApp.BackButton.hide();
        }
        navigate({ to: '/referral' });
    }, [navigate, tg]);
    return <>
        
    </>
}
