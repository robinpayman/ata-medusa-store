import { beforeEach, describe, expect, it, vi } from "vitest"

// `@/lib/medusa-client` throws at import time if its required env vars
// aren't set, and is a singleton SDK instance we don't want making real
// network calls in a unit test. Mocking the whole module sidesteps both:
// the mock factory replaces it before anything ever tries to construct
// the real client.
vi.mock("@/lib/medusa-client", () => ({
  default: {
    store: {
      cart: {
        create: vi.fn(),
        retrieve: vi.fn(),
        update: vi.fn(),
        createLineItem: vi.fn(),
        updateLineItem: vi.fn(),
        deleteLineItem: vi.fn(),
      },
      fulfillment: {
        listCartOptions: vi.fn(),
      },
    },
  },
}))

import medusaClient from "@/lib/medusa-client"
import {
  addToCart,
  clearCartId,
  getCart,
  getCartId,
  getOrCreateCart,
  getShippingMethods,
  removeFromCart,
  updateCart,
  updateLineItem,
} from "./cart"

const mockCartClient = medusaClient.store.cart as unknown as {
  create: ReturnType<typeof vi.fn>
  retrieve: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  createLineItem: ReturnType<typeof vi.fn>
  updateLineItem: ReturnType<typeof vi.fn>
  deleteLineItem: ReturnType<typeof vi.fn>
}

const CART_ID_STORAGE_KEY = "medusa_cart_id"

