// TODO: Replace with real alert system / push notifications

import { MOCK_ALERTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, AlertTriangle, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

const ALERT_ICONS = {
  price: TrendingUp,
  liquidation: AlertTriangle,
  governance: Vote,
} as const;

const ALERT_BADGE_STYLES = {
  price: "border-zen-teal/40 text-zen-teal",
  liquidation: "border-destructive/40 text-destructive",
  governance: "border-chart-2/40 text-chart-2",
} as const;

export function AlertsList() {
  const alerts = MOCK_ALERTS;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Alerts
          </CardTitle>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            {alerts.filter((a) => !a.read).length} unread
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type];
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-md p-3",
                  alert.read ? "bg-transparent" : "bg-muted"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize shrink-0",
                    ALERT_BADGE_STYLES[alert.type]
                  )}
                >
                  {alert.type}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
