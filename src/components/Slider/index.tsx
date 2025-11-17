import { memo, useState } from "react"
import type { ReactNode } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import styles from "./Slider.module.css"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { COLOR } from "../ui/colors"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { Text } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"

type SlideItem = {
    id: string
    badge?: string
    title: string
    description: string
    extendedDescription?: string
    content?: ReactNode
}

const slides: SlideItem[] = [
    {
        id: "1",
        badge: "новое",
        title: "Песня под ваш сценарий",
        description: "Выберите историю, заполните короткую анкету — Трекопес соберёт эмоции и превратит их в готовый трек.",
        extendedDescription: "Наша нейросеть анализирует ваши ответы и создаёт уникальную композицию, которая точно передаёт настроение и атмосферу выбранного сценария. Каждый трек получается неповторимым и отражает ваши эмоции.",
    },
    {
        id: "2",
        badge: "фото → трек",
        title: "Музыка из фотографии",
        description: "Сфотографируйте кого-то, место или предмет. Нейросеть распознает настроение и напишет песню.",
        extendedDescription: "Загрузите фотографию, и искусственный интеллект определит цветовую палитру, эмоциональную атмосферу и ключевые элементы изображения. На основе этого анализа будет создана музыкальная композиция, идеально подходящая к вашему фото.",
    },
    {
        id: "3",
        badge: "в одно касание",
        title: "Трек по ссылке",
        description: "Отправьте ссылку на профиль — Трекопес изучит любимые темы и сделает персональный трек.",
        extendedDescription: "Система проанализирует контент по ссылке, выявит основные темы, интересы и стиль общения. На основе этих данных будет сгенерирована персонализированная композиция, которая отражает уникальность профиля.",
    },
    {
        id: "4",
        badge: "вдохновение",
        title: "Выберите стиль",
        description: "Поп, инди или синтвейв? Подберите референс — и получите песню с нужным звучанием.",
        extendedDescription: "Выберите из множества музыкальных стилей или загрузите референсный трек. Нейросеть воссоздаст характерное звучание выбранного направления, сохраняя при этом уникальность и оригинальность композиции.",
    },
    {
        id: "5",
        badge: "быстрый старт",
        title: "Готовый текст — готовый трек",
        description: "Вставьте текст, добавьте пару подсказок и получите за минуту демо-песню.",
        extendedDescription: "Просто вставьте ваш текст, и система автоматически определит ритм, настроение и структуру. Добавьте несколько подсказок о желаемом стиле, и через минуту вы получите полноценную демо-версию трека с вокалом и инструментальной частью.",
        content: <Text>
            
        </Text>
    },
]

function FMCarouselComponent() {
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
    return (
        <section className={styles.scope}>
            <div className={styles.root}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    loop
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4800, disableOnInteraction: false }}
                    speed={650}
                    className={styles.swiper}

                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id} onClick={() => handleOpen(slide)}>
                            <motion.article
                                className={styles.slide}
                                layoutId={`slide-${slide.id}`}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 35,
                                    mass: 0.8
                                }}
                                style={{
                                    opacity: isOpen && activeSlide?.id === slide.id ? 0 : 1,
                                    pointerEvents: isOpen && activeSlide?.id === slide.id ? "none" : "auto"
                                }}
                            >
                                <div className={styles.slideContent}>
                                    {slide.badge ? <span className={styles.badge}>{slide.badge}</span> : null}
                                    <h3 className={styles.title}>{slide.title}</h3>
                                    <p className={styles.description}>{slide.description}</p>
                                </div>
                            </motion.article>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <DetailSlideItem
                slide={activeSlide!}
                open={isOpen}
                onClose={handleClose}
            />
        </section>
    )
}

const FMCarousel = memo(FMCarouselComponent)

export default FMCarousel

const MotionVStack = motion(VStack)
const MotionBox = motion(Box)

const DetailSlideItem = ({
    slide,
    open,
    onClose
}: {
    slide: SlideItem | null
    open: boolean
    onClose: () => void
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
                            bg="linear-gradient(135deg, #ff6a00, #ee0979)"
                            borderRadius="16px"
                            zIndex={1000}
                            layoutId={`slide-${slide.id}`}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 35,
                                mass: 0.8
                            }}
                            className={styles.modalSlide}
                            onClick={onClose}
                            style={{ cursor: "pointer" }}
                        >
                            <MotionVStack
                                height="100%"
                                padding="32px 24px"
                                gap="20px"
                                alignItems="center"
                                justifyContent="center"
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
                                            <motion.span
                                                className={styles.badge}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.3,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                            >
                                                {slide.badge}
                                            </motion.span>
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
                                            <Text
                                                fontSize="clamp(24px, 5vw, 40px)"
                                                fontWeight="700"
                                                color={COLOR.text.primary}
                                                textAlign="center"
                                                lineHeight="1.2"
                                            >
                                                {slide.title}
                                            </Text>
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
                                                fontSize="clamp(16px, 3vw, 20px)"
                                                color="rgba(255, 255, 255, 0.92)"
                                                textAlign="center"
                                                lineHeight="1.4"
                                            >
                                                {slide.description}
                                            </Text>
                                        </motion.div>

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
                                                    marginTop: "16px",
                                                    paddingTop: "24px",
                                                    borderTop: "1px solid rgba(255, 255, 255, 0.2)"
                                                }}
                                            >
                                                <Text
                                                    fontSize="clamp(14px, 2.5vw, 18px)"
                                                    color="rgba(255, 255, 255, 0.85)"
                                                    textAlign="center"
                                                    lineHeight="1.5"
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