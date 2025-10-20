import { HStack, VStack } from "@chakra-ui/react";

type QuestionModalProps = {
    qNum: number;
    qText: string;
    qHolder: string;
};

export function QuestionModal({ qNum, qText, qHolder }: QuestionModalProps) {
  return (
    <>
        <VStack>
            <HStack>
                <div>{qNum}</div>
                <div>{qText}</div>
                <div>{qHolder}</div>
            </HStack>
        </VStack>
    </>
  )
}