import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { OrderHistory } from '../OrderHistory';
import { ALL_PRODUCTS } from '../../../../data/products';

describe('OrderHistory Component', () => {
  const mockT = (key, defaultText) => {
    if (typeof defaultText === 'string') {
      return defaultText;
    }
    if (typeof defaultText === 'object' && defaultText !== null) {
      if (key === 'account.order_completed' && defaultText.num && defaultText.date) {
        return `Заказ №${defaultText.num} от ${defaultText.date}`;
      }
    }
    return key;
  };

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <OrderHistory
          orderHistory={[]}
          t={mockT}
          lang="ru"
          isPrivate={false}
          handleAddWishlistItem={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    );
  };

  it('renders empty state correctly with default catalog link', () => {
    renderComponent();

    expect(screen.getByText('История Покупок')).toBeInTheDocument();
    expect(screen.getByText('Вы еще ничего не заказывали.')).toBeInTheDocument();

    const catalogLink = screen.getByRole('link', { name: 'Перейти в каталог' });
    expect(catalogLink).toBeInTheDocument();
    expect(catalogLink).toHaveAttribute('href', '/catalog');
  });

  it('renders empty state with localized catalog link when lang is not ru', () => {
    renderComponent({ lang: 'kz' });

    const catalogLink = screen.getByRole('link', { name: 'Перейти в каталог' });
    expect(catalogLink).toHaveAttribute('href', '/kz/catalog');
  });

  it('renders order history correctly with non-empty array', () => {
    const mockOrders = [
      {
        id: 'o1',
        number: '123',
        date: '01.01.2024',
        itemsSummary: 'Вибратор INA Thrust',
        status: 'Доставлен',
        totalPrice: 15000,
        canRepeat: true,
        productId: ALL_PRODUCTS[0].id
      },
      {
        id: 'o2',
        number: '456',
        date: '15.01.2024',
        itemsSummary: 'Смазка',
        status: 'Отменен',
        totalPrice: 5000,
        canRepeat: false,
        productId: ALL_PRODUCTS[1].id
      }
    ];

    renderComponent({ orderHistory: mockOrders });

    expect(screen.queryByText('Вы еще ничего не заказывали.')).not.toBeInTheDocument();

    expect(screen.getByText('Заказ №123 от 01.01.2024')).toBeInTheDocument();
    expect(screen.getByText('Вибратор INA Thrust — Доставлен')).toBeInTheDocument();
    expect(screen.getByText(/15\s*000\s*₸/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Повторить в 1 клик' })).toBeInTheDocument();

    expect(screen.getByText('Заказ №456 от 15.01.2024')).toBeInTheDocument();
    expect(screen.getByText('Смазка — Отменен')).toBeInTheDocument();
    expect(screen.getAllByText(/5\s*000\s*₸/)[1]).toBeInTheDocument();
    expect(screen.getByText('Архив')).toBeInTheDocument();
  });

  it('renders private mode items correctly', () => {
    const mockOrders = [
      {
        id: 'o1',
        number: '123',
        date: '01.01.2024',
        itemsSummary: 'Вибратор INA Thrust',
        status: 'Доставлен',
        totalPrice: 15000,
        canRepeat: true,
        productId: ALL_PRODUCTS[0].id
      }
    ];

    renderComponent({ orderHistory: mockOrders, isPrivate: true });

    expect(screen.getByText('Деликатный аксессуар •••• x1 — Доставлен')).toBeInTheDocument();
    expect(screen.queryByText('Вибратор INA Thrust — Доставлен')).not.toBeInTheDocument();
  });

  it('calls handleAddWishlistItem with correct product when repeat button is clicked', async () => {
    const mockHandleAddWishlistItem = vi.fn();
    const targetProduct = ALL_PRODUCTS[0];

    const mockOrders = [
      {
        id: 'o1',
        number: '123',
        date: '01.01.2024',
        itemsSummary: 'Вибратор INA Thrust',
        status: 'Доставлен',
        totalPrice: 15000,
        canRepeat: true,
        productId: targetProduct.id
      }
    ];

    renderComponent({
      orderHistory: mockOrders,
      handleAddWishlistItem: mockHandleAddWishlistItem
    });

    const repeatButton = screen.getByRole('button', { name: 'Повторить в 1 клик' });
    await userEvent.click(repeatButton);

    expect(mockHandleAddWishlistItem).toHaveBeenCalledTimes(1);
    expect(mockHandleAddWishlistItem).toHaveBeenCalledWith(targetProduct);
  });
});
