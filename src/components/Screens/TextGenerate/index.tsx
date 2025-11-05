import { COLOR } from '../../../components/ui/colors'
import { Box, Button, Flex, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import { useMemo, useState, type ReactNode } from 'react'
import { BsPeople, BsMagic } from 'react-icons/bs'
import { FaRegFaceSmile } from 'react-icons/fa6'
import { LuBaby } from 'react-icons/lu'
import { RiHomeHeartLine, RiShieldStarLine } from 'react-icons/ri'
import { TbHeartBroken, TbHeart, TbConfetti } from 'react-icons/tb'
import { AnimatePresence, motion } from "framer-motion";
import { QuestionModal } from "../../../components/QuestionModal";
import { questions as allQuestions } from "../../../components/ui/questions";
import { ResultsComponent } from '../../../routes/questionsFinish'
import { ArtistParams } from '../ArtistParams'
import { BrandButton, GrayButton } from '../../../components/ui/button'
import { DiaologWindow } from '../../../components/Dialog'
import { ProPayScreen } from '../ProPay'
import { useNavigate } from '@tanstack/react-router'
import { useIsPro } from '../../../store/user'
import { PiGenderFemale, PiGenderMale, PiGenderNeuter } from 'react-icons/pi'
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
            className={buttonStyle.className}
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

type GenderOption = {
    value: string,
    label: string,
    icon: ReactNode,
}

const genderButtonStyle = {
    ...buttonStyle,
    justifyContent: 'flex-start' as const,
}

type GenderButtonProps = {
    option: GenderOption,
    onClick: () => void,
    isSelected?: boolean,
}

const GenderButton = ({ option, onClick, isSelected }: GenderButtonProps) => (
    <Button
        justifyContent={genderButtonStyle.justifyContent}
        w={genderButtonStyle.w}
        h={genderButtonStyle.h}
        className={genderButtonStyle.className}
        fontSize={genderButtonStyle.fontSize}
        bg={isSelected ? COLOR.kit.smoke : genderButtonStyle.bg}
        boxShadow={genderButtonStyle.boxShadow}
        color={genderButtonStyle.color}
        rounded={genderButtonStyle.rounded}
        onClick={onClick}
        outline={"none"}
    >
        <Flex alignItems="center" gap={3}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="48px"
                h="48px"
                borderRadius="full"
                bg={COLOR.kit.iconBg}
            >
                {option.icon}
            </Box>
            <Text fontSize="lg">{option.label}</Text>
        </Flex>
    </Button>
)

type Step = 'intro' | 'gender' | 'category' | 'questions' | 'results' | 'artist-params'


// --- Конец компонента Итоги ответов ---
export function TextGenerateScreen() {
    const navigate = useNavigate()
    const [showProReminder, setShowProReminder] = useState(false);
    const [showProScreen, setShowProScreen] = useState(false);
    const isPro = useIsPro();
    const [step, setStep] = useState<Step>('intro');
    const [selectedGender, setSelectedGender] = useState<string | null>(null);

    const buttonData: ChangeButtonProps[] = [
        { icon: <FaRegFaceSmile style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Про себя", category: 'self' },
        { icon: <BsPeople style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Для друзей и для коллег", category: 'friend' },
        { icon: <TbHeartBroken style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Для разбитого сердца", category: 'broken-heart' },
        { icon: <TbHeart style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Для любимого человека", category: 'love' },
        { icon: <RiHomeHeartLine style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Для близких", category: 'relation' },
        { icon: <LuBaby style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Про ребёнка", category: 'baby' },
        { icon: <RiShieldStarLine style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "О герое или солдате", category: 'hero' },
        { icon: <TbConfetti style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Для поздравления", category: 'congrats' },
        { icon: <BsMagic style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />, title: "Другое", category: 'others' },
    ];

    const genderOptions: GenderOption[] = useMemo(() => ([
        { value: 'male', label: 'Мужчина', icon: <PiGenderMale size={24} /> },
        { value: 'female', label: 'Женщина', icon: <PiGenderFemale size={24} /> },
    ]), []);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

    // Показ напоминания о PRO после 3-го вопроса (один раз за сессию)
    if (step === 'questions' && selectedCategory && qList && currentIndex === 3 && !showProReminder) {
        const isPro = localStorage.getItem('is_pro') === 'true';
        const alreadyShown = localStorage.getItem('pro_reminder_shown') === 'true';
        if (!isPro && !alreadyShown) {
            setShowProReminder(true);
            localStorage.setItem('pro_reminder_shown', 'true');
        }
    }


    const handleNext = () => {
        if (qList && currentIndex < qList.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else if (qList && currentIndex === qList.length - 1) {
            // Если это последний вопрос, переходим к результатам
            setStep('results');
        }
    };

    const handleFinishResults = () => {
        setStep('artist-params');
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setCurrentIndex(0);
        setStep('questions');
        setShowProReminder(false);
    };
    const handleCloseDialog = () => {
        setShowProReminder(false)
    }

    const handleSelectGender = (gender: string) => {
        setSelectedGender(gender);
        setStep('category');
        setSelectedCategory(null);
        setCurrentIndex(0);
    }

    const handleResetToIntro = () => {
        setSelectedGender(null);
        setSelectedCategory(null);
        setCurrentIndex(0);
        setStep('intro');
    }

    const selectedGenderOption = useMemo(
        () => genderOptions.find((option) => option.value === selectedGender) ?? null,
        [genderOptions, selectedGender]
    );

    return (
        <>
            <AnimatePresence mode="wait">
                {step === 'intro' ? (
                    <MotionDiv
                        key="intro-screen"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box px={5} py={8} textAlign="center" color={COLOR.kit.orangeWhite}>
                            <Heading size="lg" mb={3}>Соберём историю для песни</Heading>
                            <Text fontSize="lg" color={COLOR.kit.smoke} mb={8}>
                                Ответь на несколько вопросов, чтобы Трекопёс написал персональный трек.
                            </Text>
                            <BrandButton w="full" onClick={() => setStep('gender')}>
                                Начать
                            </BrandButton>
                        </Box>
                    </MotionDiv>
                ) : step === 'gender' ? (
                    <MotionDiv
                        key="gender-select"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box px={5} py={6} color={COLOR.kit.orangeWhite}>
                            <Heading size="md" mb={2}>Кто станет героем трека?</Heading>
                            <Text fontSize="md" color={COLOR.kit.smoke} mb={6}>
                                Выбери подходящий вариант — так мы подстроим вопросы.
                            </Text>
                            <Grid gap={3}>
                                {genderOptions.map((option) => (
                                    <GenderButton
                                        key={option.value}
                                        option={option}
                                        isSelected={selectedGender === option.value}
                                        onClick={() => handleSelectGender(option.value)}
                                    />
                                ))}
                            </Grid>
                            <GrayButton mt={6} w="full" onClick={handleResetToIntro}>
                                Назад
                            </GrayButton>
                        </Box>
                    </MotionDiv>
                ) : step === 'category' ? (
                    <MotionDiv
                        key="category-list"
                        initial={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid pt={1} px={"5"} gap={"4px"} w={"full"}>
                            <Flex mb={4} justifyContent="space-between" alignItems="center">
                                <Text fontSize="sm" color={COLOR.kit.smoke} textTransform="uppercase" letterSpacing={1}>
                                    Пол: {selectedGenderOption?.label ?? 'Не указан'}
                                </Text>
                                <Button
                                    variant="ghost"
                                    color={COLOR.kit.orangeWhite}
                                    fontSize="sm"
                                    mt={1}
                                    onClick={() => setStep('gender')}
                                >
                                    Изменить
                                </Button>
                            </Flex>
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
                ) : step === 'artist-params' ? (
                    <MotionDiv
                        key="artist-params"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ArtistParams
                            onBack={() => setStep('results')}
                            onCancel={() => {
                                setSelectedCategory(null);
                                setStep('category');
                            }}
                            onGenerate={() => {
                                if (isPro) {
                                    setSelectedCategory(null);
                                    setStep('category');
                                }
                                else setShowProScreen(true)
                            }}
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
                                onBackToCategories={() => {
                                    setSelectedCategory(null);
                                    setStep('category');
                                }}
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
                            <GrayButton w='full' onClick={() => {setShowProReminder(false)}}>Пропустить</GrayButton>
                            <BrandButton w='full'>Купить PRO</BrandButton>
                        </Grid>
                    </>
                )}
                onOpenChange={handleCloseDialog}
            >
                <Box
                    borderRadius="md"
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
            {showProScreen && !isPro && (
                <ProPayScreen onBack={() => setShowProScreen(false)} onPay={() => navigate({ to: '/subscription', search: { tarrif: 'pro', source: 'propay' } })} />
            )}
        </>
    )
}