/** A minimal fake cart, standing in for Medusa's real StoreCart shape. */
function fakeCart(overrides: Record<string, unknown> = {}) {
  return {
    id: "cart_123",
    items: [],
    region_id: "reg_no",
    total: 0,
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe("getOrCreateCart", () => {
  it("creates a new cart and stores its id when none is cached", async () => {
    const cart = fakeCart({ id: "cart_new" })
    mockCartClient.create.mockResolvedValue({ cart })

    const result = await getOrCreateCart("reg_no")

    expect(mockCartClient.create).toHaveBeenCalledWith({ region_id: "reg_no" })
    // The response must be unwrapped: callers read `.id` directly on the
    // return value, not `.cart.id`.
    expect(result).toEqual(cart)
    expect(localStorage.getItem(CART_ID_STORAGE_KEY)).toBe("cart_new")
  })

  it("omits region_id from the request when none is given", async () => {
    mockCartClient.create.mockResolvedValue({ cart: fakeCart() })

    await getOrCreateCart()

    expect(mockCartClient.create).toHaveBeenCalledWith({})
  })

  it("retrieves and unwraps the existing cart when a cached id is valid", async () => {
    localStorage.setItem(CART_ID_STORAGE_KEY, "cart_existing")
    const cart = fakeCart({ id: "cart_existing" })
    mockCartClient.retrieve.mockResolvedValue({ cart })

    const result = await getOrCreateCart()

    expect(mockCartClient.retrieve).toHaveBeenCalledWith("cart_existing")
    expect(mockCartClient.create).not.toHaveBeenCalled()
    expect(result).toEqual(cart)
  })

  it("falls back to creating a new cart when the cached id no longer resolves", async () => {
    localStorage.setItem(CART_ID_STORAGE_KEY, "cart_stale")
    mockCartClient.retrieve.mockRejectedValue(new Error("not found"))
    const freshCart = fakeCart({ id: "cart_fresh" })
    mockCartClient.create.mockResolvedValue({ cart: freshCart })

    const result = await getOrCreateCart()

    expect(mockCartClient.create).toHaveBeenCalled()
    expect(result).toEqual(freshCart)
    expect(localStorage.getItem(CART_ID_STORAGE_KEY)).toBe("cart_fresh")
  })
})

describe("getCart", () => {
  it("returns null without calling the API when cartId is empty", async () => {
    const result = await getCart("")

    expect(result).toBeNull()
    expect(mockCartClient.retrieve).not.toHaveBeenCalled()
  })

  it("unwraps the cart from the retrieve response", async () => {
    const cart = fakeCart()
    mockCartClient.retrieve.mockResolvedValue({ cart })

    const result = await getCart("cart_123")

    expect(result).toEqual(cart)
  })

  it("propagates errors from the API", async () => {
    mockCartClient.retrieve.mockRejectedValue(new Error("boom"))

    await expect(getCart("cart_123")).rejects.toThrow("boom")
  })
})

describe("addToCart", () => {
  it("throws without calling the API when cartId is missing", async () => {
    await expect(addToCart("", "variant_1", 1)).rejects.toThrow(
      "Cart ID is required to add items"
    )
    expect(mockCartClient.createLineItem).not.toHaveBeenCalled()
  })

  it("calls createLineItem (singular) with a flat variant_id/quantity body", async () => {
    // Regression test: the SDK has no createLineItems (plural) method, and
    // it does not accept a wrapped `{ items: [...] }` body. Calling the
    // wrong method/shape used to throw for every real add-to-cart attempt.
    mockCartClient.createLineItem.mockResolvedValue({ cart: fakeCart() })

    await addToCart("cart_123", "variant_1", 2)

    expect(mockCartClient.createLineItem).toHaveBeenCalledWith("cart_123", {
      variant_id: "variant_1",
      quantity: 2,
    })
  })

  it("unwraps the cart from the response", async () => {
    // Regression test: every store.cart.* method resolves to
    // `{ cart: StoreCart }`, not the cart directly. Returning the response
    // unmodified meant `cart.id` / `cart.items` were always undefined.
    const cart = fakeCart({ items: [{ id: "item_1", quantity: 2 }] })
    mockCartClient.createLineItem.mockResolvedValue({ cart })

    const result = await addToCart("cart_123", "variant_1", 2)

    expect(result).toEqual(cart)
    expect(result.items).toHaveLength(1)
  })

  it("propagates errors from the API", async () => {
    mockCartClient.createLineItem.mockRejectedValue(new Error("out of stock"))

    await expect(addToCart("cart_123", "variant_1", 1)).rejects.toThrow(
      "out of stock"
    )
  })
})

describe("updateLineItem", () => {
  it("throws without calling the API when cartId is missing", async () => {
    await expect(updateLineItem("", "item_1", 3)).rejects.toThrow(
      "Cart ID is required to update items"
    )
    expect(mockCartClient.updateLineItem).not.toHaveBeenCalled()
  })

  it("calls updateLineItem (singular) with cartId, lineItemId, and a quantity-only body", async () => {
    mockCartClient.updateLineItem.mockResolvedValue({ cart: fakeCart() })

    await updateLineItem("cart_123", "item_1", 3)

    expect(mockCartClient.updateLineItem).toHaveBeenCalledWith(
      "cart_123",
      "item_1",
      { quantity: 3 }
    )
  })

  it("unwraps the cart from the response", async () => {
    const cart = fakeCart({ total: 999 })
    mockCartClient.updateLineItem.mockResolvedValue({ cart })

    const result = await updateLineItem("cart_123", "item_1", 3)

    expect(result).toEqual(cart)
  })
})

describe("removeFromCart", () => {
  it("throws without calling the API when cartId is missing", async () => {
    await expect(removeFromCart("", "item_1")).rejects.toThrow(
      "Cart ID is required to remove items"
    )
    expect(mockCartClient.deleteLineItem).not.toHaveBeenCalled()
  })

  it("calls deleteLineItem and returns the updated cart from `.parent`", async () => {
    // Regression test: deleting a line item responds with
    // `{ deleted, id, object, parent }`, not `{ cart }` like every other
    // cart endpoint. Reading `.cart` here would silently yield undefined.
    const updatedCart = fakeCart({ items: [] })
    mockCartClient.deleteLineItem.mockResolvedValue({
      deleted: true,
      id: "item_1",
      object: "line-item",
      parent: updatedCart,
    })

    const result = await removeFromCart("cart_123", "item_1")

    expect(mockCartClient.deleteLineItem).toHaveBeenCalledWith(
      "cart_123",
      "item_1"
    )
    expect(result).toEqual(updatedCart)
  })
})

describe("updateCart", () => {
  it("throws without calling the API when cartId is missing", async () => {
    await expect(updateCart("", { region_id: "reg_no" })).rejects.toThrow(
      "Cart ID is required to update cart"
    )
    expect(mockCartClient.update).not.toHaveBeenCalled()
  })

  it("calls update and unwraps the cart from the response", async () => {
    const cart = fakeCart({ region_id: "reg_no" })
    mockCartClient.update.mockResolvedValue({ cart })

    const result = await updateCart("cart_123", { region_id: "reg_no" })

    expect(mockCartClient.update).toHaveBeenCalledWith("cart_123", {
      region_id: "reg_no",
    })
    expect(result).toEqual(cart)
  })
})

describe("getShippingMethods", () => {
  it("returns null without calling the API when cartId is missing", async () => {
    const result = await getShippingMethods("")

    expect(result).toBeNull()
  })

  it("returns the shipping options for the cart", async () => {
    const methods = { shipping_options: [{ id: "so_1" }] }
    const listCartOptions = medusaClient.store.fulfillment
      .listCartOptions as ReturnType<typeof vi.fn>
    listCartOptions.mockResolvedValue(methods)

    const result = await getShippingMethods("cart_123")

    expect(listCartOptions).toHaveBeenCalledWith("cart_123")
    expect(result).toEqual(methods)
  })
})

describe("cart id persistence", () => {
  it("getCartId returns null when nothing is stored", () => {
    expect(getCartId()).toBeNull()
  })

  it("getCartId returns whatever was stored", () => {
    localStorage.setItem(CART_ID_STORAGE_KEY, "cart_abc")

    expect(getCartId()).toBe("cart_abc")
  })

  it("clearCartId removes the stored id", () => {
    localStorage.setItem(CART_ID_STORAGE_KEY, "cart_abc")

    clearCartId()

    expect(localStorage.getItem(CART_ID_STORAGE_KEY)).toBeNull()
  })
})
