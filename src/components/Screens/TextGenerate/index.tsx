import { COLOR } from '../../../components/ui/colors'
import { Box, Button, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { BsPeople, BsMagic } from 'react-icons/bs'
import { FaRegFaceSmile } from 'react-icons/fa6'
import { LuBaby } from 'react-icons/lu'
import { RiHomeHeartLine, RiShieldStarLine } from 'react-icons/ri'
import { TbHeartBroken, TbHeart, TbConfetti } from 'react-icons/tb'
import { AnimatePresence, motion } from "framer-motion";
import { QuestionModal } from "../../../components/QuestionModal";
import { questions as allQuestions } from "../../../components/ui/questions";
import { ResultsComponent } from '../../../routes/questionsFinish'
import { GenerationParamsAccordion } from '../GenerationParamsAccordion'
import { BrandButton, GrayButton } from '../../../components/ui/button'
import { DiaologWindow } from '../../../components/Dialog'
import { ProPayScreen } from '../ProPay'
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
    category: 'self' | 'friend' | 'broken-heart' | 'love' | 'relation' | 'baby' | 'hero' | 'congrats' | 'others',
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

type ScenarioOption = {
    value: string,
    label: string,
}

type ScenarioConfig = {
    title: string,
    subtitle: string,
    instruction: string,
    question: string,
    options: ScenarioOption[],
}

const optionButtonStyle = {
    ...buttonStyle,
    justifyContent: 'center' as const,
}

type OptionButtonProps = {
    option: ScenarioOption,
    onClick: () => void,
}

const OptionButton = ({ option, onClick }: OptionButtonProps) => (
    <Button
        justifyContent={optionButtonStyle.justifyContent}
        w={optionButtonStyle.w}
        h={optionButtonStyle.h}
        className={optionButtonStyle.className}
        fontSize={optionButtonStyle.fontSize}
        bg={optionButtonStyle.bg}
        boxShadow={optionButtonStyle.boxShadow}
        color={optionButtonStyle.color}
        rounded={optionButtonStyle.rounded}
        onClick={onClick}
        outline={"none"}
    >
        {option.label}
    </Button>
)

type Step = 'category' | 'intro' | 'audience' | 'questions' | 'results' | 'generation-params' | 'pro-pay'

const SCENARIO_CONFIGS: Record<ChangeButtonProps['category'], ScenarioConfig> = {
    'broken-heart': {
        title: '💔 Анкета «Для разбитого сердца»',
        subtitle: 'Песня-переосмысление после расставания — бережно, честно, со смыслом.',
        instruction: 'Можно пропускать любые вопросы — просто переходите дальше.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'ex-male', label: '🧔 Бывшему' },
            { value: 'ex-female', label: '👩 Бывшей' },
        ],
    },
    love: {
        title: '💖 Анкета «Для любимого человека»',
        subtitle: 'Признание в любви, годовщина, свадьба, романтика — всё, что от сердца.',
        instruction: 'Любой пункт можно пропустить.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'lover-male', label: '🧑 Любимому' },
            { value: 'lover-female', label: '👩 Любимой' },
        ],
    },
    self: {
        title: '🌿 Анкета «Про себя»',
        subtitle: 'Личная история, путь, характер, внутренний монолог.',
        instruction: 'Отвечайте выборочно — пропуски допустимы.',
        question: 'Выберите пол:',
        options: [
            { value: 'self-male', label: '🧑 Мужской' },
            { value: 'self-female', label: '👩 Женский' },
        ],
    },
    baby: {
        title: '🍼 Анкета «Про ребёнка»',
        subtitle: 'Песня о малыше — от нежных колыбельных до выпускного из садика.',
        instruction: 'Можно отвечать не на всё.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'baby-boy', label: '🧒 Мальчик' },
            { value: 'baby-girl', label: '👧 Девочка' },
        ],
    },
    friend: {
        title: '🎓 Анкета «Для друзей и коллег»',
        subtitle: 'Подарок другу, коллеге, наставнику или всей команде — с теплом и юмором.',
        instruction: 'Пропуски разрешены.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'friend-male', label: '🧑 Мужчине' },
            { value: 'friend-female', label: '👩 Женщине' },
        ],
    },
    relation: {
        title: '👨‍👩‍👧‍👦 Анкета «Для близких»',
        subtitle: 'Мама, папа, брат, сестра — семейная история в музыке.',
        instruction: 'Отвечайте как удобно — можно пропускать.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'family-male', label: '🧔 Мужчине' },
            { value: 'family-female', label: '👩 Женщине' },
        ],
    },
    hero: {
        title: '🎖️ Анкета «О герое или солдате»',
        subtitle: 'О тех, кто защищает и спасает — от врачей до спасателей.',
        instruction: 'Любые вопросы можно пропускать.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'hero-male', label: '🧑‍🚒 Мужчине' },
            { value: 'hero-female', label: '👩‍⚕️ Женщине' },
        ],
    },
    congrats: {
        title: '🎈 Анкета «Праздник и поздравление»',
        subtitle: 'День рождения, юбилей, Новый год — яркий музыкальный подарок.',
        instruction: 'Заполняйте частично — это нормально.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'congrats-male', label: '🧑 Мужчине' },
            { value: 'congrats-female', label: '👩 Женщине' },
        ],
    },
    others: {
        title: '🧩 Анкета «Другое»',
        subtitle: 'Любая тема — проект, команда, событие, город, бренд, хобби.',
        instruction: 'Можно пропустить любой пункт.',
        question: 'Кому посвящается песня?',
        options: [
            { value: 'other-male', label: '🧑 Мужчине' },
            { value: 'other-female', label: '👩 Женщине' },
        ],
    },
}


