import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/referral')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/referral"!</div>
}
