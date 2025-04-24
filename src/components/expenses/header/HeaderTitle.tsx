
interface HeaderTitleProps {
  className?: string;
}

export function HeaderTitle({ className }: HeaderTitleProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        Expenses
      </h1>
      <p className="text-sm text-muted-foreground">
        Manage and analyze your expenses
      </p>
    </div>
  );
}
