import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/ui/page-header";

export function AnalyticsHeader() {
  return (
    <PageHeader variant="simple">
      <PageHeaderTitle gradient>Analytics</PageHeaderTitle>
      <PageHeaderDescription>
        Track your spending patterns and financial trends
      </PageHeaderDescription>
    </PageHeader>
  );
}
