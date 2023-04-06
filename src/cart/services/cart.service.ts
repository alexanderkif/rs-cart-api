import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart, CartBack, CartItem, Status } from '../models';
import { dbQuery } from './bdClient';

@Injectable()
export class CartService {
  private userCarts: Cart[] = [];

  async findByUserId(userId: string): Promise<Cart> {
    const res = await dbQuery(
      'select id, user_id, created_at, updated_at, status, array_to_json(array(select (product_id, product_count) as item from cart_items where cart_id = carts.id)) as items from carts where user_id = $1;',
      // 'select id, user_id, created_at, updated_at, status, (select * from array_to_json(array(select (product_id, product_count) as item from cart_items where cart_id = carts.id)) as items) from carts where user_id = $1',
      [userId]
    );
    if (!res?.rows[0]) {
      return null;
    }
    const items: CartItem[] = res.rows[0].items?.map(i => ({productId: i.f1, count: i.f2})) || [];

    return this.convertToFrontCart({...res.rows[0], items});
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = v4(v4());
    const res = await dbQuery(
      'insert into carts (id, user_id, created_at, updated_at, status) values ($1, $2, $3, $4, $5) returning *', [
        id,
        userId,
        new Date(),
        new Date(),
        Status.open
      ]
    );

    return this.convertToFrontCart(res.rows[0]);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }
    return this.createByUserId(userId);
  }

  async updateCart({cart, item, isNew}: {cart: Cart, item: CartItem, isNew: boolean}): Promise<Cart> {
    if (isNew) {
      await dbQuery(
        'insert into cart_items (cart_id, product_id, product_count) values ($1, $2, $3)',
        [cart.id, item.productId, item.count]
      )
      cart.items.push(item);
    } else {
      if (item.count < 1) {
        await dbQuery(
          'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2;',
          [cart.id, item.productId]
        )
        cart.items = cart.items.filter(i => i.count);
      } else {
        await dbQuery(
          'UPDATE cart_items SET product_count = $1 WHERE cart_id = $2 AND product_id = $3',
          [item.count, cart.id, item.productId]
        )
      }
    }

    const res = await dbQuery(
      'UPDATE carts SET updated_at = $1, status = $2 WHERE id = $3 and user_id = $4 returning *',
      [new Date(), cart.status, cart.id, cart.userId]
    )
    const updatedCart = res.rows[0];

    return this.convertToFrontCart({...updatedCart, items: cart.items});
  }

  removeByUserId(userId): void {
    this.userCarts[ userId ] = null;
  }

  convertToFrontCart(cart: CartBack): Cart {
    return {
      id: cart.id,
      userId: cart.user_id,
      items: cart.items || [],
      createdAt: cart.created_at,
      updatedAt: cart.updated_at,
      status: cart.status
    }
  }
}
