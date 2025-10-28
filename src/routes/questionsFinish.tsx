import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Box, Text, Separator, Grid, Flex, IconButton, Input } from '@chakra-ui/react'
import { questions as allQuestions } from '../components/ui/questions'
import { MdEdit, MdCheck } from 'react-icons/md'
import { COLOR } from '../components/ui/colors'
import { BrandButton } from '../components/ui/button'

export const Route = createFileRoute('/questionsFinish')({
    component: ResultsComponent,
})

interface ResultsComponentProps {
    onFinish?: () => void;
}

export function ResultsComponent({ onFinish }: ResultsComponentProps = {}) {
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [questions, setQuestions] = useState<string[] | null>(null)
    const [editingAnswer, setEditingAnswer] = useState<number | null>(null)
    const [tempAnswer, setTempAnswer] = useState("")
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
    if (editingAnswer !== null && inputRef.current) {
        inputRef.current.focus();
    }
}, [editingAnswer]);


    const handleSaveAnswer = (index: number) => {
        if (tempAnswer.trim()) {
            const newAnswers = { ...answers, [index]: tempAnswer }
            setAnswers(newAnswers)
            localStorage.setItem('qa_answers', JSON.stringify(newAnswers))
        }
        setEditingAnswer(null)
        setTempAnswer("")
    }

    const startEditing = (index: number, currentAnswer: string) => {
        setEditingAnswer(index)
        setTempAnswer(currentAnswer)
    }

    useEffect(() => {
        // load answers
        try {
            const rawA = localStorage.getItem('qa_answers')
            const parsedA = rawA ? JSON.parse(rawA) : {}
            const normA: Record<number, string> = {}
            Object.keys(parsedA || {}).forEach(k => {
                const n = Number(k)
                if (!Number.isNaN(n)) normA[n] = parsedA[k]
            })
            setAnswers(normA)
        } catch {
            setAnswers({})
        }

        // try: 1) category saved -> use questions from local file; 2) fallback to qa_questions in localStorage
        try {
            const storedCategory = localStorage.getItem('qa_category')
            if (storedCategory) {
                const found = allQuestions.find(q => q.category === storedCategory)
                if (found) {
                    setQuestions(found.questions.map(item => item.qText))
                    return
                }
            }

            const rawQ = localStorage.getItem('qa_questions')
            if (rawQ) {
                const parsedQ = JSON.parse(rawQ)
                if (Array.isArray(parsedQ)) setQuestions(parsedQ)
                else if (typeof parsedQ === 'object' && parsedQ !== null) {
                    // объект вида {1: "text"} -> массив
                    const arr: string[] = []
                    Object.keys(parsedQ).forEach(k => {
                        const n = Number(k)
                        if (!Number.isNaN(n)) arr[n - 1] = parsedQ[k]
                    })
                    setQuestions(arr)
                } else {
                    setQuestions(null)
                }
            } else {
                setQuestions(null)
            }
        } catch {
            setQuestions(null)
        }
    }, [])

    const maxIndex = (() => {
        const ansMax = Object.keys(answers).reduce((m, k) => Math.max(m, Number(k) || 0), 0)
        const qMax = questions ? questions.length : 0
        return Math.max(ansMax, qMax)
    })()

    const rows = []
    for (let i = 1; i <= Math.max(1, maxIndex); i++) {
        const qText = questions ? (questions[i - 1] ?? `Вопрос ${i}`) : `Вопрос ${i}`
        const answer = answers[i] ?? ''
        const unanswered = !answer || answer.trim() === ''
        rows.push(
            <Box key={i} w="100%" textAlign={"start"}>
                <Text fontWeight="semibold" textDecoration={unanswered ? 'line-through' : 'none'}>
                    {qText}
                </Text>
                <Text ml={2}>
                    {unanswered ? '— (не отвечали)' : answer}
                </Text>
                <Separator my={1} color={"white"} />
            </Box>
        )
    }
    const renderAnswer = (qText: string, answer: string, index: number, unanswered: boolean) => {
        if (editingAnswer === index) {
            return (
                <Flex key={index} w="100%" alignItems="flex-start" gap={2}>
                    <Box flex={1}>
                        <Text mb={3}>{qText}</Text>
                        <Flex gap={2} ml={2} alignItems={"center"}>
                            <Input
                                value={tempAnswer}
                                onChange={(e) => setTempAnswer(e.target.value)}
                                placeholder="Ваш ответ"
                                fontSize={"16px"}
                                p={"12px 24px"}
                                rounded={"3xl"}
                                height={"58px"}
                                border={{ _focus: `${COLOR.kit.orange} 2px solid` }}
                                outline={"none"}
                                lineHeight={"130%"}
                                ref={inputRef}
                            />
                            <IconButton
                                bg={"transparent"}
                                color="white"
                                children={<MdCheck style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />}
                                onClick={() => handleSaveAnswer(index)}
                            />
                        </Flex>
                    </Box>
                </Flex>
            )
        }

        return (
            <Flex key={index} w="100%" alignItems="center" gap={2}>
                <Box flex={1}>
                    <Text fontSize={"14px"} color={COLOR.kit.smoke} textDecoration={unanswered ? 'line-through' : 'none'}>
                        {qText}
                    </Text>
                    <Text fontSize={"16px"} ml={2} onClick={() => startEditing(index, answer)}>
                        {unanswered ? '— (не отвечали)' : answer}
                    </Text>
                    <Separator my={4} color={"white"} />
                </Box>
                <IconButton
                    aria-label="Edit answer"
                    children={<MdEdit />}
                    size="sm"
                    variant="ghost"
                    colorScheme="purple"
                    onClick={() => startEditing(index, answer)}
                />
            </Flex>
        )
    }

    const questionsAndAnswers = []
    for (let i = 1; i <= Math.max(1, maxIndex); i++) {
        const qText = questions ? (questions[i - 1] ?? `Вопрос ${i}`) : `Вопрос ${i}`
        const answer = answers[i] ?? ''
        const unanswered = !answer || answer.trim() === ''
        questionsAndAnswers.push(renderAnswer(qText, answer, i, unanswered))
    }

    return (
        <Box maxW="full" mx="auto">
            <Text fontSize={"24px"} color={COLOR.kit.orangeWhite} mb={4}>Итог ответов</Text>
            <Grid alignItems={"start"} gap={2}>
                {questionsAndAnswers}
            </Grid>

            <Grid w={"full"} templateColumns="1fr" gap={4}mt={8}>
                <BrandButton
                w='full'
                    onClick={onFinish}
                    disabled={editingAnswer !== null}>
                    Утвердить
                </BrandButton>
            </Grid>
        </Box>
    )
}