import { COLOR } from '../../../components/ui/colors'
import { Box, Button, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BsPeople, BsMagic } from 'react-icons/bs'
import { FaRegFaceSmile } from 'react-icons/fa6'
import { RiHomeHeartLine, RiShieldStarLine } from 'react-icons/ri'
import { TbHeartBroken, TbHeart, TbConfetti } from 'react-icons/tb'
import { AnimatePresence, motion } from "framer-motion";
import { QuestionModal } from "../../../components/QuestionModal";
import { questions as allQuestions, type QuestionCategory, type QuestItem } from "../../../components/ui/questions";
import { ResultsComponent } from '../../../routes/questionsFinish'
import { GenerationParamsAccordion } from '../GenerationParamsAccordion'
import { BrandButton, GrayButton } from '../../ui/custom-button'
import { DiaologWindow } from '../../../components/Dialog'
import { ProPayScreen } from '../ProPay'
import { TrackLoadingScreen } from '../TrackLoading'
import { useNavigate } from '@tanstack/react-router'
import { useIsPro, useUser } from '../../../store/user'
import {
    setGenerationScenario,
    updateGenerationScenario,
    useGenerationScenario,
} from '../../../store/generation'
import {
    createTextGenerationDraft,
    type GenerationDraftAnswer,
    type TextGenerationDraft,
} from '../../../types/generation'
import { qaStorage } from '../../../utils/qaStorage'
const MotionDiv = motion.div;

const buttonStyle = {
    h: "70px",
    justifyContent: "flex-start",
    w: 'full',
    className: "font-doloman",
    fontSize: "13pt",
    bg: { base: COLOR.kit.darkGray },
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    color: "white",
    rounded: "2xl",
}

type ChangeButtonProps = {
    icon: any,
    title: string,
    category: string,
    onClick?: () => void,
    isSelected?: boolean
}

const ChangeButton = ({ icon, title, onClick, isSelected }: ChangeButtonProps) => {
    return (
        <Button
            justifyContent={buttonStyle.justifyContent}
            w={buttonStyle.w}
            h={buttonStyle.h}
            fontSize={buttonStyle.fontSize}
            bg={isSelected ? COLOR.kit.smoke : buttonStyle.bg}
            boxShadow={buttonStyle.boxShadow}
            color={buttonStyle.color}
            rounded={buttonStyle.rounded}
            onClick={onClick}
            outline={"none"}
        >
            {icon} {title}
        </Button>
    )
}

type OptionButtonProps = {
    option: { label: string; value: string };
    onClick: () => void;
    isSelected?: boolean;
}

const OptionButton = ({ option, onClick, isSelected = false }: OptionButtonProps) => (
    <Button
        justifyContent="center"
        w="full"
        h="70px"
        fontSize="11pt"
        bg={isSelected ? COLOR.kit.orange : COLOR.kit.darkGray}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
        rounded="2xl"
        onClick={onClick}
        color="white"
        outline="none"
    >
        {option.label}
    </Button>
)

