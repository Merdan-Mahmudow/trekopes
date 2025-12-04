import { memo, useState } from "react"
import type { ReactNode } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import styles from "./Slider.module.css"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Box, Flex, VStack, Text, Heading, Badge } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { COLOR } from "../ui/colors"
import { BrandButton } from "../ui/button"

type SlideItem = {
    id: string
    badge?: string
    title: string
    description: string
    extendedDescription?: string
    content?: ReactNode
    image?: string
    onSubmit: () => void
}

type FMCarouselProps = {
    onSlideSubmit?: (slideId: string) => void
}

const slides: SlideItem[] = [
    {
        id: "1",
        badge: "ПЕСНЯ ПО АРТИСТУ",
        title: "Трек голосом популярного артиста",
        description: `«Выбери одного из популярных артистов, а Трекопёс подберёт звук, подачу и фирменные фишки стиля.
В итоге трек звучит так, будто любимый артист записал его по твоим мыслям 🐾`,
        image: "/slider-1.jpeg",
        onSubmit: () => {
            console.log("submit")
        }
    },
    {
        id: "2",
        badge: "ПЕСНЯ ПО СЦЕНАРИЮ",
        title: `Песня, которая знает \nо вас всё`,
        description: "Глубоко проработанные сценарии извлекают из ответов не только факты, но и настроение, внутренние шутки и ситуации. В в результате песня кажется невероятно личной и созданной специально для тебя!",
        image: "/slider-2.JPEG",
        onSubmit: () => {
            console.log("submit")
        }
    },
    {
        id: "3",
        badge: "МУЗЫКА И ДОБРО",
        title: "Твой хит спасает жизнь!",
        description: "Оформляя подписку, ты не просто качаешь свой аккаунт, ты наполняешь чью-то миску. Мы перечисляем до 30% выручки в собачьи приюты. Получай максимум функций и помогай хвостикам просто занимаясь творчеством ❤️",
        image: "/slider-3.PNG",
        onSubmit: () => {
            console.log("submit")
        }
    },
]

