import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Box, Text, Separator, Grid, Flex, IconButton, Input } from '@chakra-ui/react'
import { questions as allQuestions, type QuestionCategory, type QuestionSet } from '../components/ui/questions'
import { MdEdit, MdCheck } from 'react-icons/md'
import { COLOR } from '../components/ui/colors'
import { BrandButton } from '../components/ui/custom-button'
import { qaStorage } from '../utils/qaStorage'

export const Route = createFileRoute('/questionsFinish')({
    component: ResultsComponent,
})

interface ResultsComponentProps {
    onFinish?: () => void;
}

export function ResultsComponent({ onFinish }: ResultsComponentProps = {}) {
    // Получаем категорию и parent из qaStorage
    const category = useMemo(() => qaStorage.getActiveCategory(), []);
    const parent = useMemo(() => qaStorage.getFinalParent(category || undefined), [category]);

    const [answers, setAnswers] = useState<Record<number, string>>(() => 
        qaStorage.getAnswers(category || undefined, parent)
    )
    const [editingAnswer, setEditingAnswer] = useState<number | null>(null)
    const [tempAnswer, setTempAnswer] = useState("")
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Находим QuestionSet с нужным parent
    const questionSet: QuestionSet | undefined = useMemo(() => {
        if (!category) return undefined;
        const questionCategory: QuestionCategory | undefined = allQuestions.find((q) => q.category === category);
        if (!questionCategory) return undefined;
        
        return parent
            ? questionCategory.form.questions.find((qs) => qs.parent === parent)
            : questionCategory.form.questions.find((qs) => qs.parent === null);
    }, [category, parent]);

    // Получаем тексты вопросов из QuestionSet
    const questionTexts = useMemo(() => {
        return questionSet?.questions.map(q => q.text) ?? [];
    }, [questionSet]);

    useEffect(() => {
        if (editingAnswer !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingAnswer]);

    const handleSaveAnswer = (index: number) => {
        if (tempAnswer.trim()) {
            const newAnswers = { ...answers, [index]: tempAnswer }
            setAnswers(newAnswers)
            qaStorage.saveAnswers(category || undefined, parent, newAnswers)
        }
        setEditingAnswer(null)
        setTempAnswer("")
    }

    const startEditing = (index: number, currentAnswer: string) => {
        setEditingAnswer(index)
        setTempAnswer(currentAnswer)
    }

    const maxIndex = (() => {
        const ansMax = Object.keys(answers).reduce((m, k) => Math.max(m, Number(k) || 0), 0)
        const qMax = questionTexts.length
        return Math.max(ansMax, qMax)
    })()
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
    for (let i = 0; i < Math.max(1, maxIndex); i++) {
        const qText = questionTexts[i] ?? `Вопрос ${i + 1}`
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