import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import { Grid } from '@chakra-ui/react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <Grid templateRows={"100px calc(100vh - 120px)"} gap={"5"}>
        <Header/>
        <Outlet/>
    </Grid>
  )
}
