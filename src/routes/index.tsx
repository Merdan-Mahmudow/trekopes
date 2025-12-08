import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';


export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const isWelcomeSeen = localStorage.getItem('isWelcomeSeen')
    const navigate = useNavigate();
    useEffect(() => {
        if (!isWelcomeSeen) {
            localStorage.setItem('isWelcomeSeen', 'true')
            navigate({ to: '/welcome' })
        } else {
            navigate({ to: '/generate' })
        }
    }, [isWelcomeSeen, navigate]);
    return <>
        
    </>
}
