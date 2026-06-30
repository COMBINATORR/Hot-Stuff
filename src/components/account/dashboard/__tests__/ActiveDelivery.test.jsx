import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActiveDelivery } from '../ActiveDelivery';

describe('ActiveDelivery Component', () => {
  // Fix the mock to handle objects properly
  const mockT = (key, options) => {
    if (typeof options === 'string') {
      return options;
    }
    if (typeof options === 'object' && options !== null) {
      let text = options.defaultValue || key;
      if (key === 'account.delivery_order_num' && options.num) {
        return `Заказ №${options.num}`;
      }
      return Object.entries(options).reduce((acc, [k, v]) => {
        return typeof v === 'string' || typeof v === 'number'
          ? acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v)
          : acc;
      }, text);
    }
    return key;
  };

  it('renders empty state correctly when there are no active orders', () => {
    render(<ActiveDelivery activeOrders={[]} t={mockT} />);

    // Check if the title is rendered
    expect(screen.getByText('Текущая Доставка')).toBeInTheDocument();

    // Check if the empty state text is rendered
    expect(screen.getByText('У вас пока нет активных заказов.')).toBeInTheDocument();

    // Check if the privacy banner is rendered
    expect(screen.getByText('Гарантия 100% анонимности доставки:')).toBeInTheDocument();
  });

  it('renders active orders correctly when there are orders', () => {
    const mockOrders = [
      { id: 1, number: '12345', status: 'В пути', details: 'Доставка курьером завтра' },
      { id: 2, number: '67890', status: 'Обрабатывается', details: 'Ожидает сборки' }
    ];

    render(<ActiveDelivery activeOrders={mockOrders} t={mockT} />);

    // Check if the title is rendered
    expect(screen.getByText('Текущая Доставка')).toBeInTheDocument();

    // The empty state text should NOT be there
    expect(screen.queryByText('У вас пока нет активных заказов.')).not.toBeInTheDocument();

    // The first order details should be rendered
    expect(screen.getByText(/12345/)).toBeInTheDocument();
    expect(screen.getByText(/В пути/)).toBeInTheDocument();
    expect(screen.getByText('Доставка курьером завтра')).toBeInTheDocument();

    // The second order details should be rendered
    expect(screen.getByText(/67890/)).toBeInTheDocument();
    expect(screen.getByText(/Обрабатывается/)).toBeInTheDocument();
    expect(screen.getByText('Ожидает сборки')).toBeInTheDocument();

    // Check if the privacy banner is rendered
    expect(screen.getByText('Гарантия 100% анонимности доставки:')).toBeInTheDocument();
  });
});
