import { Button, type ButtonProps } from "@chakra-ui/react";
import { COLOR } from "./colors";

interface BrandButtonProps extends Omit<ButtonProps, "bg" | "color"> {
    onClick?: () => void;
    children?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs" | undefined;
    disabled?: boolean
    w?: string | { base?: string; sm?: string; md?: string; lg?: string }
    color?: string
    bg?: string
    h?: string | number | { base?: string | number; sm?: string | number; md?: string | number; lg?: string | number }
}

export function BrandButton({ 
    onClick, 
    children, 
    size, 
    w, 
    disabled = false, 
    color = "white", 
    bg = COLOR.kit.iconBg, 
    h = { base: "44px", md: "66px" },
    ...props 
}: BrandButtonProps) {
    return (
        <Button
            bg={bg}
            onClick={onClick}
            size={size}
            h={h}
            w={w}
            minW={{ base: "120px", md: "150px" }}
            minH={{ base: "44px", md: "66px" }}
            rounded={"3xl"}
            padding={{ base: "12px", md: "16px" }}
            color={color}
            fontSize={{ base: "0.9375rem", md: "1rem" }}
            disabled={disabled}
            transition="all 0.2s ease"
            _hover={{
                transform: { base: "none", md: "translateY(-1px)" },
            }}
            _active={{
                transform: "translateY(0)",
            }}
            _focusVisible={{
                outline: "2px solid",
                outlineColor: "rgba(243, 146, 4, 0.8)",
                outlineOffset: "2px",
            }}
            {...props}
        >
            {children}
        </Button>
    )
}

export function GrayButton({ 
    onClick, 
    children, 
    size, 
    w,
    disabled = false, 
    color = "white", 
    bg = COLOR.kit.darkGray,
    h = { base: "44px", md: "66px" },
    ...props 
}: BrandButtonProps) {
    return (
        <Button
            bg={bg}
            onClick={onClick}
            size={size}
            h={h}
            w={w}
            minW={{ base: "120px", md: "150px" }}
            minH={{ base: "44px", md: "66px" }}
            rounded={"3xl"}
            padding={{ base: "12px", md: "16px" }}
            color={color}
            fontSize={{ base: "0.9375rem", md: "1rem" }}
            disabled={disabled}
            transition="all 0.2s ease"
            _hover={{
                transform: { base: "none", md: "translateY(-1px)" },
                bg: "rgba(45, 44, 44, 1)",
            }}
            _active={{
                transform: "translateY(0)",
            }}
            _focusVisible={{
                outline: "2px solid",
                outlineColor: "rgba(243, 146, 4, 0.8)",
                outlineOffset: "2px",
            }}
            {...props}
        >
            {children}
        </Button>
    )
}