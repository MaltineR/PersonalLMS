import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from '../BookCard';
import EditPage from '../modal/EditBook';
import axios from 'axios';


vi.mock('axios');


vi.mock('../modal/EditBook', () => ({
  default: ({ book }) => <div data-testid="edit-modal">{book.title}</div>,
}));


beforeEach(() => {
  Storage.prototype.getItem = vi.fn(() => 'fake-token');
});

const book = {
  _id: '1',
  title: 'The Alchemist',
  author: 'Paulo Coelho',
  genre: 'Fiction',
  readingstatus: 'reading',
  pagesread: 50,
  totalpages: 100,
  public: false,
};

test('renders book title, author, genre and status', () => {
  render(<BookCard book={book} />);
  expect(screen.getByText('The Alchemist')).toBeInTheDocument();
  expect(screen.getByText('Paulo Coelho')).toBeInTheDocument();
  expect(screen.getByText('Genre: Fiction')).toBeInTheDocument();
  expect(screen.getByText('reading')).toBeInTheDocument();
});

test('renders correct progress bar width', () => {
  render(<BookCard book={book} />);
  const progressBar = screen.getByTestId('progress-bar');
  expect(progressBar).toHaveStyle('width: 50%');
});

test('opens edit modal on edit button click', () => {
  render(<BookCard book={book} />);
  const editButton = screen.getByRole('button', { name: /edit book/i });
  fireEvent.click(editButton);
  expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
});

test('calls onDelete when delete button is clicked', async () => {
  const onDeleteMock = vi.fn();
  render(<BookCard book={book} onDelete={onDeleteMock} />);
  const deleteButton = screen.getByText('x');
  fireEvent.click(deleteButton);
  
  await new Promise(process.nextTick);
  expect(onDeleteMock).toHaveBeenCalledWith('1');
});
