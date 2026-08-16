import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Noe gikk galt",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Siden ble ikke funnet</h1>
      <p className="text-small-regular text-ui-fg-base">
        Siden du prøvde å besøke finnes ikke.
      </p>
      <InteractiveLink href="/">Gå til forsiden</InteractiveLink>
    </div>
  )
}
