
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard"; // Fixed casing
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget"; // Changed from Budgets to Budget
import Goals from "./pages/Goals";
import { useAuth } from "./lib/auth";

function App() {
  const { user, loading } = useAuth(); // Changed isLoading to loading

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout>Dashboard</Layout>}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="budgets" element={<Budget />} />
        <Route path="goals" element={<Goals />} />
        {/* Removed Insights and Settings routes since they don't exist */}
      </Route>
    </Routes>
  );
}

export default App;
