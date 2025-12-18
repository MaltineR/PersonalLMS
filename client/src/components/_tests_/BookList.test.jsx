import { render, screen } from '@testing-library/react';
import BookList from '../BookList';
import BookCard from '../BookCard';


vi.mock('../BookCard', () => ({
  default: ({ book }) => <div data-testid="book-card">{book.title}</div>,
}));

const books = [
  { _id: '1', title: 'The Alchemist' },
  { _id: '2', title: 'Harry Potter' },
  { _id: '3', title: '1984' },
];

test('renders the correct number of BookCards', () => {
  render(<BookList books={books} onDelete={() => {}} onUpdate={() => {}} onTogglePublic={() => {}} />);
  
  const renderedCards = screen.getAllByTestId('book-card');
  expect(renderedCards).toHaveLength(books.length);

  
  books.forEach((book) => {
    expect(screen.getByText(book.title)).toBeInTheDocument();
  });
});
