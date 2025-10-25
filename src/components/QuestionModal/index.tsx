import { Box, Grid, Input, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { COLOR } from "../ui/colors";
import { BrandButton, GrayButton } from "../ui/button";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

type QuestionModalProps = {
    qNum: number;
    qText: string;
    qHolder: string;
    onNext?: () => void;
    onPrev?: () => void;
    onBackToCategories?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    onFinish?: () => void;
};

const MotionGrid = motion(Grid);

export function QuestionModal({
    qNum,
    qText,
    qHolder,
    onNext,
    onPrev,
    onBackToCategories,
    isFirst,
    isLast,
    onFinish
}: QuestionModalProps) {
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
        setValue(answers[qNum] ?? "");
    }, [qNum, answers]);

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
            const next = { ...prev, [qNum]: v };
            persistAnswers(next);
            return next;
        });
    };

    const handleNext = () => {
        setDirection(1);
        setAnswers((prev) => {
            const next = { ...prev, [qNum]: value };
            persistAnswers(next);
            return next;
        });
        onNext && onNext();

        if (isLast){
            console.log("yeeeeees")
            onFinish && onFinish();
        }
    };

    const handlePrev = () => {
        setDirection(-1);
        setAnswers((prev) => {
            const next = { ...prev, [qNum]: value };
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

    return (
        <AnimatePresence custom={direction} mode="wait">
            <MotionGrid
                key={qNum}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "linear" }}
                rounded={"2xl"}
                placeSelf={"center"}
                w={"400px"}
                templateRows={"1fr 50px"}
                gap={6}>

                <Box maxW="80vw">
                    <Text fontSize={"24px"} lineHeight={"130%"} color={COLOR.kit.orangeWhite}>{qText}</Text>
                    <Text color={COLOR.kit.smoke}>Вопрос {qNum}</Text>
                </Box>
                <Input
                    placeholder={qHolder}
                    p={"12px 24px"}
                    rounded={"3xl"}
                    height={"58px"}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    fontSize={"16px"}
                    border={{ _focus: `${COLOR.kit.orange} 2px solid` }}
                    outline={"none"}
                    lineHeight={"130%"}
                />

                <Grid px={4} pt={3} gap={4} templateColumns={"1fr 1fr"} w="100%" maxW="400px">
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
            </MotionGrid>
        </AnimatePresence>
    );
}
