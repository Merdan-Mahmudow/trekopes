import { Button } from "@chakra-ui/react";
import { COLOR } from "./colors";

interface BrandButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs" | undefined;
    disabled?: boolean
    w?: string
    color?: string
    bg?: string
    h?: string | number
}

export function BrandButton({ onClick, children, size, w, disabled = false, color = "white", bg = COLOR.kit.iconBg, h = "66px" }: BrandButtonProps) {
    return (
    <Button
    bg={bg}
    onClick={onClick}
    size={size}
    h={h}
    w={w}
    minW={"150px"}
    rounded={"3xl"}
    padding={"16px"}
    color={color}
    fontSize={"16px"}
    disabled={disabled}
    >
        {children}
    </Button>)
}

export function GrayButton({ onClick, children, size, disabled = false, color = "white", bg = COLOR.kit.darkGray }: BrandButtonProps) {
    return (
    <Button
    bg={bg}
    onClick={onClick}
    size={size}
    h={"66px"}
    rounded={"3xl"}
    padding={"16px"}
    color={color}
    fontSize={"16px"}
    disabled={disabled}
    >
        {children}
    </Button>)
}