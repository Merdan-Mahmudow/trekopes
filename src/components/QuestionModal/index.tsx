import { Box, Button, Flex, Grid, Input, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

type QuestionModalProps = {
    qNum: number;
    qText: string;
    qHolder: string;
    onNext?: () => void;
    onPrev?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
};

export function QuestionModal({ qNum, qText, qHolder, onNext, onPrev, isFirst, isLast }: QuestionModalProps) {
    const [value, setValue] = useState("");
    const [answers, setAnswers] = useState<Record<number, string>>(() => {
        try {
            const raw = localStorage.getItem("qa_answers");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // при смене номера вопроса подгружаем ранее сохранённый ответ (если есть)
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
        setAnswers(prev => {
            const next = { ...prev, [qNum]: v };
            persistAnswers(next);
            return next;
        });
    };

    const handleNext = () => {
        setAnswers(prev => {
            const next = { ...prev, [qNum]: value };
            persistAnswers(next);
            return next;
        });
        onNext && onNext();
    };

    const handlePrev = () => {
        setAnswers(prev => {
            const next = { ...prev, [qNum]: value };
            persistAnswers(next);
            return next;
        });
        onPrev && onPrev();
    };

    return (
        <>
            <Grid
                key={qNum}
                h={"250px"}
                rounded={"2xl"}
                pos={"relative"}
                placeSelf={"center"}
                w={"400px"}
                templateRows={"50px 1fr 50px"}

            >
                <Flex borderBottom={".5px solid "} h={"full"} alignItems={"center"}><Text w={"full"} textAlign={"center"}>Вопрос {qNum}</Text></Flex>
                <Box p={4} w="100%" maxW="400px">
                    <Text>{qText}</Text>
                    <Input placeholder={qHolder} value={value} onChange={(e) => handleChange(e.target.value)} />
                </Box>
                <Grid px={4} gap={4} templateColumns={"1fr 1fr"} w="100%" maxW="400px">
                    <Button rounded={"xl"} onClick={handlePrev}>{isFirst ?  <Link to="/create">Назад</Link>: "Назад"}</Button>
                    <Button rounded={"xl"} onClick={handleNext}>{isLast ? <Link to="/questionsFinish">Завершить</Link> : value.length > 0 ? "Продолжить" : "Пропустить"}</Button>
                </Grid>
            </Grid>
        </>
    )
}