// --- Конец компонента Итоги ответов ---
export function TextGenerateScreen() {
    const navigate = useNavigate()
    const [showProReminder, setShowProReminder] = useState(false);
    const [skipClicked, setSkipClicked] = useState(false);
    const isPro = useIsPro();
    const user = useUser();
    const scenarioState = useGenerationScenario();
    const [step, setStep] = useState<Step>('category');
    const [selectedCategory, setSelectedCategory] = useState<ChangeButtonProps['category'] | null>(null);
    
    // showProReminder должен быть true только если у пользователя пустой баланс
    const hasEmptyBalance = user.limit === 0;

    useEffect(() => {
        if (!scenarioState || scenarioState.mode !== "text") {
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
        { icon: withIconBackground(<TbHeart />), title: "Для любимого человека", category: 'love' },
        { icon: withIconBackground(<RiHomeHeartLine />), title: "Для близких", category: 'relation' },
        { icon: withIconBackground(<LuBaby />), title: "Про ребёнка", category: 'baby' },
        { icon: withIconBackground(<RiShieldStarLine />), title: "О герое или солдате", category: 'hero' },
        { icon: withIconBackground(<TbConfetti />), title: "Для поздравления", category: 'congrats' },
        { icon: withIconBackground(<BsMagic />), title: "Другое", category: 'others' },
    ];

    const scenarioConfig = selectedCategory ? SCENARIO_CONFIGS[selectedCategory] : null;

    const [currentIndex, setCurrentIndex] = useState(0);

    const categoryMap: Record<string, string> = {
        friend: "friends",
        "broken-heart": "heart-crack",
        love: "lover",
    };

    const lookup = selectedCategory
        ? categoryMap[selectedCategory] ?? selectedCategory
        : undefined;

    const found = lookup ? allQuestions.find((q) => q.category === lookup) : undefined;
    const qList = found ? found.questions : null;
    const currentQuestion = qList?.[currentIndex];

    const patchTextScenario = useCallback(
        (updater: (draft: TextGenerationDraft) => TextGenerationDraft) => {
            updateGenerationScenario((scenario) => {
                const base =
                    scenario && scenario.mode === "text"
                        ? { ...scenario }
                        : createTextGenerationDraft();
                return updater(base);
            });
        },
        [updateGenerationScenario]
    );

    const syncAnswersFromStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem("qa_answers");
            const parsed: Record<string, string> = raw ? JSON.parse(raw) : {};

            const answers: GenerationDraftAnswer[] = Object.entries(parsed)
                .map(([key, value]) => {
                    const id = Number(key);
                    if (!Number.isFinite(id)) {
                        return null;
                    }
                    const questionSource = qList?.find((question) => question.qNum === id);
                    const questionText = questionSource?.qText ?? `Вопрос ${id}`;
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
        } catch {
            patchTextScenario((draft) => ({
                ...draft,
                answers: [],
                summary: null,
            }));
        }
    }, [patchTextScenario, qList]);

    useEffect(() => {
        if (step === 'questions' || step === 'results' || step === 'generation-params') {
            syncAnswersFromStorage();
        }
    }, [step, syncAnswersFromStorage]);

    // Показ напоминания о PRO после 3-го вопроса, если баланс пустой
    useEffect(() => {
        if (step === 'questions' && selectedCategory && qList && currentIndex === 3 && hasEmptyBalance && !showProReminder && !skipClicked) {
            setShowProReminder(true);
        }
    }, [step, selectedCategory, qList, currentIndex, hasEmptyBalance, showProReminder, skipClicked]);
    
    // Если баланс пополнился и мы на шаге pro-pay, возвращаемся к artist-params
    useEffect(() => {
        if (step === 'pro-pay' && !hasEmptyBalance && !isPro) {
            setStep('generation-params');
            setSkipClicked(false);
        }
    }, [step, hasEmptyBalance, isPro]);


    const handleNext = () => {
        if (qList && currentIndex < qList.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else if (qList && currentIndex === qList.length - 1) {
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
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
        syncAnswersFromStorage();
    };

    const handleCategorySelect = (category: ChangeButtonProps['category']) => {
        setSelectedCategory(category);
        setCurrentIndex(0);
        setStep('intro');
        setShowProReminder(false);
        setSkipClicked(false); // Сбрасываем состояние при выборе новой категории
        const mappedCategory = categoryMap[category] ?? category;
        try {
            localStorage.setItem('qa_category', mappedCategory);
            localStorage.removeItem('qa_answers');
        } catch {
            // ignore storage errors
        }
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
        setStep('audience');
    }

    const handleSelectAudience = (value: string) => {
        setCurrentIndex(0);
        setStep('questions');
        setShowProReminder(false);
        patchTextScenario((draft) => ({
            ...draft,
            audience: value,
        }));
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCurrentIndex(0);
        setStep('category');
        setShowProReminder(false);
        setSkipClicked(false); // Сбрасываем состояние при возврате к категориям
        try {
            localStorage.removeItem('qa_answers');
            localStorage.removeItem('qa_category');
        } catch {
            // ignore
        }
        patchTextScenario(() => createTextGenerationDraft());
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {step === 'category' ? (
                    <MotionDiv
                        key="category-list"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
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
                ) : step === 'intro' && scenarioConfig ? (
                    <MotionDiv
                        key="scenario-intro"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box px={5} py={8} color={COLOR.kit.orangeWhite}>
                            <Heading size="lg" mb={3}>{scenarioConfig.title}</Heading>
                            <Text fontSize="lg" color={COLOR.kit.smoke} mb={6}>
                                {scenarioConfig.subtitle}
                            </Text>
                            <Box
                                bg={COLOR.kit.gray}
                                borderRadius="2xl"
                                px={4}
                                py={3}
                                mb={8}
                                color={COLOR.kit.smoke}
                            >
                                {scenarioConfig.instruction}
                            </Box>
                            <BrandButton w="full" mb={4} onClick={handleStartScenario}>
                                Начать
                            </BrandButton>
                            <GrayButton w="full" onClick={handleBackToCategories}>
                                Назад к темам
                            </GrayButton>
                        </Box>
                    </MotionDiv>
                ) : step === 'audience' && scenarioConfig ? (
                    <MotionDiv
                        key="scenario-audience"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box px={5} py={6} color={COLOR.kit.orangeWhite}>
                            <Heading size="md" mb={2}>{scenarioConfig.question}</Heading>
                            <Grid gap={3} templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }} mt={4}>
                                {scenarioConfig.options.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        option={option}
                                        onClick={() => handleSelectAudience(option.value)}
                                    />
                                ))}
                            </Grid>
                            <GrayButton mt={6} w="full" onClick={() => setStep('intro')}>
                                Назад
                            </GrayButton>
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
                            onGenerate={async () => {
                                // Если баланс пустой и пользователь не PRO, переходим на экран оплаты после нажатия "Утвердить"
                                if (!isPro && hasEmptyBalance) {
                                    // Переходим на экран оплаты после нажатия кнопки "Сгенерировать"
                                    setStep('pro-pay');
                                    return false; // Блокируем генерацию
                                }
                                return true; // Продолжаем генерацию если баланс есть
                            }}
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
                        {qList && currentQuestion && (
                            <QuestionModal
                                key={currentQuestion.qNum}
                                qNum={currentQuestion.qNum}
                                qText={currentQuestion.qText}
                                qHolder={currentQuestion.qHolder}
                                onNext={handleNext}
                                onPrev={handlePrev}
                                isFirst={currentIndex === 0}
                                isLast={currentIndex === qList.length - 1}
                                onBackToCategories={handleBackToCategories}
                                onFinish={() => setStep('results')}
                            />
                        )
                        }
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