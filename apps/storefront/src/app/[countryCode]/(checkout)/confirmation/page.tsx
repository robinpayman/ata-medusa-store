"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/Button"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="w-full bg-white min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. We're preparing your order.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8 text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">Order Number</span>
              <span className="font-medium text-gray-900">{orderId || "---"}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">Order Status</span>
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Confirmed
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Estimated Delivery</span>
              <span className="text-gray-900">3-5 business days</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                1
              </span>
              <span>Confirmation email will be sent to your inbox shortly</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                2
              </span>
              <span>We'll process your payment and prepare your order</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                3
              </span>
              <span>You'll receive a shipping confirmation with tracking</span>
            </li>
          </ol>
        </div>

        {/* Contact Information */}
        <div className="mb-8 text-center text-gray-600">
          <p className="mb-2">Questions about your order?</p>
          <p>
            <a href="mailto:support@atatreningsutstyr.no" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our support team
            </a>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </a>
          <a href="/" className="flex-1">
            <Button variant="primary" className="w-full">
              Back to Home
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
