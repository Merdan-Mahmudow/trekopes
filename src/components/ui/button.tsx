import { Button } from "@chakra-ui/react";
import { COLOR } from "./colors";

interface BrandButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs" | undefined;
    disabled?: boolean
    w?: string
}

export function BrandButton({ onClick, children, size, w, disabled = false }: BrandButtonProps) {
    return (
    <Button
    bg={COLOR.kit.iconBg}
    onClick={onClick}
    size={size}
    h={"66px"}
    w={w}
    minW={"150px"}
    rounded={"3xl"}
    padding={"16px"}
    color={"white"}
    fontSize={"16px"}
    disabled={disabled}
    >
        {children}
    </Button>)
}

export function GrayButton({ onClick, children, size, disabled = false }: BrandButtonProps) {
    return (
    <Button
    bg={COLOR.kit.darkGray}
    onClick={onClick}
    size={size}
    h={"66px"}
    rounded={"3xl"}
    padding={"16px"}
    color={"white"}
    fontSize={"16px"}
    disabled={disabled}
    >
        {children}
    </Button>)
}