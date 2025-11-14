import { QuestionModal } from '../components/QuestionModal';
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod';
import { useState } from 'react';

const questionSearchSchema = z.object({
    category: z.string(),
    parent: z.string().nullable().optional(),
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
        'friend': 'friend',
        'broken-heart': 'broken-heart',
        'love': 'lover',
        'relation': 'family',
        'baby': 'baby',
        'hero': 'hero',
        'congrats': 'congrats',
        'others': 'others',
    };

    const lookup = params?.category ? (categoryMap[params.category] ?? params.category) : undefined;
    const parent = params?.parent ?? null;
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
      setCurrentIndex((i) => i + 1);
    }

    const handlePrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }

    if (!lookup) {
      return <div>Категория не указана</div>
    }

    return (
      <QuestionModal
        key={currentIndex}
        category={lookup}
        parent={parent}
        currentIndex={currentIndex}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    )
}
