import { Button } from "@chakra-ui/react";

interface BrandButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs" | undefined;

}

export function BrandButton({ onClick, children, size }: BrandButtonProps) {
    return (
    <Button
    bg={"linear-gradient(215.54deg, #ED8F02 10.1%, #F26100 89.06%)"}
    onClick={onClick}
    size={size}
    rounded={"2xl"}
    padding={"16px"}
    color={"white"}
    fontSize={"16px"}
    >
        {children}Далее →
    </Button>)
}