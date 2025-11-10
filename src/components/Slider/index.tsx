import { memo } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import styles from "./Slider.module.css"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

type SlideItem = {
    id: string
    badge?: string
    title: string
    description: string
}

const slides: SlideItem[] = [
    {
        id: "story",
        badge: "новое",
        title: "Песня под ваш сценарий",
        description: "Выберите историю, заполните короткую анкету — Трекопес соберёт эмоции и превратит их в готовый трек.",
    },
    {
        id: "photo",
        badge: "фото → трек",
        title: "Музыка из фотографии",
        description: "Сфотографируйте кого-то, место или предмет. Нейросеть распознает настроение и напишет песню.",
    },
    {
        id: "link",
        badge: "в одно касание",
        title: "Трек по ссылке",
        description: "Отправьте ссылку на профиль — Трекопес изучит любимые темы и сделает персональный трек.",
    },
    {
        id: "style",
        badge: "вдохновение",
        title: "Выберите стиль",
        description: "Поп, инди или синтвейв? Подберите референс — и получите песню с нужным звучанием.",
    },
    {
        id: "fast",
        badge: "быстрый старт",
        title: "Готовый текст — готовый трек",
        description: "Вставьте текст, добавьте пару подсказок и получите за минуту демо-песню.",
    },
]

function FMCarouselComponent() {
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
                        <SwiperSlide key={slide.id}>
                            <article className={styles.slide}>
                                <div className={styles.slideContent}>
                                    {slide.badge ? <span className={styles.badge}>{slide.badge}</span> : null}
                                    <h3 className={styles.title}>{slide.title}</h3>
                                    <p className={styles.description}>{slide.description}</p>
                                </div>
                            </article>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
}

const FMCarousel = memo(FMCarouselComponent)

export default FMCarousel