function FMCarouselComponent({ onSlideSubmit }: FMCarouselProps) {
    const [activeSlide, setActiveSlide] = useState<SlideItem | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const handleOpen = (slide: SlideItem) => {
        setActiveSlide(slide)
        setIsOpen(true)
    }
    const handleClose = () => {
        setIsOpen(false)
        setTimeout(() => {
            setActiveSlide(null)
        }, 500)
    }
    const handleSubmit = () => {
        if (activeSlide && onSlideSubmit) {
            onSlideSubmit(activeSlide.id)
        } else if (activeSlide) {
            activeSlide.onSubmit()
        }
        handleClose()
    }
    return (
        <section className={styles.scope}>
            <div className={styles.root}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    loop
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 10000, disableOnInteraction: false }}
                    speed={650}
                    className={styles.swiper}

                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id} onClick={() => handleOpen(slide)}>
                            <MotionArticle
                                as="article"
                                layoutId={`slide-${slide.id}`}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 35,
                                    mass: 0.8
                                }}
                                opacity={isOpen && activeSlide?.id === slide.id ? 0 : 1}
                                pointerEvents={isOpen && activeSlide?.id === slide.id ? "none" : "auto"}
                                width="90vw"
                                height={"250px"}
                                bg={slide.image ? "none" : "linear-gradient(180deg, rgba(20, 20, 25, 1) 0%, rgba(40, 30, 25, 1) 100%)"}
                                backgroundImage={slide.image ? `url(${slide.image})` : undefined}
                                backgroundSize="cover"
                                backgroundPosition="center"
                                backgroundRepeat="no-repeat"
                                borderRadius="20px"
                                cursor="pointer"
                                overflow="hidden"
                                position="relative"
                                willChange="transform, opacity"
                                backfaceVisibility="hidden"
                                transform="translateZ(0)"
                                boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
                            >
                                {/* Оверлей для изображений */}
                                {slide.image && (
                                    <Box
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                        zIndex={1}
                                    />
                                )}
                                {/* Эффект свечения */}
                                {!slide.image && (
                                    <Box
                                        position="absolute"
                                        top="20%"
                                        right="10%"
                                        width="200px"
                                        height="200px"
                                        borderRadius="50%"
                                        bg="rgba(255, 106, 0, 0.15)"
                                        filter="blur(60px)"
                                        zIndex={0}
                                    />
                                )}
                                {!slide.image && (
                                    <Box
                                        position="absolute"
                                        bottom="10%"
                                        left="15%"
                                        width="150px"
                                        height="150px"
                                        borderRadius="50%"
                                        bg="rgba(238, 9, 121, 0.2)"
                                        filter="blur(50px)"
                                        zIndex={0}
                                    />
                                )}

                                <VStack
                                    gap={{ base: 3, md: 4 }}
                                    alignItems="flex-start"
                                    justifyContent="flex-start"
                                    width="100%"
                                    height="100%"
                                    padding={{ base: "10px 10px", md: "10px 10px" }}
                                    position="relative"
                                    zIndex={2}
                                >
                                    {/* Бейдж и заголовок вверху */}
                                    <VStack
                                        gap={3}
                                        alignItems="flex-start"
                                        width="100%"
                                    >
                                        {slide.badge && (
                                            <Badge
                                                as="span"
                                                display="inline-flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                padding="6px 10px"
                                                borderRadius="full"
                                                bg={COLOR.kit.iconBg}
                                                fontSize={"xx-small"}
                                                fontWeight={700}
                                                letterSpacing="0.15em"
                                                textTransform="uppercase"
                                                color={COLOR.text.primary}
                                            >
                                                {slide.badge}
                                            </Badge>
                                        )}
                                        <Heading
                                            as="h3"
                                            fontSize={{ base: "clamp(18px, 4vw, 24px)", md: "clamp(24px, 5vw, 36px)" }}
                                            fontWeight={700}
                                            lineHeight="1.1"
                                            margin={0}
                                            color="#FFFFFF"
                                            textTransform="uppercase"
                                            textShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
                                            letterSpacing="-0.02em"
                                        >
                                            {slide.title}
                                        </Heading>
                                    </VStack>

                                    {/* Описание внизу с оверлеем */}
                                    <Box
                                        position="absolute"
                                        bottom={"10px"}
                                        left={"50%"}
                                        transform={"translateX(-50%)"}
                                        right={0}
                                        w={"97%"}
                                        padding={{ base: "10px", md: "10px" }}
                                        bg="rgba(0, 0, 0, 0.4)"
                                        backdropFilter="blur(2px)"
                                        borderRadius="15px"
                                    >
                                        <Text
                                            as="p"
                                            fontSize={{ base: "clamp(10px, 2.5vw, 16px)", md: "clamp(12px, 2.5vw, 16px)" }}
                                            lineHeight="1.4"
                                            color="rgba(255, 255, 255, 0.95)"
                                            margin={0}
                                            textAlign="left"
                                        >
                                            {slide.description}
                                        </Text>
                                    </Box>
                                </VStack>
                            </MotionArticle>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <DetailSlideItem
                slide={activeSlide!}
                open={isOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
            />
        </section>
    )
}

const FMCarousel = memo(FMCarouselComponent)

export default FMCarousel

const MotionVStack = motion(VStack)
const MotionBox = motion(Box)
const MotionArticle = motion(Box)

