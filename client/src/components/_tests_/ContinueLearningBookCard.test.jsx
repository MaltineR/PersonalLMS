import { render, screen, fireEvent } from '@testing-library/react';
import ContinueLearningBookCard from '../ContinueLearningBookCard';

const book = {
  title: 'The Alchemist',
  author: 'Paulo Coelho',
  genre: 'Fiction',
  pagesread: 50,
  totalpages: 100,
  readingstatus: 'reading',
};

test('renders book info correctly', () => {
  render(<ContinueLearningBookCard book={book} />);
  
  expect(screen.getByText('The Alchemist')).toBeInTheDocument();
  expect(screen.getByText('Paulo Coelho')).toBeInTheDocument();
  expect(screen.getByText('Genre: Fiction')).toBeInTheDocument();
  expect(screen.getByText('Reading')).toBeInTheDocument(); // status text
});

test('renders correct progress percentage', () => {
  render(<ContinueLearningBookCard book={book} />);
  
  expect(screen.getByText('50%')).toBeInTheDocument();
  expect(screen.getByText('50/100 pages')).toBeInTheDocument();
});

test('calls onClick when card is clicked', () => {
  const onClickMock = vi.fn();
  render(<ContinueLearningBookCard book={book} onClick={onClickMock} />);
  
  const card = screen.getByText('The Alchemist').closest('div');
  fireEvent.click(card);
  expect(onClickMock).toHaveBeenCalled();
});
