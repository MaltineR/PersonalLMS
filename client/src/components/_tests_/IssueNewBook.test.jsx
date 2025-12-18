import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import IssueBook from "../modal/IssueNewBook";

describe("IssueBook", () => {
  it("renders modal correctly", () => {
    render(<IssueBook onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByText("Add New Book")).toBeInTheDocument();
    expect(screen.getByText("SUBMIT")).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();

    render(<IssueBook onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText("Name of book"), {
      target: { value: "Test Book" },
    });
    fireEvent.change(screen.getByPlaceholderText("Author Name"), {
      target: { value: "Author" },
    });
    fireEvent.change(screen.getByPlaceholderText("Genre"), {
      target: { value: "Fiction" },
    });
    fireEvent.change(screen.getByPlaceholderText("Total no. of pages"), {
      target: { value: 100 },
    });

    fireEvent.click(screen.getByText("Reading"));
    fireEvent.click(screen.getByText("SUBMIT"));

    expect(onSubmit).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();

    render(<IssueBook onClose={onClose} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(onClose).toHaveBeenCalled();
  });
});
