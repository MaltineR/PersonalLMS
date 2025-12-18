import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BookCard from "../../BookCard";

const book = {
  _id: "1",
  title: "Test Book",
  author: "Author",
  genre: "Fiction",
  totalpages: 100,
  pagesread: 20,
  price: 0,
  public: false,
  readingstatus: "reading",
};

describe("BookCard Integration", () => {
  it("opens and closes the EditBook modal", () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();

    render(<BookCard book={book} onUpdate={handleUpdate} onDelete={handleDelete} />);

    
    const editButton = screen.getByLabelText("Edit book");
    fireEvent.click(editButton);

    
    expect(screen.getByText("Edit Book")).toBeInTheDocument();

    
    const closeButton = screen.getByRole("button", { name: /close modal/i });
fireEvent.click(closeButton);

    
    expect(screen.queryByText("Edit Book")).not.toBeInTheDocument();
  });
});
