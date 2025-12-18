import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SideBar from "../SideBar";
import { AuthContext } from "../../hooks/AuthHOC";


const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


const renderWithContext = (user, initialRoute = "/dashboard") => {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <SideBar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("SideBar component", () => {
  it("shows loading state when user is null", () => {
    renderWithContext(null);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders normal user menu items", () => {
    const user = { role: "user" };

    renderWithContext(user);

    expect(screen.getByTitle("Dashboard")).toBeInTheDocument();
    expect(screen.getByTitle("My Library")).toBeInTheDocument();
    expect(screen.getByTitle("Explore")).toBeInTheDocument();

    expect(screen.queryByTitle("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("renders admin menu items", () => {
    const admin = { role: "admin" };

    renderWithContext(admin, "/admin");

    expect(screen.getByTitle("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByTitle("All Books")).toBeInTheDocument();
    expect(screen.getByTitle("All Users")).toBeInTheDocument();

    expect(screen.queryByTitle("My Library")).not.toBeInTheDocument();
  });

  it("navigates when menu item is clicked", () => {
    const user = { role: "user" };

    renderWithContext(user);

    const libraryButton = screen.getByTitle("My Library");
    fireEvent.click(libraryButton);

    expect(mockNavigate).toHaveBeenCalledWith("/mylibrary");
  });
});
