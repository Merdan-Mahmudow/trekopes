import { COLOR } from '../../../components/ui/colors'
import { Button, Grid, GridItem, Dialog, Portal, CloseButton } from '@chakra-ui/react'
import { useState } from 'react'
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


// --- Конец компонента Итоги ответов ---
export function TextGenerateScreen() {
    const [showResults, setShowResults] = useState(false);
    const [showArtistParams, setShowArtistParams] = useState(false);
    const [showProReminder, setShowProReminder] = useState(false);

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
    if (selectedCategory && qList && currentIndex === 3 && !showProReminder) {
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
            setShowResults(true);
        }
    };

    const handleFinishResults = () => {
        setShowArtistParams(true);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {!selectedCategory ? (
                    // 1. Экран выбора категории
                    (<MotionDiv
                        key="category-list"
                        initial={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid pt={1} px={"5"} gap={"4px"} w={"full"}>
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
                    </MotionDiv>)
                ) : showArtistParams ? (
                    // 3. Экран выбора артиста и параметров
                    (<MotionDiv
                        key="artist-params"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ArtistParams
                            onBack={() => setShowArtistParams(false)}
                            onCancel={() => setSelectedCategory(null)}
                            onGenerate={() => setSelectedCategory(null)}
                        />
                    </MotionDiv>)
                ) : showResults ? (
                    // 2. Экран итоговых ответов
                    (<MotionDiv
                        key="results-summary"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ResultsComponent onFinish={handleFinishResults} />
                    </MotionDiv>)
                ) : (
                    // 1.5. Экран вопросов
                    (<MotionDiv
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
                                // Изменено: isLast теперь приводит к переходу на экран итогов
                                onBackToCategories={() => setSelectedCategory(null)}
                                onFinish={() => setShowResults(true)}
                            />
                        )
                        }
                    </MotionDiv>)
                )}
                    <Dialog.Root open={showProReminder}>
                        <Portal>
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                                <Dialog.Content>
                                    <Dialog.Header>
                                        <Dialog.Title></Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                        
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                        <Dialog.ActionTrigger asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </Dialog.ActionTrigger>
                                        <Button>Save</Button>
                                    </Dialog.Footer>
                                    <Dialog.CloseTrigger asChild>
                                        <CloseButton size="sm" />
                                    </Dialog.CloseTrigger>
                                </Dialog.Content>
                            </Dialog.Positioner>
                        </Portal>
                    </Dialog.Root>
            </AnimatePresence>
        </>
    )
}