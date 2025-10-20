import { QuestionModal } from '../components/QuestionModal';
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod';
import { questions } from '../components/ui/questions';



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

    // выбирает список вопросов по переданной категории
    const selectedQuestions = () => {
        if (!params?.category) return null;

        // маппинг на ключи, которые используются в src/components/ui/questions.ts
        const categoryMap: Record<string, string> = {
            'friend': 'friends',
            'broken-heart': 'heart-crack',
            'love': 'lover',
            // остальные одно-ко-одному совпадают: self, relation, baby, hero, congrats, others
        };

        const lookup = categoryMap[params.category] ?? params.category;
        const found = questions.find(q => q.category === lookup);
        return found ? found.questions : null;
    }

    const qList = selectedQuestions();

    return (
      <>
        {qList && qList.length > 0 ? (
          <>
            {qList.map(q => (
              <QuestionModal key={q.qNum} qNum={q.qNum} qText={q.qText} qHolder={q.qHolder} />
            ))}
          </>
        ) : (
          <div>Вопросы не найдены для категории: {params?.category}</div>
        )}
      </>
    )
}
