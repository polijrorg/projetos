import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, DollarSign, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  target?: number;
  targetLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'revenue' | 'enb' | 'nps' | 'success' | 'warning';
  className?: string;
}

export function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  progress, 
  target, 
  targetLabel,
  trend = 'neutral',
  variant = 'default',
  className 
}: MetricsCardProps) {
  const getIcon = () => {
    switch (variant) {
      case 'revenue': return <DollarSign className="h-5 w-5" />;
      case 'enb': return <Star className="h-5 w-5" />;
      case 'nps': return <Users className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'revenue': return 'text-poli-blue';
      case 'enb': return 'text-status-enb';
      case 'nps': return 'text-poli-yellow';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      default: return 'text-foreground';
    }
  };

  const progressValue = progress ?? (target ? (Number(value) / target) * 100 : undefined);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <div className="text-muted-foreground">
            {getIcon()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline gap-2 mb-2">
          <div className={cn("text-2xl font-bold", getValueColor())}>
            {value}
          </div>
          {target && (
            <div className="text-sm text-muted-foreground">
              / {targetLabel}
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-3">
            {subtitle}
          </p>
        )}
        
        {progressValue !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progressValue)}%</span>
            </div>
            <Progress 
              value={progressValue} 
              className={cn(
                "h-2",
                variant === 'revenue' && "text-poli-blue",
                variant === 'enb' && "text-status-enb",
                variant === 'nps' && "text-poli-yellow",
                variant === 'success' && "text-success",
                variant === 'warning' && "text-warning"
              )}
            />
          </div>
        )}
        
        {variant === 'enb' && Number(value) > 0 && (
          <Badge variant="enb" className="mt-2">
            <Star className="h-3 w-3 mr-1" />
            Excelente Não Basta!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}