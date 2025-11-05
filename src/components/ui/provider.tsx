"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      {/* Автоопределение темы с резервом на тёмную */}
      <ColorModeProvider 
        {...props} 
        forcedTheme={undefined} 
        enableSystem={true}
        attribute="class"
        defaultTheme="dark"
        storageKey="trekopes-color-mode"
      />
    </ChakraProvider>
  )
}
