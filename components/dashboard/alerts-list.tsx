// TODO: Replace with real alert system / push notifications

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export function AlertsList() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Alerts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          No alerts yet. You will see price, governance, and risk alerts here
          once real-time monitoring is enabled.
        </div>
      </CardContent>
    </Card>
  );
}
