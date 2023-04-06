export type Product = {
  id: string,
  title: string,
  description: string,
  price: number,
};

export type CartItem = {
  id?: string,
  cartId?: string,
  productId: string,
  count: number
}

export type Cart = {
  id: string,
  userId: string,
  items?: CartItem[],
  createdAt: Date,
  updatedAt: Date,
  status: Status
}

export type CartBack = {
  id: string,
  user_id: string,
  items: CartItem[],
  created_at: Date,
  updated_at: Date,
  status: Status,
}

export enum Status {
  open = 'OPEN',
  odered = 'ORDERED'
}
