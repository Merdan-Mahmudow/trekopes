import { QuestionModal } from '../components/QuestionModal';
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod';
import { questions } from '../components/ui/questions';
import { useState, useEffect } from 'react';

const questionSearchSchema = z.object({
    category: z.enum(['self', 'friend', 'broken-heart', 'love', 'relation', 'baby', 'hero', 'congrats', 'others']),
    // qcategory: z.enum(['me', 'friends', 'heart-crack', 'lover', 'relation', 'baby', 'hero', 'congrats', 'others']),
})

export const Route = createFileRoute('/question')({
  component: RouteComponent,
  validateSearch: (search) => {
    return questionSearchSchema.parse(search)
  }
})

function RouteComponent() {
    const params = Route.useSearch();

    // маппинг категорий (маршрут -> файл)
    const categoryMap: Record<string, string> = {
        'friend': 'friends',
        'broken-heart': 'heart-crack',
        'love': 'lover',
        // остальные совпадают: self, relation, baby, hero, congrats, others
    };

    const lookup = params?.category ? (categoryMap[params.category] ?? params.category) : undefined;
    const found = lookup ? questions.find(q => q.category === lookup) : undefined;
    const qList = found ? found.questions : null;

    // сохраняем выбранную категорию и тексты вопросов в localStorage,
    // чтобы итоговая страница могла отобразить сами вопросы
    useEffect(() => {
      try {
        if (lookup) {
          localStorage.setItem('qa_category', lookup);
        }
        if (qList) {
          const texts = qList.map(q => q.qText);
          localStorage.setItem('qa_questions', JSON.stringify(texts));
        }
      } catch {
        // ignore
      }
    }, [lookup, qList]);

    // --- состояние для текущего вопроса
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!qList || qList.length === 0) {
      return <div>Вопросы не найдены для категории: {params?.category}</div>
    }

    const currentQuestion = qList[currentIndex];

    const handleNext = () => {
      if (currentIndex < qList.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }

    const handlePrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }

    return (
      <>
        <QuestionModal
          key={currentQuestion.qNum}
          qNum={currentQuestion.qNum}
          qText={currentQuestion.qText}
          qHolder={currentQuestion.qHolder}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentIndex === 0}
          isLast={currentIndex === qList.length - 1}
        />
      </>
    )
}
