"use client"

import React from "react"
import Link from "next/link"

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-lg mb-4">ata treningsutstyr</h3>
            <p className="text-gray-400 text-sm">
              Kvalitet, service og kompetanse siden 2014
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Nettbutikk</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/produkter" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Alle Produkter
                </Link>
              </li>
              <li>
                <Link href="/kategorier" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Kategorier
                </Link>
              </li>
              <li>
                <Link href="/tilbud" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Tilbud
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Bedrift</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/om-oss" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Om Oss
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/blogg" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Blogg
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Nye Vakås vei 6</li>
              <li>1450 Nesoddtangen, Norge</li>
              <li className="pt-2">
                <a href="tel:+4732828400" className="hover:text-white transition-colors duration-200">
                  +47 32 82 84 00
                </a>
              </li>
              <li>
                <a href="mailto:post@atatreningsutstyr.no" className="hover:text-white transition-colors duration-200">
                  post@atatreningsutstyr.no
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bottom Links */}
            <div className="flex gap-6 text-sm">
              <Link href="/personvern" className="text-gray-400 hover:text-white transition-colors duration-200">
                Personvern
              </Link>
              <Link href="/vilkar" className="text-gray-400 hover:text-white transition-colors duration-200">
                Vilkår
              </Link>
              <Link href="/retur" className="text-gray-400 hover:text-white transition-colors duration-200">
                Retur
              </Link>
            </div>

            {/* Copyright */}
            <div className="md:text-right text-gray-400 text-sm">
              © {currentYear} ata treningsutstyr. Alle rettigheter forbeholdt.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
