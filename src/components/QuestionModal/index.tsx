import { Box, Flex, Grid, Text, Textarea } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { COLOR } from "../ui/colors";
import { BrandButton, GrayButton } from "../ui/button";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { questions, type QuestionCategory, type QuestionSet } from "../ui/questions";

type QuestionModalProps = {
    category: string;
    parent: string | null;
    currentIndex: number;
    onNext?: () => void;
    onPrev?: () => void;
    onBackToCategories?: () => void;
    onFinish?: () => void;
};

const MotionFlex = motion(Flex);

export function QuestionModal({
    category,
    parent,
    currentIndex,
    onNext,
    onPrev,
    onBackToCategories,
    onFinish
}: QuestionModalProps) {
    // Находим категорию вопросов
    const questionCategory: QuestionCategory | undefined = useMemo(() => {
        return questions.find((q) => q.category === category);
    }, [category]);

    // Находим QuestionSet с нужным parent
    const questionSet: QuestionSet | undefined = useMemo(() => {
        if (!questionCategory) {
            return undefined;
        }
        
        // Ищем QuestionSet с нужным parent
        // parent может быть строкой (финальное значение из quest) или null (для категорий без quest)
        const found = questionCategory.form.questions.find((qs) => {
            // Сравниваем parent строго: null === null, строка === строка
            if (parent === null || parent === undefined) {
                return qs.parent === null;
            }
            return qs.parent === parent;
        });
        
        return found;
    }, [questionCategory, parent]);

    // Получаем текущий вопрос
    const currentQuestion = questionSet?.questions[currentIndex];
    const totalQuestions = questionSet?.questions.length ?? 0;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;
    

    const [value, setValue] = useState("");
    const [answers, setAnswers] = useState<Record<number, string>>(() => {
        try {
            const raw = localStorage.getItem("qa_answers");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // 1 = вперед (влево), -1 = назад (вправо)
    const [direction, setDirection] = useState<1 | -1>(1);

    useEffect(() => {
        setValue(answers[currentIndex] ?? "");
    }, [currentIndex, answers]);

    const persistAnswers = (next: Record<number, string>) => {
        try {
            localStorage.setItem("qa_answers", JSON.stringify(next));
        } catch {
            // ignore
        }
    };

    const handleChange = (v: string) => {
        setValue(v);
        setAnswers((prev) => {
            const next = { ...prev, [currentIndex]: v };
            persistAnswers(next);
            return next;
        });
    };

    const handleNext = () => {
        setDirection(1);
        setAnswers((prev) => {
            const next = { ...prev, [currentIndex]: value };
            persistAnswers(next);
            return next;
        });
        onNext && onNext();

        if (isLast) {
            onFinish && onFinish();
        }
    };

    const handlePrev = () => {
        setDirection(-1);
        setAnswers((prev) => {
            const next = { ...prev, [currentIndex]: value };
            persistAnswers(next);
            return next;
        });

        if (isFirst && onBackToCategories) {
            onBackToCategories();
        } else {
            onPrev && onPrev();
        }
    };

    // анимация направлений
    const variants = {
        enter: (direction: 1 | -1) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: 1 | -1) => ({
            x: direction > 0 ? -100 : 100,
            opacity: 0,
        }),
    };

    // Если вопрос не найден, показываем сообщение об ошибке
    if (!currentQuestion) {
        // Если QuestionSet не найден, значит проблема с parent
        if (!questionSet) {
            return (
                <Box px={4} py={8} color={COLOR.kit.orangeWhite}>
                    <Text fontSize="lg" mb={4}>Набор вопросов не найден</Text>
                    <Text fontSize="sm" color={COLOR.kit.smoke} mb={2}>
                        Категория: {category}
                    </Text>
                    <Text fontSize="sm" color={COLOR.kit.smoke} mb={2}>
                        Parent: {parent ?? 'null'}
                    </Text>
                    {questionCategory && (
                        <Text fontSize="sm" color={COLOR.kit.smoke} mb={4}>
                            Доступные parent: {questionCategory.form.questions.map(q => q.parent ?? 'null').join(', ')}
                        </Text>
                    )}
                    {onBackToCategories && (
                        <GrayButton mt={4} onClick={onBackToCategories}>
                            Назад к категориям
                        </GrayButton>
                    )}
                </Box>
            );
        }
        
        // Если QuestionSet найден, но индекс выходит за границы
        return (
            <Box px={4} py={8} color={COLOR.kit.orangeWhite}>
                <Text fontSize="lg" mb={4}>Вопрос не найден</Text>
                <Text fontSize="sm" color={COLOR.kit.smoke} mb={2}>
                    Индекс: {currentIndex}, Всего вопросов: {totalQuestions}
                </Text>
                {onBackToCategories && (
                    <GrayButton mt={4} onClick={onBackToCategories}>
                        Назад к категориям
                    </GrayButton>
                )}
            </Box>
        );
    }

    return (
        <AnimatePresence custom={direction} mode="wait">
            <MotionFlex
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "linear" }}
                px={4}
                w={"90vw"}
                flexDirection={"column"}
                gap={6}>

                <Box maxW="80vw">
                    <Text fontSize={"18px"} lineHeight={"130%"} color={COLOR.kit.orangeWhite}>{currentQuestion.text}</Text>
                    <Text color={COLOR.kit.smoke}>Вопрос {currentIndex + 1}</Text>
                </Box>
                <Textarea
                    placeholder={currentQuestion.placeholder}
                    maxW="90vw"
                    p={"12px 24px"}
                    rounded={"3xl"}
                    height={"150px"}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    fontSize={"16px"}
                    border={{ _focus: `${COLOR.kit.orange} 2px solid` }}
                    outline={"none"}
                    lineHeight={"130%"}
                />

                <Grid pt={3} gap={4} templateColumns={"1fr 1fr"} w="100%" maxW="90vw">
                    <GrayButton onClick={handlePrev}>
                       <FaArrowLeft /> Назад 
                    </GrayButton>
                    <BrandButton onClick={handleNext}>
                        {isLast ? (
                            "Завершить"
                        ) : value.length > 0 ? (
                            <>
                                Далее <FaArrowRight />
                            </>
                        ) : (
                            "Пропустить"
                        )}
                    </BrandButton>

                </Grid>
            </MotionFlex>
        </AnimatePresence>
    );
}
