import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ModernTable } from '../ModernTable';

test('renders rows', () => {
  render(
    <ModernTable data={[{ id: 1, name: 'Ali' }]} columns={[{ key: 'name', title: 'Name' }]} />
  );
  expect(screen.getByText('Ali')).toBeTruthy();
});
