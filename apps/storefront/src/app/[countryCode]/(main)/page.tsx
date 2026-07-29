import { Metadata } from "next"
import { Button } from "@/components/Button"

export const metadata: Metadata = {
  title: "ata treningsutstyr | Nettbutikk | For treningsstudio og privat",
  description:
    "Kvalitet, service og kompetanse siden 2014. Utstyr til din trening fra ata treningsutstyr.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Utstyr til din trening!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Treningsutstyr som gjør at du får mer ut av livet ditt. Kvalitet, service og kompetanse siden 2014
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Se Alle Produkter
              </Button>
              <Button variant="outline" size="lg">
                Les Mer Om Oss
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Kvalitet",
                description: "Profesjonelt utstyr som tåler hard bruk og gir resultater",
              },
              {
                title: "Service",
                description: "Dedikert kundeservice og rask support på alle spørsmål",
              },
              {
                title: "Kompetanse",
                description: "Ekspertråd fra erfarne trenere som bryr seg om ditt treningsresultat",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Populære Produkter
            </h2>
            <p className="text-lg text-gray-600">
              Oppdag våre mest solgte treningsutstyr
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder product cards */}
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Produktbilde</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    Eksempelprodukt {index + 1}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mb-4">
                    kr 2.999
                  </p>
                  <Button variant="primary" size="sm" className="w-full">
                    Legg til
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Få tips og tilbud
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Meld deg på vårt nyhetsbrev for eksklusiv tilgang til nye produkter og tilbud
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Din e-postadresse"
              className="flex-1 px-4 py-3 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">
              Meld deg på
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