const DetailSlideItem = ({
    slide,
    open,
    onClose,
    onSubmit
}: {
    slide: SlideItem | null
    open: boolean
    onClose: () => void
    onSubmit: () => void
}) => {
    if (!slide) return null

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Затемнение фона */}
                    <MotionBox
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(0, 0, 0, 0.8)"
                        zIndex={999}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        onClick={onClose}
                        style={{ cursor: "pointer" }}
                    />

                    <Flex
                        justifyContent="center"
                        alignItems="center"
                    >
                        {/* Модальная карточка */}
                        <MotionBox
                            position="fixed"
                            width="90vw"
                            maxWidth="800px"
                            maxHeight="85vh"
                            bg={slide.image ? "none" : "linear-gradient(180deg, rgba(20, 20, 25, 1) 0%, rgba(40, 30, 25, 1) 100%)"}
                            backgroundImage={slide.image ? `url(${slide.image})` : undefined}
                            backgroundSize="cover"
                            backgroundPosition="center"
                            borderRadius="20px"
                            zIndex={1000}
                            layoutId={`slide-${slide.id}`}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 35,
                                mass: 0.8
                            }}
                            overflow="hidden"
                            boxShadow="0 20px 60px rgba(0, 0, 0, 0.7)"
                            onClick={onClose}
                            style={{ cursor: "pointer" }}
                        >
                            {/* Оверлей для изображений */}
                            {slide.image && (
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    background="linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%)"
                                    zIndex={1}
                                />
                            )}
                            {/* Эффект свечения для модального окна */}
                            {!slide.image && (
                                <>
                                    <Box
                                        position="absolute"
                                        top="10%"
                                        right="10%"
                                        width="300px"
                                        height="300px"
                                        borderRadius="50%"
                                        bg="rgba(255, 106, 0, 0.2)"
                                        filter="blur(80px)"
                                        zIndex={0}
                                    />
                                    <Box
                                        position="absolute"
                                        bottom="10%"
                                        left="15%"
                                        width="250px"
                                        height="250px"
                                        borderRadius="50%"
                                        bg="rgba(238, 9, 121, 0.25)"
                                        filter="blur(70px)"
                                        zIndex={0}
                                    />
                                </>
                            )}
                            <MotionVStack
                                height="100%"
                                minHeight="400px"
                                padding={{ base: "32px 20px", md: "40px 32px" }}
                                gap="24px"
                                alignItems="flex-start"
                                justifyContent="flex-start"
                                position="relative"
                                zIndex={2}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: 0.2,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ cursor: "default" }}
                            >
                                {slide.content ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.2,
                                            ease: [0.16, 1, 0.3, 1]
                                        }}
                                        style={{ width: "100%", height: "100%" }}
                                    >
                                        {slide.content}
                                    </motion.div>
                                ) : (
                                    <>
                                        {slide.badge && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.3,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                            >
                                                <Badge
                                                as="span"
                                                display="inline-flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                padding="6px 10px"
                                                borderRadius="full"
                                                bg={COLOR.kit.iconBg}
                                                fontSize={"xx-small"}
                                                fontWeight={700}
                                                letterSpacing="0.15em"
                                                textTransform="uppercase"
                                                color={COLOR.text.primary}
                                            >
                                                {slide.badge}
                                            </Badge>
                                            </motion.div>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.35,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                        >
                                            <Heading
                                                as="h2"
                                                fontSize={{ base: "clamp(24px, 5vw, 32px)", md: "clamp(32px, 6vw, 48px)" }}
                                                fontWeight={800}
                                                color="#FFFFFF"
                                                textAlign="left"
                                                lineHeight="1.1"
                                                textTransform="uppercase"
                                                textShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
                                                letterSpacing="-0.02em"
                                                margin={0}
                                            >
                                                {slide.title}
                                            </Heading>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.4,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                        >
                                            <Text
                                                fontSize={{ base: "clamp(14px, 3vw, 18px)", md: "clamp(16px, 3vw, 20px)" }}
                                                color="rgba(255, 255, 255, 0.95)"
                                                textAlign="left"
                                                lineHeight="1.5"
                                                margin={0}
                                            >
                                                {slide.description}
                                            </Text>
                                        </motion.div>
                                        <BrandButton 
                                        onClick={onSubmit}
                                        >
                                            Перейти
                                        </BrandButton>
                                        {slide.extendedDescription && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.5,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                                style={{
                                                    width: "100%",
                                                    marginTop: "8px",
                                                    paddingTop: "20px",
                                                    borderTop: "1px solid rgba(255, 255, 255, 0.15)"
                                                }}
                                            >
                                                <Text
                                                    fontSize={{ base: "clamp(13px, 2.5vw, 16px)", md: "clamp(14px, 2.5vw, 18px)" }}
                                                    color="rgba(255, 255, 255, 0.9)"
                                                    textAlign="left"
                                                    lineHeight="1.6"
                                                    margin={0}
                                                >
                                                    {slide.extendedDescription}
                                                </Text>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </MotionVStack>
                        </MotionBox>
                    </Flex>
                </>
            )}
        </AnimatePresence>
    )
}