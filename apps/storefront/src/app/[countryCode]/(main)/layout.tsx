import { Metadata } from "next"
import HeaderWrapper from "@/components/HeaderWrapper"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "ata treningsutstyr",
  description: "Treningsutstyr av høy kvalitet siden 2014",
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <HeaderWrapper />
      {props.children}
      <Footer />
    </>
  )
}
