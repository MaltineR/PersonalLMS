import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EditPage from "../modal/EditBook";

const book = {
  _id: "1",
  title: "The Alchemist",
  author: "Paulo Coelho",
  genre: "Fiction",
  totalpages: 100,
  pagesread: 50,
  price: 10,
  public: false,
  readingstatus: "reading",
};

describe("EditPage", () => {
  it("renders with book data", () => {
    render(<EditPage book={book} onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByDisplayValue("The Alchemist")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Paulo Coelho")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fiction")).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();

    render(<EditPage book={book} onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText("reading")); // select status
    fireEvent.click(screen.getByText("UPDATE"));

    expect(onSubmit).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();

    render(<EditPage book={book} onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByText("Edit Book").closest(".fixed"));

    expect(onClose).toHaveBeenCalled();
  });
});