export function TextGenerateScreen() {
    const navigate = useNavigate()
    const [showProReminder, setShowProReminder] = useState(false);
    const [skipClicked, setSkipClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isPro = useIsPro();
    const user = useUser();
    const scenarioState = useGenerationScenario();
    const [step, setStep] = useState<string>('category');
    const [selectedCategory, setSelectedCategory] = useState<ChangeButtonProps['category'] | null>(null);

    // showProReminder должен быть true только если у пользователя пустой баланс
    const hasEmptyBalance = user.limit === 0;

    useEffect(() => {
        if (!scenarioState || scenarioState.mode !== "scenario") {
            setGenerationScenario(createTextGenerationDraft());
        }
    }, [scenarioState]);

    const withIconBackground = (icon: ReactNode): ReactNode => (
        <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            mr={3}
            p="16px"
            bg={COLOR.kit.iconBg}
            borderRadius="2xl"
        >
            {icon}
        </Box>
    );

    const buttonData: ChangeButtonProps[] = [
        { icon: withIconBackground(<FaRegFaceSmile />), title: "Про себя", category: 'self' },
        { icon: withIconBackground(<BsPeople />), title: "Для друзей и для коллег", category: 'friend' },
        { icon: withIconBackground(<TbHeartBroken />), title: "Для разбитого сердца", category: 'broken-heart' },
        { icon: withIconBackground(<TbHeart />), title: "Для любимого человека", category: 'lover' },
        { icon: withIconBackground(<RiHomeHeartLine />), title: "Для близких", category: 'relation' },
        // { icon: withIconBackground(<LuBaby />), title: "Про ребёнка", category: 'baby' },
        { icon: withIconBackground(<RiShieldStarLine />), title: "О герое или солдате", category: 'hero' },
        { icon: withIconBackground(<TbConfetti />), title: "Для поздравления", category: 'congrats' },
        { icon: withIconBackground(<BsMagic />), title: "Другое", category: 'others' },
    ];


    const [currentIndex, setCurrentIndex] = useState(0);
    const [questSelections, setQuestSelections] = useState<string[]>([]); // Хранит выбранные значения из quest
    const [currentQuestIndex, setCurrentQuestIndex] = useState(0); // Индекс текущего quest

    const categoryMap: Record<string, string> = {
        friend: "friend",
        "broken-heart": "broken-heart",
        love: "lover",
        relation: "family",
        baby: "baby",
        hero: "hero",
        congrats: "congrats",
        others: "others",
    };

    const lookup = selectedCategory
        ? categoryMap[selectedCategory] ?? selectedCategory
        : undefined;

    const found: QuestionCategory | undefined = lookup ? allQuestions.find((q) => q.category === lookup) : undefined;

    // Получаем текущий quest элемент
    const currentQuestItem: QuestItem | undefined = found?.form.quest?.[currentQuestIndex];

    // Получаем финальный выбранный parent (последний элемент в questSelections)
    // Это значение должно соответствовать parent в QuestionSet
    const finalParent = questSelections.length > 0 ? questSelections[questSelections.length - 1] : null;
    const getParentKey = (parent: string | null | undefined) => parent ?? "__root__";

    const questSelectionMap = useMemo(() => {
        if (questSelections.length === 0) {
            return {};
        }
        return questSelections.reduce<Record<string, string>>((acc, value, index) => {
            const parentKey = index === 0 ? "__root__" : questSelections[index - 1];
            acc[parentKey] = value;
            return acc;
        }, {});
    }, [questSelections]);

    const findQuestIndexByParent = useCallback(
        (parentValue: string | null | undefined) => {
            if (!found?.form.quest) return -1;
            return found.form.quest.findIndex((quest) => {
                if (parentValue === null || parentValue === undefined) {
                    return quest.parent === null || quest.parent === undefined;
                }
                return quest.parent === parentValue;
            });
        },
        [found]
    );

    const getNextQuestForValue = useCallback(
        (value: string | null) => {
            const index = findQuestIndexByParent(value);
            if (index < 0 || !found?.form.quest) {
                return undefined;
            }
            return { quest: found.form.quest[index], index };
        },
        [findQuestIndexByParent, found]
    );

    const patchTextScenario = useCallback(
        (updater: (draft: TextGenerationDraft) => TextGenerationDraft) => {
            updateGenerationScenario((scenario) => {
                const base =
                    scenario && scenario.mode === "scenario"
                        ? { ...scenario }
                        : createTextGenerationDraft();
                return updater(base);
            });
        },
        [updateGenerationScenario]
    );

    const syncAnswersFromStorage = useCallback(() => {
        if (!lookup) {
            patchTextScenario((draft) => ({
                ...draft,
                answers: [],
                summary: null,
            }));
            return;
        }

        const storedAnswers = qaStorage.getAnswers(lookup, finalParent);
        const questionCategory = allQuestions.find((q) => q.category === lookup);
        const questionSet = finalParent
            ? questionCategory?.form.questions.find((qs) => qs.parent === finalParent)
            : questionCategory?.form.questions.find((qs) => qs.parent === null);

        const answers: GenerationDraftAnswer[] = Object.entries(storedAnswers)
            .map(([key, value]) => {
                const id = Number(key);
                if (!Number.isFinite(id)) {
                    return null;
                }
                const questionSource = questionSet?.questions[id];
                const questionText = questionSource?.text ?? `Вопрос ${id + 1}`;
                return {
                    id,
                    question: questionText,
                    answer: value,
                };
            })
            .filter((entry): entry is GenerationDraftAnswer => Boolean(entry));

        const summary = answers
            .filter((answer) => answer.answer?.trim())
            .map((answer) => `${answer.question}: ${answer.answer}`)
            .join("\n");

        patchTextScenario((draft) => ({
            ...draft,
            answers,
            summary: summary.length > 0 ? summary : null,
        }));
    }, [patchTextScenario, lookup, finalParent]);

    useEffect(() => {
        if (step === 'questions' || step === 'results' || step === 'generation-params') {
            syncAnswersFromStorage();
        }
    }, [step, syncAnswersFromStorage]);

    // Показ напоминания о PRO после 3-го вопроса, если баланс пустой
    useEffect(() => {
        if (step === 'questions' && selectedCategory && currentIndex === 3 && hasEmptyBalance && !showProReminder && !skipClicked) {
            setShowProReminder(true);
        }
    }, [step, selectedCategory, currentIndex, hasEmptyBalance, showProReminder, skipClicked]);

    // Если баланс пополнился и мы на шаге pro-pay, возвращаемся к artist-params
    useEffect(() => {
        if (step === 'pro-pay' && !hasEmptyBalance && !isPro) {
            setStep('generation-params');
            setSkipClicked(false);
        }
    }, [step, hasEmptyBalance, isPro]);

    useEffect(() => {
        if (!lookup) {
            setQuestSelections([]);
            return;
        }
        const storedSelections = qaStorage.getQuestSelections(lookup);
        setQuestSelections(storedSelections);
    }, [lookup]);


    const handleNext = () => {
        // Получаем количество вопросов для проверки
        const questionCategory = lookup ? allQuestions.find((q) => q.category === lookup) : undefined;
        const questionSet = finalParent
            ? questionCategory?.form.questions.find((qs) => qs.parent === finalParent)
            : questionCategory?.form.questions.find((qs) => qs.parent === null);
        const totalQuestions = questionSet?.questions.length ?? 0;

        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((i) => i + 1);
        } else if (currentIndex === totalQuestions - 1) {
            // Если это последний вопрос, переходим к результатам
            setStep('results');
        }
        syncAnswersFromStorage();
    };

    const handleFinishResults = () => {
        syncAnswersFromStorage();
        setStep('generation-params');
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1);
            syncAnswersFromStorage();
            return;
        }

        if (questSelections.length === 0) {
            setStep('intro');
            syncAnswersFromStorage();
            return;
        }

        const prevSelections = questSelections.slice(0, -1);
        setQuestSelections(prevSelections);

        if (lookup) {
            qaStorage.saveQuestSelections(lookup, prevSelections);
            const candidateParent = prevSelections.length > 0 ? prevSelections[prevSelections.length - 1] : null;
            const nextQuestForCandidate = candidateParent ? getNextQuestForValue(candidateParent) : undefined;
            if (candidateParent && !nextQuestForCandidate) {
                qaStorage.saveFinalParent(lookup, candidateParent);
            } else {
                qaStorage.saveFinalParent(lookup, null);
            }
        }

        if (prevSelections.length === 0) {
            setStep('intro');
        } else {
            const previousValue = prevSelections[prevSelections.length - 1];
            const prevQuest = getNextQuestForValue(previousValue);
            if (prevQuest) {
                setCurrentQuestIndex(prevQuest.index);
                setStep('audience');
            } else {
                setStep('questions');
            }
        }
        syncAnswersFromStorage();
    };

    const handleCategorySelect = (category: ChangeButtonProps['category']) => {
        const mappedCategory = categoryMap[category] ?? category;
        setSelectedCategory(category);
        setCurrentIndex(0);
        setCurrentQuestIndex(0);
        setStep('intro');
        setShowProReminder(false);
        setSkipClicked(false);
        qaStorage.setSelectedUICategory(category);
        qaStorage.setActiveCategory(mappedCategory);
        const storedSelections = qaStorage.getQuestSelections(mappedCategory);
        setQuestSelections(storedSelections);
        patchTextScenario(() => ({
            ...createTextGenerationDraft(),
            category: mappedCategory,
        }));
    };

    const handleCloseDialog = () => {
        setShowProReminder(false);
    }

    const handleSkipReminder = () => {
        setShowProReminder(false);
        setSkipClicked(true);
    }

    const handleStartScenario = () => {
        if (!found?.form.quest || found.form.quest.length === 0) {
            setCurrentIndex(0);
            setStep('questions');
            return;
        }

        const firstQuestIndex = findQuestIndexByParent(null);
        if (questSelections.length === 0) {
            setCurrentQuestIndex(firstQuestIndex >= 0 ? firstQuestIndex : 0);
            setStep('audience');
            return;
        }

        const lastSelection = questSelections[questSelections.length - 1];
        const nextQuest = getNextQuestForValue(lastSelection);

        if (nextQuest) {
            setCurrentQuestIndex(nextQuest.index);
        } else {
            const parentOfLast =
                questSelections.length > 1 ? questSelections[questSelections.length - 2] : null;
            const currentQuest = findQuestIndexByParent(parentOfLast);
            setCurrentQuestIndex(currentQuest >= 0 ? currentQuest : firstQuestIndex >= 0 ? firstQuestIndex : 0);
        }
        setStep('audience');
    };

    const handleSelectAudience = (value: string) => {
        if (!lookup || !currentQuestItem) return;
        const parentValue = currentQuestItem.parent ?? null;
        const parentIndex = parentValue ? questSelections.indexOf(parentValue) : -1;
        const depthIndex = parentIndex + 1;
        const baseSelections = depthIndex > 0 ? questSelections.slice(0, depthIndex) : [];
        const updatedSelections = [...baseSelections, value];
        setQuestSelections(updatedSelections);
        qaStorage.saveQuestSelections(lookup, updatedSelections);
    };

    const handleAudienceContinue = () => {
        if (!lookup || !currentQuestItem) return;
        const parentKey = getParentKey(currentQuestItem.parent);
        const selectedValue = questSelectionMap[parentKey];
        if (!selectedValue) {
            return;
        }
        const nextQuest = getNextQuestForValue(selectedValue);
        if (nextQuest) {
            setCurrentQuestIndex(nextQuest.index);
            qaStorage.saveFinalParent(lookup, null);
            return;
        }
        qaStorage.saveFinalParent(lookup, selectedValue);
        setCurrentIndex(0);
        setStep('questions');
        setShowProReminder(false);
        patchTextScenario((draft) => ({
            ...draft,
            audience: selectedValue,
        }));
    };

    const handleAudienceBack = () => {
        if (!currentQuestItem) {
            setStep('intro');
            return;
        }
        const parentValue = currentQuestItem.parent ?? null;
        if (parentValue === null) {
            setStep('intro');
            return;
        }
        const parentIndex = questSelections.indexOf(parentValue);
        if (parentIndex === -1) {
            setStep('intro');
            return;
        }
        const trimmedSelections = questSelections.slice(0, parentIndex + 1);
        setQuestSelections(trimmedSelections);
        if (lookup) {
            qaStorage.saveQuestSelections(lookup, trimmedSelections);
            qaStorage.saveFinalParent(
                lookup,
                trimmedSelections.length > 0 ? trimmedSelections[trimmedSelections.length - 1] : null
            );
        }
        const previousParent =
            parentIndex <= 0 ? null : trimmedSelections[parentIndex - 1] ?? null;
        const prevQuestIndex = findQuestIndexByParent(previousParent);
        if (prevQuestIndex >= 0) {
            setCurrentQuestIndex(prevQuestIndex);
            return;
        }
        setStep('intro');
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCurrentIndex(0);
        setQuestSelections([]);
        setCurrentQuestIndex(0);
        setStep('category');
        setShowProReminder(false);
        setSkipClicked(false);
        qaStorage.setSelectedUICategory(null);
        qaStorage.setActiveCategory(null);
        patchTextScenario(() => createTextGenerationDraft());
    };

    if (isLoading) {
        return <TrackLoadingScreen />;
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {step === 'category' ? (
                    <MotionDiv
                        key="category-list"
                        initial={{ x: 0, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box py={6} color={COLOR.kit.orangeWhite}>
                            <Heading size="md" mb={4}>Выбери тему сценария</Heading>
                            <Grid gap={3}>
                                {buttonData.map((button) => (
                                    <GridItem key={button.title}>
                                        <ChangeButton
                                            icon={button.icon}
                                            title={button.title}
                                            category={button.category}
                                            onClick={() => handleCategorySelect(button.category)}
                                        />
                                    </GridItem>
                                ))}
                            </Grid>
                        </Box>
                    </MotionDiv>
                ) : step === 'intro' && selectedCategory ? (
                    <MotionDiv
                        key="scenario-intro"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box px={5} py={8} color={COLOR.kit.orangeWhite}>
                            <Heading size="lg" mb={3}>
                                {selectedCategory === 'self' && '🌿 Анкета «Про себя»'}
                                {selectedCategory === 'friend' && '🎓 Анкета «Для друзей и коллег»'}
                                {selectedCategory === 'broken-heart' && '💔 Анкета «Для разбитого сердца»'}
                                {selectedCategory === 'lover' && '💖 Анкета «Для любимого человека»'}
                                {selectedCategory === 'relation' && '👨‍👩‍👧‍👦 Анкета «Для близких»'}
                                {selectedCategory === 'baby' && '🍼 Анкета «Про ребёнка»'}
                                {selectedCategory === 'hero' && '🎖️ Анкета «О герое или солдате»'}
                                {selectedCategory === 'congrats' && '🎈 Анкета «Праздник и поздравление»'}
                                {selectedCategory === 'others' && '🧩 Анкета «Другое»'}
                            </Heading>
                            <Text fontSize="lg" color={COLOR.kit.smoke} mb={6}>
                                {selectedCategory === 'self' && 'Личная история, путь, характер, внутренний монолог.'}
                                {selectedCategory === 'friend' && 'Подарок другу, коллеге, наставнику или всей команде — с теплом и юмором.'}
                                {selectedCategory === 'broken-heart' && 'Песня-переосмысление после расставания — бережно, честно, со смыслом.'}
                                {selectedCategory === 'lover' && 'Признание в любви, годовщина, свадьба, романтика — всё, что от сердца.'}
                                {selectedCategory === 'relation' && 'Мама, папа, брат, сестра — семейная история в музыке.'}
                                {selectedCategory === 'baby' && 'Песня о малыше — от нежных колыбельных до выпускного из садика.'}
                                {selectedCategory === 'hero' && 'О тех, кто защищает и спасает — от врачей до спасателей.'}
                                {selectedCategory === 'congrats' && 'День рождения, юбилей, Новый год — яркий музыкальный подарок.'}
                                {selectedCategory === 'others' && 'Любая тема — проект, команда, событие, город, бренд, хобби.'}
                            </Text>
                            <Box
                                bg={COLOR.kit.gray}
                                borderRadius="2xl"
                                px={4}
                                py={3}
                                mb={8}
                                color={COLOR.kit.smoke}
                            >
                                Можно пропускать любые вопросы — просто переходите дальше.
                            </Box>
                            <Grid templateColumns="1fr 1fr" gap={3} w="full">
                                <GrayButton w="full" onClick={handleBackToCategories}>
                                    Назад к темам
                                </GrayButton>
                                
                            <BrandButton w="full" onClick={handleStartScenario}>
                                Начать
                            </BrandButton>
                            </Grid>
                        </Box>
                    </MotionDiv>
                ) : step === 'audience' && currentQuestItem ? (
                    <MotionDiv
                        key="scenario-audience"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box px={5} py={6} color={COLOR.kit.orangeWhite}>
                            <Heading size="md" mb={2}>{currentQuestItem.text}</Heading>
                            <Grid gap={3} templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }} mt={4}>
                                {currentQuestItem.options.map((option) => {
                                    const parentKey = getParentKey(currentQuestItem.parent);
                                    const selectedValue = questSelectionMap[parentKey];
                                    return (
                                        <OptionButton
                                            key={option.value}
                                            option={option}
                                            onClick={() => handleSelectAudience(option.value)}
                                            isSelected={selectedValue === option.value}
                                        />
                                    );
                                })}
                            </Grid>
                            <Grid mt={6} templateColumns="1fr 1fr" gap={3} w="full">
                                <GrayButton w="full" onClick={handleAudienceBack}>
                                    Назад
                                </GrayButton>
                                <BrandButton
                                    w="full"
                                    onClick={handleAudienceContinue}
                                    disabled={!questSelectionMap[getParentKey(currentQuestItem.parent)]}
                                >
                                    Далее
                                </BrandButton>

                            </Grid>


                        </Box>

                    </MotionDiv>
                ) : step === 'results' ? (
                    <MotionDiv
                        key="results-summary"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ResultsComponent onFinish={handleFinishResults} />
                    </MotionDiv>
                ) : step === 'generation-params' ? (
                    <MotionDiv
                        key="generation-params"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GenerationParamsAccordion
                            onBack={() => setStep('results')}
                            onCancel={handleBackToCategories}
                            onGenerate={() => {
                                // Если баланс пустой и пользователь не PRO, отправляем на оплату и блокируем генерацию
                                if (!isPro && hasEmptyBalance) {
                                    setStep('pro-pay');
                                    return false;
                                }
                                // Возвращаем undefined, чтобы GenerationParamsAccordion продолжил стандартный флоу генерации
                                return undefined;
                            }}
                            onLoadingStart={() => setIsLoading(true)}
                        />
                    </MotionDiv>
                ) : step === 'pro-pay' && !isPro ? (
                    <MotionDiv
                        key="pro-pay"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProPayScreen
                            onBack={() => {
                                setStep('generation-params');
                                setSkipClicked(false);
                            }}
                            onPay={() => navigate({ to: '/subscription', search: { tarrif: 'pro', source: 'propay' } })}
                        />
                    </MotionDiv>
                ) : (
                    <MotionDiv
                        key={'question-modal'}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {lookup && (
                            <QuestionModal
                                key={`${lookup}-${finalParent}-${currentIndex}`}
                                category={lookup}
                                parent={finalParent}
                                currentIndex={currentIndex}
                                onNext={handleNext}
                                onPrev={handlePrev}
                                onBackToCategories={handleBackToCategories}
                                onFinish={() => setStep('results')}
                            />
                        )}
                    </MotionDiv>
                )}

            </AnimatePresence>
            <DiaologWindow
                open={showProReminder}
                footer={(
                    <>
                        <Grid gridTemplateColumns={"1fr 1fr"} w={"full"}>
                            <GrayButton w='full' onClick={handleSkipReminder}>Пропустить</GrayButton>
                            <BrandButton w='full' onClick={() => navigate({ to: '/subscription', search: { tarrif: 'pro', source: 'propay' } })}>Купить PRO</BrandButton>
                        </Grid>
                    </>
                )}
                onOpenChange={handleCloseDialog}
            >
                <Box
                    borderRadius="2xl"
                    fontSize="md"
                >
                    <Text fontWeight="bolder" textAlign={"center"} letterSpacing={1} textTransform={"uppercase"} color={COLOR.kit.orange} fontSize={"lg"} mb={2}>
                        Гав! Напоминаю
                    </Text>
                    <Text fontSize={"20px"} color={COLOR.kit.orangeWhite} pb={3} pt={3}>Отличный старт!</Text>
                    <Text>
                        Трек по точным настройкам (жанр, настроение, сценарий) доступен в <b>PRO</b> — 990 ₽.
                    </Text>

                    <Text mt={1}>
                        В PRO включено 10 подробных треков — выгода составит <b>60%</b>.
                    </Text>
                </Box>
            </DiaologWindow>

        </>
    )
}